import logging
import sys
import os

class GeventLogAdapter:
    """
    Adapts a Python logger to be used as a file-like object for Gevent.
    """
    def __init__(self, logger):
        self.logger = logger

    def write(self, msg):
        # Gevent writes access logs as strings.
        if msg and msg.strip():
            self.logger.info(msg.strip())
            
    def flush(self):
        # Required for file-like objects
        pass

def setup_access_logging():
    """
    Configures the 'gevent.access' logger and returns an adapter 
    compatible with socketio.run(..., log=adapter)
    """
    access_logger = logging.getLogger('gevent.access')
    
    # Check if handler already exists to verify duplication
    if not access_logger.handlers:
        # Force stdout to ensure it shows in the terminal immediately
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(message)s'))
        access_logger.addHandler(handler)
    
    # Default to environment level on startup
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    # Only enable access logs if in DEBUG mode
    system_log_level = logging.INFO if log_level == 'DEBUG' else logging.ERROR
    access_logger.setLevel(system_log_level)
    
    # Prevent propagation to avoid double logging
    access_logger.propagate = False
    
    return GeventLogAdapter(access_logger)
