from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class EventCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=160))
    description = fields.String(required=False, allow_none=True)
    start_at = fields.DateTime(required=True) 
    end_at = fields.DateTime(required=True)
    status = fields.String(required=False)  

    @validates_schema
    def validate_dates(self, data, **kwargs):
        if data["end_at"] <= data["start_at"]:
            raise ValidationError("end_at must be greater than start_at", field_name="end_at")

class EventUpdateSchema(Schema):
    name = fields.String(required=False, validate=validate.Length(min=2, max=160))
    description = fields.String(required=False, allow_none=True)
    start_at = fields.DateTime(required=False)
    end_at = fields.DateTime(required=False)
    status = fields.String(required=False)

    @validates_schema
    def validate_dates(self, data, **kwargs):
        if "start_at" in data and "end_at" in data:
            if data["end_at"] <= data["start_at"]:
                raise ValidationError("end_at must be greater than start_at", field_name="end_at")

class EventSchema(Schema):
    id = fields.Int(required=True)
    name = fields.String(required=True)
    description = fields.String(allow_none=True)
    start_at = fields.String(required=True)
    end_at = fields.String(required=True)
    status = fields.String(required=True)
    public_code = fields.String(required=True)
    public_url = fields.String(required=True)
    qr_url = fields.String(required=True)

class EventListSchema(Schema):
    items = fields.List(fields.Nested(EventSchema), required=True)
