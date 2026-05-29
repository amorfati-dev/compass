import uvicorn
import fastapi
from enum import Enum
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, create_engine, Session, select

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

app = fastapi.FastAPI()
sql_file_name = "compass.db"
sqlite_url = f"sqlite:///{sql_file_name}"
engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)