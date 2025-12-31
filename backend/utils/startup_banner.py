import os

def print_banner():
    """
    Prints the startup banner in red if running in the reloader process.
    """
    # Only print in the reloader process
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        return

    RED = "\033[91m"
    RESET = "\033[0m"
    
    # Use raw string for the art to avoid escape sequence issues
    art = r"""
    _    ____  ____    ___ ____    ____  _____    _    ____ __   __
   / \  |  _ \|  _ \  |_ _| ___|  |  _ \| ____|  / \  |  _ \\ \ / /
  / _ \ | |_) | |_) |  | ||___ \  | |_) |  _|   / _ \ | | | |\ V / 
 / ___ \|  __/|  __/   | | ___) | |  _ <| |___ / ___ \| |_| | | |  
/_/   \_\_|   |_|     |___|____/  |_| \_\_____/_/   \_\____/  |_|  
"""
    print(f"{RED}{art}{RESET}")
