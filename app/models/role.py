import enum


class RoleEnum(str, enum.Enum):
    """User roles for RBAC."""
    ADMIN = "admin"
    MEMBER = "member"
