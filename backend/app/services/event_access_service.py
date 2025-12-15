import os
import io
import secrets
from datetime import datetime

from ..extensions import db
from ..models import Event, EventAccessCode

class EventAccessService:
    @staticmethod
    def _frontend_base_url() -> str:
        # pon esto en tu .env (ej: https://reservasbee.com)
        return os.getenv("PUBLIC_BASE_URL", "https://beeconcertclub.com").rstrip("/")

    @classmethod
    def _access_url(cls, access_code: str) -> str:
        # Ruta FRONT que muestra “Bienvenido + nombre evento”
        # Ej: /security/access/:access_code
        return f"{cls._frontend_base_url()}/security/access/{access_code}"

    @staticmethod
    def _event_status_value(ev) -> str:
        v = ev.status.value if hasattr(ev.status, "value") else str(ev.status)
        return (v or "").lower()

    @staticmethod
    def _new_code() -> str:
        # Corto, URL-safe, único
        return secrets.token_urlsafe(10)

    @classmethod
    def serialize(cls, a: EventAccessCode) -> dict:
        return {
            "id": a.id,
            "event_id": a.event_id,
            "access_code": a.access_code,
            "label": a.label,
            "is_enabled": bool(a.is_enabled),
            "scan_count": int(a.scan_count or 0),
            "last_scan_at": a.last_scan_at,
            "created_by_user_id": a.created_by_user_id,
            "created_at": a.created_at,
            "access_url": cls._access_url(a.access_code),
            "qr_url": f"/api/events/{a.event_id}/access-codes/{a.id}/qr",
        }

    @classmethod
    def create(cls, event_id: int, label: str | None, created_by_user_id: int | None):
        ev = db.session.get(Event, event_id)
        if not ev:
            raise ValueError("EVENT_NOT_FOUND")

        # genera código único (reintentos por seguridad)
        for _ in range(5):
            code = cls._new_code()
            exists = EventAccessCode.query.filter_by(access_code=code).first()
            if not exists:
                a = EventAccessCode(
                    event_id=event_id,
                    access_code=code,
                    label=label,
                    is_enabled=True,
                    scan_count=0,
                    created_by_user_id=created_by_user_id,
                )
                db.session.add(a)
                db.session.commit()
                return a

        raise ValueError("CANNOT_GENERATE_UNIQUE_CODE")

    @staticmethod
    def list_by_event(event_id: int):
        ev = db.session.get(Event, event_id)
        if not ev:
            raise ValueError("EVENT_NOT_FOUND")

        return (
            EventAccessCode.query
            .filter_by(event_id=event_id)
            .order_by(EventAccessCode.id.desc())
            .all()
        )

    @staticmethod
    def get_by_id(event_id: int, access_id: int):
        a = EventAccessCode.query.filter_by(id=access_id, event_id=event_id).first()
        return a

    @classmethod
    def qr_png_for_access(cls, event_id: int, access_id: int) -> bytes:
        import qrcode

        a = cls.get_by_id(event_id, access_id)
        if not a:
            raise ValueError("NOT_FOUND")

        url = cls._access_url(a.access_code)
        img = qrcode.make(url)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf.read()

    @classmethod
    def check_access_atomic(cls, access_code: str):
        """
        Autoriza siempre si:
        - code existe
        - code habilitado
        - evento status == active
        y aumenta scan_count (atómico con lock).
        """
        a = (
            EventAccessCode.query
            .filter_by(access_code=access_code)
            .with_for_update()
            .first()
        )
        if not a:
            return False, None, None, "NOT_FOUND"

        ev = db.session.get(Event, a.event_id)
        if not ev:
            return False, None, None, "EVENT_NOT_FOUND"

        if not a.is_enabled:
            return False, ev, a, "CODE_DISABLED"

        if ev.status.value != "active":
            return False, ev, a, "EVENT_NOT_ACTIVE"


        a.scan_count = int(a.scan_count or 0) + 1
        a.last_scan_at = datetime.utcnow()
        db.session.commit()

        return True, ev, a, "ACCESS_GRANTED"
