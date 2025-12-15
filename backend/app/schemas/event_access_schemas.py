from marshmallow import Schema, fields

class EventAccessCodeCreateSchema(Schema):
    label = fields.Str(required=False, allow_none=True)

class EventAccessCodeSchema(Schema):
    id = fields.Int()
    event_id = fields.Int()

    access_code = fields.Str()
    label = fields.Str(allow_none=True)

    is_enabled = fields.Bool()

    scan_count = fields.Int()
    last_scan_at = fields.DateTime(allow_none=True)

    created_by_user_id = fields.Int(allow_none=True)
    created_at = fields.DateTime()

    # útil para frontend
    access_url = fields.Str()
    qr_url = fields.Str()

class EventAccessCodeListSchema(Schema):
    items = fields.List(fields.Nested(EventAccessCodeSchema))

class AccessCheckResponseSchema(Schema):
    ok = fields.Bool()
    message = fields.Str()

    event = fields.Dict(allow_none=True)
    access = fields.Dict(allow_none=True)
