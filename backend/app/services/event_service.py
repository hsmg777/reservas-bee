import secrets
from flask import current_app
from ..extensions import db
from ..models import Event, EventStatus

class EventService:
    @staticmethod
    def _generate_public_code() -> str:
        return secrets.token_hex(16)

    @staticmethod
    def _public_url(public_code: str) -> str:
        base = (current_app.config.get("PUBLIC_BASE_URL") or "").rstrip("/")
        return f"{base}/evento/{public_code}"

    @staticmethod
    def _parse_status(status_str: str):
        status_str = (status_str or "draft").lower()
        try:
            return EventStatus(status_str)
        except Exception:
            return EventStatus.draft

    @staticmethod
    def create(data: dict) -> Event:
        status = EventService._parse_status(data.get("status"))

        for _ in range(10):
            code = EventService._generate_public_code()
            if not Event.query.filter_by(public_code=code).first():
                break
        else:
            raise ValueError("PUBLIC_CODE_GENERATION_FAILED")

        ev = Event(
            name=data["name"].strip(),
            description=(data.get("description") or None),
            start_at=data["start_at"],
            end_at=data["end_at"],
            status=status,
            public_code=code,
        )
        db.session.add(ev)
        db.session.commit()
        return ev

    @staticmethod
    def get(event_id: int) -> Event | None:
        return db.session.get(Event, event_id)

    @staticmethod
    def list() -> list[Event]:
        return Event.query.order_by(Event.start_at.desc()).all()

    @staticmethod
    def update(ev: Event, data: dict) -> Event:
        # update campos
        if "name" in data:
            ev.name = data["name"].strip()
        if "description" in data:
            ev.description = data["description"] or None
        if "start_at" in data:
            ev.start_at = data["start_at"]
        if "end_at" in data:
            ev.end_at = data["end_at"]
        if "status" in data:
            ev.status = EventService._parse_status(data["status"])

        # validación final de fechas (por si llega solo start o solo end)
        if ev.end_at <= ev.start_at:
            raise ValueError("end_at must be greater than start_at")

        db.session.commit()
        return ev

    @staticmethod
    def delete(ev: Event) -> None:
        db.session.delete(ev)
        db.session.commit()

    @staticmethod
    def serialize(ev: Event) -> dict:
        return {
            **ev.to_dict(),
            "public_url": EventService._public_url(ev.public_code),
            "qr_url": f"/api/events/{ev.id}/qr",
        }
