import io
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask import send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..schemas.reservation_schemas import (
    ReservationCreateSchema,
    ReservationSchema,
    CheckinResponseSchema,
    ReservationListSchema,
)
from ..services.reservation_service import ReservationService
from ..extensions import db
from ..models import Reservation
from ..common.rbac import roles_required

reservation_blp = Blueprint(
    "Reservations",
    "reservations",
    url_prefix="/api/reservations",
    description="Reservas + Check-in + QR"
)

# ✅ PUBLICO: crear reserva por public_code de evento
@reservation_blp.route("/public/<string:public_code>")
class PublicReservationCreateView(MethodView):
    @reservation_blp.arguments(ReservationCreateSchema, location="json")
    @reservation_blp.response(201, ReservationSchema)
    def post(self, data, public_code: str):
        try:
            r = ReservationService.create_public_reservation(public_code, data)
            return ReservationService.serialize(r)
        except ValueError as e:
            abort(400, message=str(e))
        except Exception:
            abort(500, message="SERVER_ERROR")


# ✅ PUBLICO: QR PNG de la reserva (para descargar/preview)
@reservation_blp.route("/<int:reservation_id>/qr")
class ReservationQRView(MethodView):
    def get(self, reservation_id: int):
        try:
            png = ReservationService.qr_png_for_reservation(reservation_id)
        except ValueError:
            abort(404, message="NOT_FOUND")

        buf = io.BytesIO(png)
        buf.seek(0)
        return send_file(
            buf,
            mimetype="image/png",
            as_attachment=False,
            download_name=f"reservation_{reservation_id}_qr.png",
        )


@reservation_blp.route("/checkin/<string:reservation_code>")
class ReservationCheckinView(MethodView):
    @reservation_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("seguridad", "admin")
    @reservation_blp.response(200, CheckinResponseSchema)
    def post(self, reservation_code: str):
        scanned_by = get_jwt_identity()

        ok, r, msg = ReservationService.checkin_atomic(
            reservation_code=reservation_code,
            scanned_by_user_id=int(scanned_by) if scanned_by is not None else None,
        )

        return {
            "ok": bool(ok),
            "message": msg,
            "reservation_id": r.id if r else None,
            "used_at": r.used_at if (r and r.used_at) else None,
            "reservation": {
                "id": r.id,
                "first_name": r.first_name,
                "last_name": r.last_name,
                "status": r.status.value if getattr(r.status, "value", None) else str(r.status),
                "used_at": r.used_at if r.used_at else None,
            } if r else None,
        }

@reservation_blp.route("/event/<int:event_id>")
class ReservationsByEventView(MethodView):
    @reservation_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @roles_required("seguridad", "admin")
    @reservation_blp.response(200, ReservationListSchema)
    def get(self, event_id: int):
        try:
            items = ReservationService.list_by_event(event_id)
            return {
                "total": len(items),
                "items": [ReservationService.serialize(r) for r in items],
            }
        except ValueError as e:
            if str(e) == "EVENT_NOT_FOUND":
                abort(404, message="EVENT_NOT_FOUND")
            abort(400, message=str(e))
        except Exception:
            abort(500, message="SERVER_ERROR")