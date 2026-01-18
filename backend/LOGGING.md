# Backend Logging System

This document outlines the logging levels and formats used in the HD Manager backend.

## Overview

The backend uses a unified logging format enforced by the **Root Logger**.  
All logs (Application, System, Socket, Access) follow this structure:

`TIMESTAMP LEVEL [Source] - Message`

- **TIMESTAMP**: `YYYY-MM-DD HH:MM:SS` (Cyan)
- **LEVEL**: `INFO`, `DEBUG`, `WARNING`, etc. (Color coded)
- **Source**: The logger name (e.g., `handler`, `socket.events`) or `[Module] [Function]` for application logs.

## Log Levels & Methods

The `logger` utility (`utils.logger.ColoredLogger`) provides the following methods:

| Method             | Maps to Level | Context        | Description & Usage                                                             |
| :----------------- | :------------ | :------------- | :------------------------------------------------------------------------------ |
| **`trace(msg)`**   | `DEBUG`       | System         | Extremely granular details for deep debugging.                                  |
| **`debug(msg)`**   | `DEBUG`       | System         | Standard debugging information. Objects (dict/list) are pretty-printed as JSON. |
| **`info(msg)`**    | `INFO`        | System         | General operational events (e.g., "Server started").                            |
| **`success(msg)`** | `INFO`        | System         | Positive confirmation events.                                                   |
| **`warning(msg)`** | `WARNING`     | System         | Non-critical issues or unexpected states.                                       |
| **`error(msg)`**   | `ERROR`       | System         | Critical failures, exceptions, or errors requiring attention.                   |
| **`action(...)`**  | `INFO`        | User \| Entity | **Business Logic Events**. Used to track user actions (Create, Update, Delete). |

## specialized Log Formats

### 1. Action Logs

Used for tracking user activity.
**Call:** `logger.action(Action, Entity, EntityId, UserId, Details)`
**Display:**

```text
2026-01-08 13:00:00 INFO [UserId | Entity] - [ACTION] ID: EntityId | Details
```

- **User Identification**: Uses `UserId` (e.g., MongoDB ObjectId).
- **Hebrew Support**: Hebrew names (if present) are visually reversed to display correctly in LTR consoles.

### 2. API Access Logs (HTTP)

Automatic logs for incoming HTTP requests (handled by `geventwebsocket`).
**Display:**

```text
2026-01-08 13:00:00 INFO [handler] - [IP_Address] METHOD /path/to/resource STATUS (Duration)
```

**Example:**
`... INFO [handler] - [127.0.0.1] GET /api/users 200 (15ms)`

- **Coloring**: HTTP Methods (GET=Green, POST=Yellow, etc.) and Status Codes (200=Green, 400/500=Red) are color-coded.

### 3. Socket Events

Connection lifecycle events (Connect, Disconnect, Join).
**Display:**

```text
2026-01-08 13:00:00 INFO [socket.events] - [CONNECT] [IP | SessionID] - Client connected
```

### 4. Socket Broadcasts

Real-time update broadcasts.
**Level**: `DEBUG` (Hidden in default `INFO` mode).
**Display:**

```text
2026-01-08 13:00:00 DEBUG [socket.broadcast] - Task update sent | task=...
```

## Configuration

### Environment Variables

| Variable        | Default | Description                                         |
| :-------------- | :------ | :-------------------------------------------------- |
| `LOG_LEVEL`     | `INFO`  | Initial log verbosity (DEBUG, INFO, WARNING, ERROR) |
| `LOG_REQUESTS`  | `false` | Initial state for HTTP request logging (true/false) |
| `ADMIN_API_KEY` | -       | API key required for runtime log control endpoints  |

### Log Level Configuration

| Setting   | Visible Logs                                                |
| :-------- | :---------------------------------------------------------- |
| `DEBUG`   | All (Trace, Debug, Info, Action, Access, Socket, Broadcast) |
| `INFO`    | Info, Action, Access, Socket, Warning, Error                |
| `WARNING` | Warning, Error                                              |
| `ERROR`   | Error only                                                  |

## Runtime Control (While Containers Are Running)

You can change logging settings **without restarting** the container using these endpoints:

### Change Log Level

```bash
# Syntax: GET /api/logger/<LEVEL>/<ADMIN_API_KEY>
# LEVEL: DEBUG, INFO, WARNING, ERROR

# Examples:
curl http://localhost:5000/api/logger/DEBUG/your-api-key   # Enable debug logs
curl http://localhost:5000/api/logger/INFO/your-api-key    # Normal mode
curl http://localhost:5000/api/logger/ERROR/your-api-key   # Only errors
```

### Toggle Request Logging (HTTP Access Logs)

```bash
# Syntax: GET /api/logger/requests/<STATE>/<ADMIN_API_KEY>
# STATE: on, off

# Examples:
curl http://localhost:5000/api/logger/requests/on/your-api-key   # Enable request logs
curl http://localhost:5000/api/logger/requests/off/your-api-key  # Disable request logs
```

### Test Log Output

```bash
# Generate test logs of all levels to verify configuration
curl http://localhost:5000/api/logger/test
```

## Notes

- All runtime changes are **in-memory only** and reset when the container restarts
- To persist settings, update the environment variables in `docker-compose.prod.yml`
- The `ADMIN_API_KEY` should be set to a secure value in production
