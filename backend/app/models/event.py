import enum
from datetime import datetime
from sqlalchemy import Enum
from ..extensions import db

class EventStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    ended = "ended"
    cancelled = "cancelled"

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=True)

    start_at = db.Column(db.DateTime, nullable=False)
    end_at = db.Column(db.DateTime, nullable=False)

    status = db.Column(Enum(EventStatus, name="event_status_enum"), nullable=False, default=EventStatus.draft)

    public_code = db.Column(db.String(32), unique=True, nullable=False, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "start_at": self.start_at.isoformat(),
            "end_at": self.end_at.isoformat(),
            "status": self.status.value,
            "public_code": self.public_code,
        }
