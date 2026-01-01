"""
Error handlers for MongoDB operation cancellations.

These errors occur when a client disconnects mid-request.
They are normal and expected - we just need to suppress the noise.
"""

import functools
from flask import jsonify
from pymongo.errors import AutoReconnect, NetworkTimeout

# Try to import _OperationCancelled - it's an internal error
try:
    from pymongo.errors import _OperationCancelled
except ImportError:
    # Fallback if the internal error isn't available
    _OperationCancelled = Exception


def handle_client_disconnect(f):
    """
    Decorator to gracefully handle client disconnection during MongoDB operations.
    
    When a client disconnects (refresh, navigation, socket reconnect), MongoDB's
    network layer raises an _OperationCancelled error. This decorator catches
    these errors and returns a 499 Client Closed Request status.
    
    Usage:
        @handle_client_disconnect
        def my_route():
            # MongoDB operations here
            pass
    """
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except _OperationCancelled:
            # Client disconnected - operation was cancelled
            # Return 499 Client Closed Request (nginx convention)
            return jsonify({
                "error": "Request cancelled",
                "message": "Client disconnected before operation completed"
            }), 499
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            # Connection was forcibly closed
            return jsonify({
                "error": "Connection reset",
                "message": "Client connection was reset"
            }), 499
        except (AutoReconnect, NetworkTimeout) as e:
            # MongoDB connection issues
            return jsonify({
                "error": "Database connection error",
                "message": str(e)
            }), 503
    return decorated_function


def suppress_client_disconnect_errors():
    """
    Context manager for suppressing client disconnect errors in cleanup code.
    
    Usage:
        with suppress_client_disconnect_errors():
            # Code that might fail if client disconnected
            broadcast_update(data)
    """
    import contextlib
    
    @contextlib.contextmanager
    def _suppress():
        try:
            yield
        except (_OperationCancelled, ConnectionResetError, 
                ConnectionAbortedError, BrokenPipeError):
            pass  # Silently ignore
    
    return _suppress()
