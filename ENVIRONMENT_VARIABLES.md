# Environment Variables Configuration

The Dome Client now supports environment variable overrides for all configuration options. This allows you to customize the application behavior without modifying configuration files directly.

## How It Works

1. The system loads the base configuration from `/config/default.js` (or the file specified by `NODE_ENV`)
2. Environment variables with the `DOME_` prefix are automatically applied as overrides
3. Values are automatically converted to appropriate types (strings, numbers, booleans)

## Environment Variable Naming Convention

- **Prefix**: All variables must start with `DOME_`
- **Nested Properties**: Use underscores to represent dot notation in the config
- **Case**: Use uppercase for environment variable names

### Examples:
- `DOME_NODE_PORT` → `node.port`
- `DOME_MOO_HOST` → `moo.host`
- `DOME_NODE_SESSION_SECRET` → `node.session.secret`

## Available Environment Variables

### Node Configuration
```bash
# Server mode: 'production', 'development', 'test', etc.
DOME_NODE_MODE=production

# Enable/disable connecting to any game server
DOME_NODE_CONNECTANYWHERE=false

# Server port (must run as root for port 80)
DOME_NODE_PORT=5000

# Server IP address (optional, for multi-IP servers)
DOME_NODE_IP=208.52.189.89

# Socket URL for client connections
DOME_NODE_SOCKETURL=http://localhost:5000

# SSL Socket URL (leave empty if not using SSL)
DOME_NODE_SOCKETURLSSL=

# Power-by header value
DOME_NODE_POWEREDBY=dome-client.js
```

### Session Configuration
```bash
# Session secret key (CHANGE THIS IN PRODUCTION!)
DOME_NODE_SESSION_SECRET=your-secret-key-here

# Session key name
DOME_NODE_SESSION_KEY=express.sid
```

### SSL Configuration (Optional)
```bash
# SSL port (typically 443)
DOME_SSL_PORT=443

# SSL private key file path
DOME_SSL_KEY=config/ssl/private.key

# SSL certificate file path
DOME_SSL_CERT=config/ssl/certificate.crt

# SSL certificate authority file path
DOME_SSL_CA=config/ssl/intermediate.crt
```

### Game Server (MOO) Configuration
```bash
# Game server name
DOME_MOO_NAME=HackerCore

# Game server host address
DOME_MOO_HOST=localhost

# Game server port
DOME_MOO_PORT=8888
```

### Autocomplete Configuration
```bash
# Autocomplete file for player class 'p'
DOME_AUTOCOMPLETE_P=config/ac/player.txt
```

### Version Configuration
```bash
# Major version number
DOME_VERSION_MAJOR=1

# Minor version number
DOME_VERSION_MINOR=2

# Build number (typically pulled from git hash automatically)
DOME_VERSION_BUILD=abc123
```

### Socket Buffer Configuration
```bash
# Maximum buffer size before flushing (bytes)
# Only complete lines are sent, but if buffer gets too large, incomplete lines are sent
DOME_SOCKETBUFFER_MAXSIZE=4096

# Flush interval in milliseconds (currently unused in line buffer mode)
DOME_SOCKETBUFFER_FLUSHINTERVAL=50
```

## Data Type Conversion

The system automatically converts environment variable values to appropriate types:

### Boolean Values
- `'true'`, `'1'` → `true`
- `'false'`, `'0'` → `false`

### Numbers
- Any numeric string → converted to number
- Example: `'5000'` → `5000`

### Strings
- All other values remain as strings

## Usage Examples

### Development Setup
```bash
export DOME_NODE_MODE=development
export DOME_NODE_PORT=3000
export DOME_MOO_HOST=dev.game.example.com
export DOME_MOO_PORT=9999
```

### Production with SSL
```bash
export DOME_NODE_MODE=production
export DOME_NODE_PORT=443
export DOME_SSL_PORT=443
export DOME_SSL_KEY=config/ssl/production.key
export DOME_SSL_CERT=config/ssl/production.crt
export DOME_MOO_HOST=prod.game.example.com
```

### Multi-tenant Setup
```bash
export DOME_NODE_CONNECTANYWHERE=true
export DOME_NODE_POWEREDBY=MyGameClient
export DOME_MOO_NAME=MyGame
```

### Docker Environment
```bash
# In your docker-compose.yml or Dockerfile
ENV DOME_NODE_MODE=production
ENV DOME_NODE_PORT=5000
ENV DOME_MOO_HOST=game-server
ENV DOME_MOO_PORT=8888
```

### Socket Buffer Optimization
```bash
# High-performance buffering (larger buffers, waits for complete lines)
DOME_SOCKETBUFFER_MAXSIZE=8192

# Low-latency buffering (smaller buffers, forces flush sooner if needed)
DOME_SOCKETBUFFER_MAXSIZE=1024

# Note: The buffer only sends complete lines terminated by newlines.
# If the buffer gets too large, incomplete lines are sent to prevent overflow.
```

## Debugging

When the application starts, it will log:
1. Which configuration file was loaded
2. All applied environment variable overrides

Example output:
```
Loading configuration from: production
Applied environment variable overrides:
  DOME_NODE_PORT=3000
  DOME_MOO_HOST=game.example.com
  DOME_MOO_PORT=9999
```

## Migration from Old System

The new system is fully backward compatible:
- Existing configuration files continue to work
- `NODE_ENV` still determines the base config file
- Environment variables are applied as overrides on top of the base config

No changes are required to existing deployments - environment variables are purely additive.
