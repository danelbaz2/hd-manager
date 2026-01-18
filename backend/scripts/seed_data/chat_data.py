"""
Seed data for chat messages entity.
"""

from datetime import datetime


def get_timestamp_ms():
    """Get current timestamp in milliseconds."""
    return int(datetime.now().timestamp() * 1000)


def get_chat_data(user_ids):
    """
    Generate chat messages seed data.
    
    Args:
        user_ids: List of user IDs to use as senders
    
    Returns:
        List of chat message dicts
    """
    if len(user_ids) < 2:
        return []
    
    now = get_timestamp_ms()
    
    return [
        {
            "senderUserId": user_ids[0],
            "message": "בוקר טוב לכולם!",
            "base": {
                "isDeleted": False,
                "isActive": True,
                "createdAt": now - 100000,
                "updatedAt": now - 100000,
                "entityType": "chat_message",
                "createdBy": "System Admin",
                "updatedBy": "System Admin"
            }
        },
        {
            "senderUserId": user_ids[1],
            "message": "בוקר אור, מה המצב?",
            "base": {
                "isDeleted": False,
                "isActive": True,
                "createdAt": now,
                "updatedAt": now,
                "entityType": "chat_message",
                "createdBy": "System Admin",
                "updatedBy": "System Admin"
            }
        }
    ]
