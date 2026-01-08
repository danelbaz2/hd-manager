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
        # Full date-time: 2026-01-08 13:00:28
        return f"\033[36m{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\033[0m"

    @staticmethod
    def _get_caller_info():
        # Get caller frame (stack depth depends on how we call _log)
        # _log (0) -> wrapper e.g. info (1) -> caller (2)
        try:
            # We need to go back 3 frames if we count extraction -> _log -> wrapper -> caller
            # But let's verify depth. 
            # If we call ColoredLogger._log directly from wrapper:
            # frame 0: _get_caller_info
            # frame 1: _log
            # frame 2: info/debug/etc (wrapper)
            # frame 3: CODE calling logger.info()
            frame = sys._getframe(3)
            
            module = frame.f_globals.get('__name__', 'unknown')
            # Simplify module to last part (e.g. backend.routes.users -> users)
            if '.' in module:
                module_short = module.split('.')[-1]
            else:
                module_short = module
                
            func = frame.f_code.co_name
            # If called at module level, func is <module>
            if func == '<module>':
                func = 'main'
                
            return f"[{module_short}] [{func}]"
        except ValueError:
            return "[unknown]"

    @staticmethod
    def _log(level_num, context, msg):
        caller = ColoredLogger._get_caller_info()
        
        # Make objects human readable
        if isinstance(msg, (dict, list)):
            import json
            try:
                # Format JSON with indentation and ensure non-ASCII characters (Hebrew) show correctly
                formatted_json = json.dumps(msg, indent=2, default=str, ensure_ascii=False)
                msg = f"\n{formatted_json}"
            except Exception:
                msg = str(msg)
        
        # We handle context styling here, but Timestamp/Level are handled by UniformFormatter
        final_msg = msg
        if context and context != "System":
             final_msg = f"\033[35m[{context}]\033[0m {msg}"
        
        # Use 'App' logger to distinguish from other libraries
        # UniformFormatter will pick up 'caller_info'
        logging.getLogger('App').log(level_num, final_msg, extra={'caller_info': caller})

    @staticmethod
    def info(msg: str):
        ColoredLogger._log(logging.INFO, "System", msg)

    @staticmethod
    def warning(msg: str):
        ColoredLogger._log(logging.WARNING, "System", msg)

    @staticmethod
    def error(msg: str):
        ColoredLogger._log(logging.ERROR, "System", msg)

    @staticmethod
    def debug(msg: str):
        ColoredLogger._log(logging.DEBUG, "System", msg)

    @staticmethod
    def trace(msg: str):
        ColoredLogger._log(logging.DEBUG, "System", msg)

    @staticmethod
    def success(msg: str):
        ColoredLogger._log(logging.INFO, "System", msg)

    @staticmethod
    def _reverse_hebrew(text: str) -> str:
        """
        Check if text contains Hebrew and reverse it for console display.
        This handles cases where LTR terminals display RTL text backwards.
        """
        if not text:
            return text
            
        # Hebrew unicode range: \u0590-\u05FF
        # Check if any character is in Hebrew block
        # Simple check using any() is faster than re for simple existence
        is_hebrew = any('\u0590' <= c <= '\u05FF' for c in text)
        
        if is_hebrew:
            return text[::-1]
        return text

    @staticmethod
    def action(action: str, entity: str, entity_id: str, user: str, details: str = ""):
        """
        Log transaction in WS format
        """
        # Fix Hebrew name display
        display_user = ColoredLogger._reverse_hebrew(user)
        
        context = f"{display_user} | {entity}"
        msg = f"ID: {entity_id}"
        if details:
            msg += f" | {details}"
        
        # Action is usually INFO level importance. We include Action in the message.
        # [ACTION] Message
        full_msg = f"\033[32m[{action.upper()}]\033[0m {msg}"
        ColoredLogger._log(logging.INFO, context, full_msg)

# Export singleton or class
logger = ColoredLogger()
