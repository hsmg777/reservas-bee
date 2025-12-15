from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6, max=128))
    role = fields.String(
        required=True,
        validate=validate.OneOf(["user", "admin", "seguridad"], error="INVALID_ROLE")
    )

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)

class TokenSchema(Schema):
    access_token = fields.String(required=True)
    refresh_token = fields.String(required=True)
    token_type = fields.String(required=True)
    expires_in = fields.Integer(required=False)
    user = fields.Dict(required=True)


class UserSchema(Schema):
    id = fields.Integer(required=True)
    name = fields.String(required=True)
    email = fields.Email(required=True)
    role = fields.String(required=True)
    is_active = fields.Boolean(required=True)

class UsersListSchema(Schema):
    items = fields.List(fields.Nested(UserSchema), required=True)