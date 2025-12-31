import logging
import sys
from datetime import datetime

# ANSI Color Codes
RESET = "\033[0m"
RED = "\033[31m"        # ERROR
GREEN = "\033[32m"      # INFO
YELLOW = "\033[33m"     # WARNING
BLUE = "\033[34m"       # DEBUG
MAGENTA = "\033[35m"    # TRACE
CYAN = "\033[36m"       # SYSTEM/NETWORK

class ColoredLogger:
    @staticmethod
    def _get_timestamp():
        # Cyan timestamp like WS logs
        return f"\033[36m[{datetime.now().strftime('%H:%M:%S')}]\033[0m"

    @staticmethod
    def _log(color, level, context, msg):
        timestamp = ColoredLogger._get_timestamp()
        lvl = f"{color}[{level}]\033[0m"
        ctx = f"\033[35m[{context}]\033[0m"
        logging.info(f"{timestamp} {lvl} {ctx} - {msg}")

    @staticmethod
    def info(msg: str):
        ColoredLogger._log(GREEN, "INFO", "System", msg)

    @staticmethod
    def warning(msg: str):
        ColoredLogger._log(YELLOW, "WARNING", "System", msg)

    @staticmethod
    def error(msg: str):
        ColoredLogger._log(RED, "ERROR", "System", msg)

    @staticmethod
    def debug(msg: str):
        ColoredLogger._log(BLUE, "DEBUG", "System", msg)

    @staticmethod
    def trace(msg: str):
        ColoredLogger._log(MAGENTA, "TRACE", "System", msg)

    @staticmethod
    def success(msg: str):
        ColoredLogger._log(CYAN, "SUCCESS", "System", msg)

    @staticmethod
    def action(action: str, entity: str, entity_id: str, user: str, details: str = ""):
        """
        Log transaction in WS format: [TIME] [ACTION] [User | Entity] - Details
        """
        # Context is "User | Entity" to mimic "IP | Session"
        context = f"{user} | {entity}"
        msg = f"ID: {entity_id}"
        if details:
            msg += f" | {details}"
        
        # Action is the "Level"
        ColoredLogger._log(GREEN, action.upper(), context, msg)

# Export singleton or class
logger = ColoredLogger()
