# CloudLess Deployment

## Render

### Backend

- Deploy the server with `server/Dockerfile`
- Set `PORT=5001`
- Set `PYTHON_BIN=/usr/bin/python3`
- Attach Redis and set `REDIS_URL` from the Redis connection string

With `REDIS_URL` configured, worker nodes and jobs are shared across requests and survive backend restarts.

### Frontend

- Point `REACT_APP_API_URL` at your Render backend URL
- Point `REACT_APP_WS_URL` at the matching `wss://` URL

### Workers

Run on each machine:

```bash
export SERVER_URL="https://cloudless-rb2w.onrender.com"
export HAS_GPU=true   # or false
export MAX_WORKERS=2
python3 worker.py
```

## Local development

If `REDIS_URL` is not set, the server falls back to in-memory state for local development only.
