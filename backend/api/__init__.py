# API Module
# This package provides versioned API endpoints

from flask import Blueprint

def create_api_router():
    """
    Creates a versioned API router that provides both:
    - /api/v1/* routes (new versioned format)
    - /api/* routes (backward compatible, aliases to v1)
    
    This allows gradual migration to versioned endpoints.
    """
    from routes import (
        tasks,
        users,
        contacts,
        history_entries,
        chat_messages,
        auth,
        primary_tags,
        secondary_tags,
        uploads,
        logs,
        military_hierarchy,
    )
    
    # All available route blueprints
    blueprints = [
        tasks.bp,
        users.bp,
        contacts.bp,
        history_entries.bp,
        chat_messages.bp,
        auth.bp,
        primary_tags.bp,
        secondary_tags.bp,
        uploads.bp,
        logs.bp,
        military_hierarchy.bp,
    ]
    
    return blueprints


def get_v1_prefix(original_prefix: str) -> str:
    """
    Converts /api/resource to /api/v1/resource
    Example: /api/tasks -> /api/v1/tasks
    """
    if original_prefix.startswith('/api/'):
        return original_prefix.replace('/api/', '/api/v1/', 1)
    return original_prefix
