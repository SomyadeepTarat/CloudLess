import datetime
import os
import socket
import psutil


def timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log_info(message):
    print(f"[INFO {timestamp()}] {message}")


def log_error(message):
    print(f"[ERROR {timestamp()}] {message}")


def get_system_stats():
    virtual_memory = psutil.virtual_memory()

    return {
        "hostname": socket.gethostname(),
        "cpu": psutil.cpu_count() or 1,
        "ram": round(virtual_memory.total / (1024 ** 3), 2),
        "ram_bytes": virtual_memory.total,
        "ram_usage": round(virtual_memory.percent, 2),
        "cpu_usage": round(psutil.cpu_percent(interval=0.2), 2),
        "has_gpu": os.getenv("HAS_GPU", "false").lower() == "true",
    }
