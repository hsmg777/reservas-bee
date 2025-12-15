import io
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask import send_file
from flask_jwt_extended import jwt_required

from ..schemas.event_schemas import (
    EventCreateSchema,
    EventUpdateSchema,
    EventSchema,
    EventListSchema,
)
from ..services.event_service import EventService
from ..models import Event
from ..extensions import db
from ..common.rbac import roles_required

event_blp = Blueprint(
    "Events",
    "events",
    url_prefix="/api/events",
    description="Eventos + QR"
)

@event_blp.route("")
class EventsView(MethodView):
    # ✅ PUBLICO: listar eventos (si quieres, luego filtramos solo active)
    @event_blp.response(200, EventListSchema)
    def get(self):
        events = EventService.list()
        return {"items": [EventService.serialize(e) for e in events]}

    # ✅ SOLO ADMIN: crear evento
    @event_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    @event_blp.arguments(EventCreateSchema, location="json")
    @event_blp.response(201, EventSchema)
    def post(self, data):
        try:
            ev = EventService.create(data)
            return EventService.serialize(ev)
        except ValueError as e:
            abort(400, message=str(e))
        except Exception:
            abort(500, message="SERVER_ERROR")


@event_blp.route("/<int:event_id>")
class EventDetailView(MethodView):
    # ✅ PUBLICO: ver detalle por ID
    @event_blp.response(200, EventSchema)
    def get(self, event_id: int):
        ev = EventService.get(event_id)
        if not ev:
            abort(404, message="NOT_FOUND")
        return EventService.serialize(ev)

    # ✅ SOLO ADMIN: actualizar (PUT/PATCH)
    @event_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    @event_blp.arguments(EventUpdateSchema, location="json")
    @event_blp.response(200, EventSchema)
    def put(self, data, event_id: int):
        ev = EventService.get(event_id)
        if not ev:
            abort(404, message="NOT_FOUND")
        try:
            ev = EventService.update(ev, data)
            return EventService.serialize(ev)
        except ValueError as e:
            abort(400, message=str(e))
        except Exception:
            abort(500, message="SERVER_ERROR")

    @event_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    @event_blp.arguments(EventUpdateSchema, location="json")
    @event_blp.response(200, EventSchema)
    def patch(self, data, event_id: int):
        return self.put(data, event_id)

    # ✅ SOLO ADMIN: eliminar
    @event_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    @event_blp.response(204)
    def delete(self, event_id: int):
        ev = EventService.get(event_id)
        if not ev:
            abort(404, message="NOT_FOUND")
        EventService.delete(ev)
        return ""


@event_blp.route("/public/<string:public_code>")
class EventPublicView(MethodView):
    # ✅ PUBLICO: ver evento por public_code (para el scan)
    @event_blp.response(200, EventSchema)
    def get(self, public_code: str):
        ev = Event.query.filter_by(public_code=public_code).first()
        if not ev:
            abort(404, message="NOT_FOUND")
        return EventService.serialize(ev)


@event_blp.route("/<int:event_id>/qr")
class EventQRView(MethodView):
    # ✅ PUBLICO: QR PNG
    def get(self, event_id: int):
        import qrcode

        ev = db.session.get(Event, event_id)
        if not ev:
            abort(404, message="NOT_FOUND")

        url = EventService._public_url(ev.public_code)

        img = qrcode.make(url)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return send_file(
            buf,
            mimetype="image/png",
            as_attachment=False,
            download_name=f"event_{event_id}_qr.png",
        )
