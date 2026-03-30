import requests
import time
import uuid
import os
from concurrent.futures import ThreadPoolExecutor
from executor import execute_code
from utils import log_info, log_error, get_system_stats

# Read from environment or use default
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:5001")
WORKER_ID = str(uuid.uuid4())
POLL_INTERVAL = 2
MAX_WORKERS = 2  # parallel jobs

executor_pool = ThreadPoolExecutor(max_workers=MAX_WORKERS)


def register():
    try:
        stats = get_system_stats()
        data = {
            "worker_id": WORKER_ID,
            "cpu": stats["cpu"],
            "ram": stats["ram"],
            "status": "idle"
        }
        requests.post(f"{SERVER_URL}/nodes/register", json=data)
        log_info(f"Registered worker {WORKER_ID} to {SERVER_URL}")
    except Exception as e:
        log_error(f"Registration failed: {e}")


def heartbeat():
    try:
        stats = get_system_stats()
        requests.post(f"{SERVER_URL}/nodes/heartbeat", json={
            "worker_id": WORKER_ID,
            "cpu_usage": stats["cpu_usage"],
            "ram_usage": stats["ram_usage"]
        })
    except:
        pass


def get_job():
    try:
        res = requests.get(f"{SERVER_URL}/jobs/job", params={"worker_id": WORKER_ID})
        if res.status_code == 200 and res.json():
            return res.json()
    except Exception as e:
        log_error(f"Error fetching job: {e}")
    return None


def send_result(job_id, output, status, exec_time):
    try:
        data = {
            "job_id": job_id,
            "worker_id": WORKER_ID,
            "output": output,
            "status": status,
            "time_taken": exec_time
        }
        requests.post(f"{SERVER_URL}/jobs/result", json=data)
        log_info(f"Result sent for job {job_id}")
    except Exception as e:
        log_error(f"Error sending result: {e}")


def handle_job(job):
    job_id = job.get("job_id")
    code = job.get("code")
    language = job.get("language", "python")

    log_info(f"Executing job {job_id} [{language}]")

    output, status, exec_time = execute_code(code, language)

    send_result(job_id, output, status, exec_time)


def main():
    register()
    log_info("Worker started with parallel execution...")

    while True:
        heartbeat()

        job = get_job()
        if job:
            executor_pool.submit(handle_job, job)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()