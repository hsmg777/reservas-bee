from datetime import datetime
from ..extensions import db

class EventAccessCode(db.Model):
    __tablename__ = "event_access_codes"

    id = db.Column(db.Integer, primary_key=True)

    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False, index=True)

    access_code = db.Column(db.String(64), nullable=False, unique=True, index=True)
    label = db.Column(db.String(120), nullable=True)

    is_enabled = db.Column(db.Boolean, nullable=False, default=True)

    scan_count = db.Column(db.Integer, nullable=False, default=0)
    last_scan_at = db.Column(db.DateTime, nullable=True)

    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    event = db.relationship("Event", backref=db.backref("access_codes", lazy="dynamic"))
