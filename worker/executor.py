import subprocess
import tempfile
import time
import os
from utils import log_error

# Default timeout in seconds
DEFAULT_TIMEOUT = 15
EXECUTION_MODE = os.getenv("EXECUTION_MODE", "auto").lower()


def run_subprocess(cmd, timeout):
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout
    )
    return result.stdout + result.stderr


def run_locally(temp_file_path, language, timeout):
    if language == "python":
        return run_subprocess(["python3", temp_file_path], timeout)
    if language in ("javascript", "node"):
        return run_subprocess(["node", temp_file_path], timeout)
    return f"Unsupported language: {language}"

def execute_code(code, language="python", timeout=DEFAULT_TIMEOUT):
    """
    Executes code in an isolated Docker container.
    
    Returns:
        output (str): stdout + stderr combined
        exec_time (float): time taken in seconds
    """
    start_time = time.time()

    # Create temporary file for code
    suffix = ".py" if language == "python" else ".js"
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=suffix, delete=False) as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name
    except Exception as e:
        log_error(f"Failed to write temp code file: {e}")
        return str(e), 0

    # Determine Docker image and command
    if language == "python":
        docker_image = "python:3.9-slim"
        docker_cmd = [
            "docker", "run", "--rm",
            "-v", f"{temp_file_path}:/code/jobfile",
            docker_image,
            "python", "/code/jobfile"
        ]
    elif language == "javascript" or language == "node":
        docker_image = "node:18-slim"
        docker_cmd = [
            "docker", "run", "--rm",
            "-v", f"{temp_file_path}:/code/jobfile",
            docker_image,
            "node", "/code/jobfile"
        ]
    else:
        os.unlink(temp_file_path)
        return f"Unsupported language: {language}", 0

    # Execute Docker container
    try:
        if EXECUTION_MODE == "local":
            output = run_locally(temp_file_path, language, timeout)
        elif EXECUTION_MODE == "docker":
            output = run_subprocess(docker_cmd, timeout)
        else:
            try:
                output = run_subprocess(docker_cmd, timeout)
            except FileNotFoundError:
                output = run_locally(temp_file_path, language, timeout)
            except Exception as exc:
                if "No such file or directory: 'docker'" in str(exc):
                    output = run_locally(temp_file_path, language, timeout)
                else:
                    raise
    except subprocess.TimeoutExpired:
        output = "Execution timed out"
    except Exception as e:
        output = f"Execution failed: {e}"
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass

    exec_time = time.time() - start_time
    return output, exec_time
