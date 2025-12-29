import logging
import sys

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
    
    # Default to hidden/ERROR on startup
    access_logger.setLevel(logging.ERROR)
    
    # Prevent propagation to avoid double logging
    access_logger.propagate = False
    
    return GeventLogAdapter(access_logger)
