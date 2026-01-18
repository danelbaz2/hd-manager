"""
Timestamp utility functions.

Provides consistent timestamp handling across the application.
All timestamps are in milliseconds since Unix epoch for JavaScript compatibility.
"""

from datetime import datetime, timedelta


def get_timestamp_ms() -> int:
    """
    Get current timestamp in milliseconds since Unix epoch.
    
    This format is compatible with JavaScript Date objects.
    
    Returns:
        int: Current timestamp in milliseconds
    
    Example:
        >>> now = get_timestamp_ms()
        >>> print(now)  # 1737219600000
    """
    return int(datetime.now().timestamp() * 1000)


def get_relative_timestamp_ms(days: int = 0, hours: int = 0, minutes: int = 0) -> int:
    """
    Get a timestamp relative to now in milliseconds.
    
    Args:
        days: Days to add (negative for past)
        hours: Hours to add (negative for past)
        minutes: Minutes to add (negative for past)
        
    Returns:
        int: Relative timestamp in milliseconds
    
    Example:
        >>> # Timestamp for tomorrow
        >>> tomorrow = get_relative_timestamp_ms(days=1)
        >>> # Timestamp for 2 hours ago
        >>> two_hours_ago = get_relative_timestamp_ms(hours=-2)
    """
    delta = timedelta(days=days, hours=hours, minutes=minutes)
    return int((datetime.now() + delta).timestamp() * 1000)
