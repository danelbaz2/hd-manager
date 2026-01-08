import logging
import sys
import os
import re
from datetime import datetime

class UniformFormatter(logging.Formatter):
    """
    Custom formatter to match the requested format:
    YYYY-MM-DD HH:MM:SS LEVEL [Source] Message
    """
    def format(self, record):
        timestamp = datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S')
        
        # Determine color based on level
        color = "\033[32m" # Green (INFO)
        if record.levelno == logging.DEBUG:
            color = "\033[34m" # Blue for the Level Label
        elif record.levelno == logging.WARNING:
            color = "\033[33m" # Yellow
        elif record.levelno == logging.ERROR:
            color = "\033[31m" # Red
        
        reset = "\033[0m"
        cyan = "\033[36m"
        
        # Simplify logger name (source)
        # e.g. geventwebsocket.handler -> geventwebsocket
        source = record.name
        if '.' in source:
           source = source.split('.')[-1]
            
        # Format: TIMESTAMP LEVEL [Source/Caller] Message
        
        # Check if caller_info was passed via extra
        if hasattr(record, 'caller_info'):
            # record.caller_info already has brackets like [module] [method]
            prefix = record.caller_info
        else:
            # Use logger name for system logs
            prefix = f"[{source}]"
            
        
        message = record.getMessage()
        
        # Check if this is a web access log (gevent/werkzeug) to prettify
        # Pattern matches: IP - - [Date] "METHOD URL PROTO" STATUS SIZE DURATION
        # We rely on source name or regex match
        if "handler" in source or (source == "access" and "HTTP" in message):
             # Regex to extract parts
             match = re.match(r'^(\S+) - - \[.*?\] "(.*?) (.*?) .*?" (\d+) (\S+) ?(.*)?', message)
             if match:
                 ip, method, url, status, size, duration = match.groups()
                 
                 # Colorize Method
                 method_color = "\033[37m" # White
                 if method == "GET": method_color = "\033[32m" # Green
                 elif method == "POST": method_color = "\033[33m" # Yellow
                 elif method == "PUT": method_color = "\033[34m" # Blue
                 elif method == "DELETE": method_color = "\033[31m" # Red
                 
                 # Colorize Status
                 status_int = int(status)
                 status_color = "\033[32m" # Green
                 if 300 <= status_int < 400: status_color = "\033[36m" # Cyan
                 elif 400 <= status_int < 500: status_color = "\033[33m" # Yellow
                 elif status_int >= 500: status_color = "\033[31m" # Red
                 
                 # Format Duration (if present)
                 dur_str = ""
                 if duration:
                     try:
                         # Try float conversion
                         d = float(duration.strip())
                         if d < 1:
                             dur_str = f"({d*1000:.0f}ms)"
                         else:
                             dur_str = f"({d:.2f}s)"
                     except:
                         dur_str = f"({duration.strip()})"

                 # Reformat message: [IP] METHOD URL - STATUS (Time)
                 # Shorter URL if too long? No, full URL is useful.
                 message = f"\033[35m[{ip}]\033[0m {method_color}{method}\033[0m {url} {status_color}{status}\033[0m {dur_str}"

        
        # Apply Grey color to message body for DEBUG logs (keep label Blue)
        if record.levelno == logging.DEBUG:
            msg_grey = "\033[90m"
            # Re-apply grey after any reset code in the message
            message = f"{msg_grey}{message.replace(reset, reset + msg_grey)}{reset}"

        formatted = f"{cyan}{timestamp}{reset} {color}{record.levelname}{reset} {prefix} - {message}"
        return f"\u202A{formatted}\u202C"

def setup_access_logging():
    """
    Configures the root logger to catch all logs (app + libraries)
    and format them uniformly.
    """
    root_logger = logging.getLogger()
    
    # Remove existing handlers to avoid duplicates/default formatting
    if root_logger.handlers:
        for handler in root_logger.handlers:
            root_logger.removeHandler(handler)
            
    # Add our uniform handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(UniformFormatter())
    root_logger.addHandler(handler)
    
    # Configure gevent access logger to propagate to root
    # But ensure it doesn't duplicate if it has its own handler
    access_logger = logging.getLogger('gevent.access')
    access_logger.propagate = True
    # Clean up its handlers so it uses root's
    if access_logger.handlers:
        for h in access_logger.handlers:
            access_logger.removeHandler(h)
            
    # Also clean werkzeug handlers
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.propagate = True
    if werkzeug_logger.handlers:
        for h in werkzeug_logger.handlers:
            werkzeug_logger.removeHandler(h)

    # Set default level
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    system_log_level = logging.INFO if log_level == 'DEBUG' else logging.INFO # INFO is safer default than ERROR for access logs
    if log_level == 'ERROR':
        system_log_level = logging.ERROR
        
    root_logger.setLevel(system_log_level)
    
    # Return nothing, adapter no longer needed as we rely on standard logging
    return None
