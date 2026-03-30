import requests
import time
import uuid
import os
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
from executor import execute_code
from utils import log_info, log_error, get_system_stats

# Config
SERVER_URL = os.getenv("SERVER_URL", "https://cloudless-server.onrender.com")
WORKER_ID = os.getenv("WORKER_ID", str(uuid.uuid4()))
POLL_INTERVAL = float(os.getenv("WORKER_POLL_INTERVAL", "1"))
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "2"))
REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "10"))

executor_pool = ThreadPoolExecutor(max_workers=MAX_WORKERS)
active_jobs = 0
active_jobs_lock = Lock()


def current_active_jobs():
    with active_jobs_lock:
        return active_jobs


def update_active_jobs(delta):
    global active_jobs
    with active_jobs_lock:
        active_jobs = max(0, active_jobs + delta)
        return active_jobs


def register():
    """Register worker with server"""
    try:
        stats = get_system_stats()
        data = {
            "worker_id": WORKER_ID,
            "cpu": stats["cpu"],
            "ram": stats["ram"],
            "status": "idle",
            "max_workers": MAX_WORKERS,
            "capabilities": {
                "gpu": stats["has_gpu"],
                "hostname": stats["hostname"]
            }
        }
        response = requests.post(f"{SERVER_URL}/nodes/register", json=data, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        log_info(f"Registered worker {WORKER_ID} to {SERVER_URL}")
    except Exception as e:
        log_error(f"Registration failed: {e}")


def heartbeat():
    """Send periodic CPU/RAM usage and worker status"""
    try:
        stats = get_system_stats()
        status = "busy" if current_active_jobs() >= MAX_WORKERS else "idle"
        response = requests.post(f"{SERVER_URL}/nodes/heartbeat", json={
            "worker_id": WORKER_ID,
            "cpu_usage": stats["cpu_usage"],
            "ram_usage": stats["ram_usage"],
            "available_slots": max(0, MAX_WORKERS - current_active_jobs()),
            "status": status
        }, timeout=REQUEST_TIMEOUT)
        if response.status_code == 400:
            log_info("Worker missing on server, registering again.")
            register()
            return
        response.raise_for_status()
    except Exception as e:
        log_error(f"Heartbeat failed: {e}")


def get_job():
    """Fetch a single job if there is a free executor slot"""
    if current_active_jobs() >= MAX_WORKERS:
        return None  # No free slot

    try:
        res = requests.get(
            f"{SERVER_URL}/jobs/job",
            params={"worker_id": WORKER_ID},
            timeout=REQUEST_TIMEOUT
        )
        res.raise_for_status()
        if res.status_code == 200 and res.json():
            return res.json()
    except Exception as e:
        log_error(f"Error fetching job: {e}")
    return None


def send_result(job_id, output, status, exec_time):
    """Send job result back to server"""
    try:
        data = {
            "job_id": job_id,
            "worker_id": WORKER_ID,
            "output": output,
            "status": status,
            "time_taken": exec_time
        }
        response = requests.post(f"{SERVER_URL}/jobs/result", json=data, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        log_info(f"Result sent for job {job_id} [{status}] in {exec_time:.2f}s")
    except Exception as e:
        log_error(f"Error sending result: {e}")


def handle_job(job):
    """Execute job code in isolated Docker container"""
    job_id = job.get("job_id")
    code = job.get("code")
    language = job.get("language", "python")

    update_active_jobs(1)

    stats = get_system_stats()
    log_info(f"Starting job {job_id} [{language}] | CPU: {stats['cpu_usage']}% | RAM: {stats['ram_usage']}%")

    try:
        output, exec_time = execute_code(code, language)
        status = "success"
    except TimeoutError:
        output = ""
        exec_time = 15.0  # match execute_code timeout
        status = "timeout"
    except Exception as e:
        output = str(e)
        exec_time = 0
        status = "failed"
    finally:
        update_active_jobs(-1)

    send_result(job_id, output, status, exec_time)
    log_info(f"Finished job {job_id} [{status}]")


def main():
    register()
    log_info(f"Worker started with {MAX_WORKERS} parallel job slots.")

    while True:
        heartbeat()

        job = get_job()
        if job:
            executor_pool.submit(handle_job, job)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
