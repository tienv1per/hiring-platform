# Development Scripts

Convenient scripts to manage all services in the Job Portal project.

## Quick Start

### Start Everything
```bash
./start-all.sh
```
Starts all backend services + frontend in one command.

### Start Backend Only
```bash
./start-backend.sh
```
Starts auth-service, user-service, and job-service.

### Stop Everything
```bash
./stop-all.sh
```

### Stop Backend Only
```bash
./stop-backend.sh
```

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Auth Service | 8001 | http://localhost:8001 |
| User Service | 8002 | http://localhost:8002 |
| Job Service | 8003 | http://localhost:8003 |

## Logs

All service logs are saved to `./logs/` directory:
- `auth-service.log`
- `user-service.log`
- `job-service.log`
- `frontend.log`

### View Logs
```bash
# Follow a specific service log
tail -f logs/user-service.log

# View all logs
tail -f logs/*.log
```

## Process Management

PIDs are stored in `./logs/*.pid` files for easy process management.

## Troubleshooting

### Port Already in Use
If a port is already in use, stop all services first:
```bash
./stop-all.sh
```

Then identify and kill the process:
```bash
lsof -ti:8001  # Check port 8001
kill -9 $(lsof -ti:8001)  # Force kill
```

### Service Won't Start
Check the logs for errors:
```bash
cat logs/user-service.log
```

### Database Connection Issues
Make sure your `.env` file has correct database credentials.
