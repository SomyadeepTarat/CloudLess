import subprocess
import time
import tempfile
import os


def run_docker(container, command):
    return subprocess.run(
        ["docker", "run", "--rm", container] + command,
        capture_output=True,
        text=True,
        timeout=15
    )


def execute_code(code, language="python"):
    start_time = time.time()

    try:
        if language == "python":
            result = run_python(code)

        elif language == "javascript":
            result = run_node(code)

        else:
            return "Unsupported language", "error", 0

        output = result.stdout if result.stdout else result.stderr
        status = "success" if result.returncode == 0 else "error"

    except subprocess.TimeoutExpired:
        output = "Execution timed out"
        status = "error"

    except Exception as e:
        output = str(e)
        status = "error"

    exec_time = round(time.time() - start_time, 3)
    return output, status, exec_time


# 🔹 Python via Docker
def run_python(code):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as f:
        f.write(code.encode())
        filename = f.name

    try:
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{filename}:/app/code.py",
                "python:3.9",
                "python", "/app/code.py"
            ],
            capture_output=True,
            text=True,
            timeout=15
        )
    finally:
        os.remove(filename)

    return result


# 🔹 Node.js via Docker
def run_node(code):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".js") as f:
        f.write(code.encode())
        filename = f.name

    try:
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{filename}:/app/code.js",
                "node:18",
                "node", "/app/code.js"
            ],
            capture_output=True,
            text=True,
            timeout=15
        )
    finally:
        os.remove(filename)

    return result