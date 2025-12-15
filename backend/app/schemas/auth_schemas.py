from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6, max=128))

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)

class TokenSchema(Schema):
    access_token = fields.String(required=True)
    refresh_token = fields.String(required=True)
    user = fields.Dict(required=True)
