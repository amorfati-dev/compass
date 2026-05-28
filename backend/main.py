import uvicorn
import fastapi
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timezone

class PositionType(str, Enum):
    ARISTOCRAT = "aristocrat"
    KING = "king"
    TURNAROUND = "turnaround"

class Status(str, Enum):
    UNREVIEWED = "unreviewed"
    THESIS_VALID = "thesis_valid"
    WATCHOUT = "watchout"
    THESIS_BROKEN = "thesis_broken"

class ThesisCreate(BaseModel):
    ticker: str
    name: str
    type: PositionType
    thesis: str
    kill_criterion: str

class Thesis(ThesisCreate):
    id: int
    status: Status = Status.UNREVIEWED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

app = fastapi.FastAPI()

@app.get("/")
def read_root():
    return {"status": "OK!"}

@app.post("/theses")
def create_thesis(thesis_data: ThesisCreate) -> Thesis:
    new_thesis = Thesis(id=1, **thesis_data.model_dump())
    return new_thesis

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)