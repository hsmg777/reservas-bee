import enum
from datetime import datetime
from sqlalchemy import Enum, ForeignKey
from ..extensions import db

class ReservationStatus(str, enum.Enum):
    created = "created"
    cancelled = "cancelled"
    checked_in = "checked_in"

class Reservation(db.Model):
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)

    # vínculo con evento
    event_id = db.Column(db.Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)

    # datos invitado
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), nullable=False, index=True)  # NO UNIQUE
    phone = db.Column(db.String(40), nullable=False)
    instagram = db.Column(db.String(120), nullable=True)

    # QR único por reserva
    reservation_code = db.Column(db.String(64), unique=True, nullable=False, index=True)

    status = db.Column(Enum(ReservationStatus, name="reservation_status_enum"), nullable=False, default=ReservationStatus.created)

    # control de uso (solo 1 vez)
    used_at = db.Column(db.DateTime, nullable=True)
    scanned_by_user_id = db.Column(db.Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scan_count = db.Column(db.Integer, nullable=False, default=0)
    last_scan_at = db.Column(db.DateTime, nullable=True)

    # email audit
    email_sent_at = db.Column(db.DateTime, nullable=True)
    email_send_status = db.Column(db.String(30), nullable=True)  # sent/failed
    email_error = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "instagram": self.instagram,
            "reservation_code": self.reservation_code,
            "status": self.status.value,
            "used_at": self.used_at.isoformat() if self.used_at else None,
            "scan_count": self.scan_count,
            "last_scan_at": self.last_scan_at.isoformat() if self.last_scan_at else None,
            "email_sent_at": self.email_sent_at.isoformat() if self.email_sent_at else None,
            "email_send_status": self.email_send_status,
            "created_at": self.created_at.isoformat(),
        }
