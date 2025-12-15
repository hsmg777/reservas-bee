import io
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask import send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..common.rbac import roles_required
from ..schemas.event_access_schemas import (
    EventAccessCodeCreateSchema,
    EventAccessCodeSchema,
    EventAccessCodeListSchema,
    AccessCheckResponseSchema,
)
from ..services.event_access_service import EventAccessService

# 1) Admin: crear/listar/qr dentro del evento
event_access_blp = Blueprint(
    "EventAccessCodes",
    "event_access_codes",
    url_prefix="/api/events",
    description="QR ilimitado por evento (admin)"
)

@event_access_blp.route("/<int:event_id>/access-codes")
class EventAccessCodesView(MethodView):
    @event_access_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    @event_access_blp.response(200, EventAccessCodeListSchema)
    def get(self, event_id: int):
        try:
            items = EventAccessService.list_by_event(event_id)
            return {"items": [EventAccessService.serialize(a) for a in items]}
        except ValueError as e:
            abort(404, message=str(e))

    @event_access_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    @event_access_blp.arguments(EventAccessCodeCreateSchema, location="json")
    @event_access_blp.response(201, EventAccessCodeSchema)
    def post(self, data, event_id: int):
        try:
            created_by = get_jwt_identity()
            a = EventAccessService.create(
                event_id=event_id,
                label=data.get("label"),
                created_by_user_id=int(created_by) if created_by is not None else None,
            )
            return EventAccessService.serialize(a)
        except ValueError as e:
            msg = str(e)
            code = 404 if msg in ("EVENT_NOT_FOUND",) else 400
            abort(code, message=msg)

@event_access_blp.route("/<int:event_id>/access-codes/<int:access_id>/qr")
class EventAccessCodeQRView(MethodView):
    @event_access_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("admin")
    def get(self, event_id: int, access_id: int):
        try:
            png = EventAccessService.qr_png_for_access(event_id, access_id)
        except ValueError:
            abort(404, message="NOT_FOUND")

        buf = io.BytesIO(png)
        buf.seek(0)
        return send_file(
            buf,
            mimetype="image/png",
            as_attachment=False,
            download_name=f"event_{event_id}_access_{access_id}_qr.png",
        )

# 2) Seguridad/Admin: check (autoriza + incrementa)
access_check_blp = Blueprint(
    "AccessCheck",
    "access_check",
    url_prefix="/api/access-codes",
    description="Scan + autorización (seguridad/admin)"
)

@access_check_blp.route("/check/<string:access_code>")
class AccessCheckView(MethodView):
    @access_check_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("seguridad", "admin")
    @access_check_blp.response(200, AccessCheckResponseSchema)
    def post(self, access_code: str):
        ok, ev, a, msg = EventAccessService.check_access_atomic(access_code)

        return {
            "ok": bool(ok),
            "message": msg,
            "event": {
                "id": ev.id,
                "name": ev.name,
                "status": ev.status.value,
                "start_at": ev.start_at,
                "end_at": ev.end_at,
            } if ev else None,
            "access": {
                "id": a.id,
                "event_id": a.event_id,
                "label": a.label,
                "scan_count": a.scan_count,
                "last_scan_at": a.last_scan_at,
                "is_enabled": a.is_enabled,
            } if a else None,
        }

