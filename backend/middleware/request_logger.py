"""
Request Logger Middleware

Provides clean, human-readable API request logging.
Shows method, endpoint, status, and duration in a color-coded format.
"""
import time
from flask import request, g
from functools import wraps

# ANSI color codes
COLORS = {
    'reset': '\033[0m',
    'bold': '\033[1m',
    'dim': '\033[2m',
    # Methods
    'GET': '\033[92m',       # Bright green
    'POST': '\033[93m',      # Bright yellow  
    'PUT': '\033[94m',       # Bright blue
    'PATCH': '\033[96m',     # Bright cyan
    'DELETE': '\033[91m',    # Bright red
    # Status codes
    '2xx': '\033[92m',       # Green (success)
    '3xx': '\033[96m',       # Cyan (redirect)
    '4xx': '\033[93m',       # Yellow (client error)
    '5xx': '\033[91m',       # Red (server error)
    # Other
    'time': '\033[90m',      # Gray
    'path': '\033[97m',      # White
    'arrow': '\033[90m',     # Gray
}


def get_status_color(status_code: int) -> str:
    """Get color for status code"""
    if status_code < 300:
        return COLORS['2xx']
    elif status_code < 400:
        return COLORS['3xx']
    elif status_code < 500:
        return COLORS['4xx']
    else:
        return COLORS['5xx']


def format_duration(seconds: float) -> str:
    """Format duration in human-readable format"""
    if seconds < 0.001:
        return f"{seconds * 1000000:.0f}µs"
    elif seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    else:
        return f"{seconds:.2f}s"


def init_request_logger(app, logger):
    """
    Initialize request logging middleware.
    
    Args:
        app: Flask application
        logger: Logger instance to use for output
    """
    
    @app.before_request
    def log_request_start():
        """Record request start time"""
        g.request_start_time = time.time()
    
    @app.after_request
    def log_request_end(response):
        """Log request details after response"""
        # Skip static files and health checks
        if request.path.startswith('/static') or request.path == '/health':
            return response
        
        # Calculate duration
        duration = time.time() - getattr(g, 'request_start_time', time.time())
        
        # Get colors
        method = request.method
        method_color = COLORS.get(method, COLORS['reset'])
        status_color = get_status_color(response.status_code)
        reset = COLORS['reset']
        dim = COLORS['dim']
        
        # Format the log line
        # Format: ► POST /api/users → 201 (45ms)
        log_line = (
            f"{dim}►{reset} "
            f"{method_color}{method:6}{reset} "
            f"{request.path} "
            f"{dim}→{reset} "
            f"{status_color}{response.status_code}{reset} "
            f"{dim}({format_duration(duration)}){reset}"
        )
        
        # Add query string if present (for GET requests)
        if request.query_string and method == 'GET':
            query = request.query_string.decode('utf-8')[:50]  # Truncate long queries
            if len(request.query_string) > 50:
                query += '...'
            log_line = (
                f"{dim}►{reset} "
                f"{method_color}{method:6}{reset} "
                f"{request.path}{dim}?{query}{reset} "
                f"{dim}→{reset} "
                f"{status_color}{response.status_code}{reset} "
                f"{dim}({format_duration(duration)}){reset}"
            )
        
        # Log based on status code level
        if response.status_code >= 500:
            logger.error(log_line)
        elif response.status_code >= 400:
            logger.warning(log_line)
        else:
            logger.info(log_line)
        
        return response
    
    return app
