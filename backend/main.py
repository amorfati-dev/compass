import uvicorn
import fastapi
from enum import Enum
from datetime import datetime, timezone, timedelta
from sqlmodel import SQLModel, Field, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware
import secrets, hashlib, base64
from urllib.parse import urlencode
from fastapi.responses import RedirectResponse
import httpx


PARQET_CLIENT_ID = "019f1299-7180-70e0-90fc-4812392dbe0e"
PARQET_REDIRECT_URI = "http://localhost:8000/auth/parqet/callback"
PARQET_AUTH_URL = "https://connect.parqet.com/oauth2/authorize"
PARQET_TOKEN_URL = "https://connect.parqet.com/oauth2/token"

# --- transienter Stash: state -> verifier (Dev-Qualität) ---
pending: dict[str, str] = {}

class PositionType(str, Enum):
    ARISTOCRAT = "aristocrat"
    KING = "king"
    TURNAROUND = "turnaround"
    ETF = "etf"
    CASH = "cash"
    FONDS = "fonds"
    BONDS = "bonds"
    COMMODITIES = "commodities"
    OTHER = "other"

class Status(str, Enum):
    UNREVIEWED = "unreviewed"
    THESIS_VALID = "thesis_valid"
    WATCHOUT = "watchout"
    THESIS_BROKEN = "thesis_broken"

class ThesisCreate(SQLModel):
    ticker: str
    name: str
    type: PositionType
    thesis: str
    kill_criterion: str

class Thesis(ThesisCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: Status = Status.UNREVIEWED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PositionCreate(SQLModel):
    broker: str
    ticker: str
    type: PositionType
    name: str
    number_of_shares: int
    entry_price: float
    expected_dividend_per_share: float

class Position(PositionCreate, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class ParqetToken(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    access_token: str
    refresh_token: str | None = None
    expires_at: datetime 
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

app = fastapi.FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
sql_file_name = "compass.db"
sqlite_url = f"sqlite:///{sql_file_name}"
engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_valid_token():
    with Session(engine) as session:
        parqet_token = session.exec(select(ParqetToken)).first()
        if parqet_token is None:
            raise fastapi.HTTPException(status_code=401, detail="No valid token found")

        if parqet_token.expires_at < datetime.now(timezone.utc):
            # --- Token abgelaufen → mit refresh_token erneuern ---
            response = httpx.post(
                PARQET_TOKEN_URL,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": parqet_token.refresh_token,   # Schlüssel heißt refresh_token
                    "client_id": PARQET_CLIENT_ID,
                    # kein code_verifier, kein redirect_uri
                },
            )
            response.raise_for_status()
            tokens = response.json()

            # --- die BESTEHENDE Zeile überschreiben (kein neues Objekt!) ---
            parqet_token.access_token = tokens["access_token"]
            parqet_token.refresh_token = tokens.get("refresh_token")
            parqet_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=tokens["expires_in"])
            session.commit()   # SQLModel erkennt: bekannte Zeile geändert → UPDATE

        return parqet_token.access_token

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"status": "OK!"}

@app.post("/theses")
def create_thesis(thesis_data: ThesisCreate) -> Thesis:
    new_thesis = Thesis(**thesis_data.model_dump())
    with Session(engine) as session:   
        session.add(new_thesis)
        session.commit()
        session.refresh(new_thesis)
    return new_thesis

@app.get("/theses")
def get_theses() -> list[Thesis]:
    with Session(engine) as session:
        theses = session.exec(select(Thesis)).all()
        return theses

@app.get("/theses/{thesis_id}")
def get_thesis(thesis_id: int) -> Thesis:
    with Session(engine) as session:
        thesis = session.get(Thesis, thesis_id)
        if thesis is None:
            raise fastapi.HTTPException(status_code=404, detail="Thesis not found")
        return thesis

@app.patch("/theses/{thesis_id}")
def update_thesis(thesis_id: int, new_status: Status) -> Thesis:
    with Session(engine) as session:
        thesis = session.get(Thesis, thesis_id)
        if thesis is None:
            raise fastapi.HTTPException(status_code=404, detail="Thesis not found")
        thesis.status = new_status
        session.commit()
        return thesis

@app.delete("/theses/{thesis_id}", status_code=204)
def delete_thesis(thesis_id: int) -> None:
    with Session(engine) as session:
        thesis = session.get(Thesis, thesis_id)
        if thesis is None:
            raise fastapi.HTTPException(status_code=404, detail="Thesis not found")
        session.delete(thesis)
        session.commit()

@app.post("/positions")
def create_position(position_data: PositionCreate) -> Position:
    new_position = Position(**position_data.model_dump())
    with Session(engine) as session:
        session.add(new_position)
        session.commit()
        session.refresh(new_position)
    return new_position

@app.get("/positions")
def get_positions() -> list[Position]:
    with Session(engine) as session:
        positions = session.exec(select(Position)).all()
        return positions

@app.delete("/positions/{ticker}", status_code=204)
def delete_position(ticker: str) -> None:
    with Session(engine) as session:
        positions = session.exec(select(Position).where(Position.ticker == ticker)).all()
        for position in positions:
            session.delete(position)
        session.commit()

@app.get("/auth/parqet/login")
def login_parqet():
        # 1 · verifier: dein geheimes Passwort
    verifier = secrets.token_urlsafe(32)

    # 2 · challenge: der Fingerabdruck davon
    digest = hashlib.sha256(verifier.encode()).digest()        # verifier -> bytes -> sha256 -> rohe hash-bytes
    challenge = base64.urlsafe_b64encode(digest).decode().rstrip("=")  # bytes -> url-safe text, padding "=" weg

    # 3 · state: zweiter Zufallsstring gegen CSRF
    state = secrets.token_urlsafe(32)

    # 4 · verifier wegstashen, auffindbar über state
    pending[state] = verifier

    # 5 · Authorize-URL bauen und Browser dorthin weiterleiten
    params = {
        "response_type": "code",
        "client_id": PARQET_CLIENT_ID,
        "redirect_uri": PARQET_REDIRECT_URI,
        "scope": "portfolio:read",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    return RedirectResponse(url=f"{PARQET_AUTH_URL}?{urlencode(params)}")

@app.get("/auth/parqet/callback")
def callback_parqet(code: str, state: str):
    if state not in pending:
        raise fastapi.HTTPException(status_code=400, detail="Invalid state")
    verifier = pending.pop(state)
 
    # --- Job 3: Marke + verifier gegen Token tauschen (server-to-server) ---
    response = httpx.post(
        PARQET_TOKEN_URL,
        data={                                    # data= → form-urlencoded (NICHT json=)
            "grant_type": "authorization_code",
            "code": code,
            "code_verifier": verifier,            # jetzt kommt das Passwort raus
            "client_id": PARQET_CLIENT_ID,
            "redirect_uri": PARQET_REDIRECT_URI,  # byte-genau wie in /login
        },
    )
    response.raise_for_status()                   # bei 4xx/5xx sofort Fehler werfen
    tokens = response.json()                      # {"access_token":..., "refresh_token":..., "expires_in":...}

    # --- expires_at ausrechnen: jetzt + Gültigkeitsdauer in Sekunden ---
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=tokens["expires_in"])

    # --- in die DB speichern (dasselbe Muster wie bei Thesis) ---
    with Session(engine) as session:
        session.add(ParqetToken(
            access_token=tokens["access_token"],
            refresh_token=tokens.get("refresh_token"),   # .get() → None falls fehlt
            expires_at=expires_at,
        ))
        session.commit()

    return {"status": "connected"}



        
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)