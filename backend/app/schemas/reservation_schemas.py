from marshmallow import Schema, fields, validate

class ReservationCreateSchema(Schema):
    first_name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    last_name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    phone = fields.String(required=True, validate=validate.Length(min=6, max=40))
    instagram = fields.String(required=False, allow_none=True, validate=validate.Length(max=120))

class ReservationSchema(Schema):
    id = fields.Int(required=True)
    event_id = fields.Int(required=True)

    first_name = fields.String(required=True)
    last_name = fields.String(required=True)
    email = fields.String(required=True)
    phone = fields.String(required=True)
    instagram = fields.String(allow_none=True)

    reservation_code = fields.String(required=True)
    status = fields.String(required=True)

    used_at = fields.String(allow_none=True)
    scan_count = fields.Int(required=True)
    last_scan_at = fields.String(allow_none=True)

    email_sent_at = fields.String(allow_none=True)
    email_send_status = fields.String(allow_none=True)

    created_at = fields.String(required=True)

    checkin_url = fields.String(required=True)
    qr_url = fields.String(required=True)

class ReservationListSchema(Schema):
    items = fields.List(fields.Nested(ReservationSchema), required=True)



class CheckinReservationMiniSchema(Schema):
    id = fields.Int()
    first_name = fields.Str()
    last_name = fields.Str()
    status = fields.Str()
    used_at = fields.DateTime(allow_none=True)

class CheckinResponseSchema(Schema):
    ok = fields.Bool(required=True)                
    message = fields.Str(required=True)
    reservation_id = fields.Int(allow_none=True)
    used_at = fields.DateTime(allow_none=True)
    reservation = fields.Nested(CheckinReservationMiniSchema, allow_none=True) 


class ReservationListSchema(Schema):
    total = fields.Int(required=True)
    items = fields.List(fields.Nested(ReservationSchema), required=True)
