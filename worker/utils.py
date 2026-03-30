import datetime
import psutil


def timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log_info(message):
    print(f"[INFO {timestamp()}] {message}")


def log_error(message):
    print(f"[ERROR {timestamp()}] {message}")


def get_system_stats():
    return {
        "cpu": f"{psutil.cpu_count()} cores",
        "ram": f"{round(psutil.virtual_memory().total / (1024**3), 2)} GB",
        "cpu_usage": psutil.cpu_percent(interval=0.5),
        "ram_usage": psutil.virtual_memory().percent
    }