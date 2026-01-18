"""
Authentication decorators for route protection
Re-exports from utils.jwt_utils for backward compatibility
"""

from utils.jwt_utils import (
    jwt_required,
    admin_required,
    self_or_admin_required,
)

__all__ = [
    'jwt_required',
    'admin_required',
    'self_or_admin_required',
]
