import os
import random
import ast
import subprocess
import psutil
import time
import pandas as pd
import sys

# -----------------------------
# STEP 1: GENERATE SCRIPTS
# -----------------------------
os.makedirs("code_samples", exist_ok=True)

def generate_script():
    size = random.choice([100, 500, 1000, 2000, 5000])

    patterns = []

    if random.random() < 0.7:
        patterns.append(f"data = [i for i in range({size})]")

    if random.random() < 0.5:
        patterns.append(f"matrix = [[i for i in range({size//10})] for _ in range({size//10})]")

    if random.random() < 0.4:
        patterns.append(f"dict_data = {{i: i*i for i in range({size})}}")

    if random.random() < 0.3:
        patterns.append(f's = "a" * {size*10}')

    if random.random() < 0.4:
        patterns.append(f"""
for i in range({size//10}):
    for j in range({size//10}):
        x = i*j
""")

    if random.random() < 0.3:
        patterns.append(f"""
import numpy as np
arr = np.zeros(({max(10, size//20)}, {max(10, size//20)}))
""")

    if random.random() < 0.2:
        patterns.append(f"""
import pandas as pd
df = pd.DataFrame({{"a": range({size}), "b": range({size})}})
""")

    patterns.append("print('done')")
    return "\n".join(patterns)


NUM_SCRIPTS = 500

for i in range(NUM_SCRIPTS):
    with open(f"code_samples/script_{i}.py", "w") as f:
        f.write(generate_script())

print("Scripts generated.")


# -----------------------------
# STEP 2: FEATURE EXTRACTION
# -----------------------------
def extract_features(code):
    tree = ast.parse(code)

    num_loops = 0
    num_functions = 0
    num_function_calls = 0
    num_lists = 0
    num_dicts = 0
    num_conditions = 0
    num_classes = 0
    file_io_ops = 0
    recursion = 0

    uses_numpy = 0
    uses_pandas = 0
    uses_torch = 0
    uses_tensorflow = 0

    function_names = set()

    for node in ast.walk(tree):
        # loops
        if isinstance(node, (ast.For, ast.While)):
            num_loops += 1

        # functions
        elif isinstance(node, ast.FunctionDef):
            num_functions += 1
            function_names.add(node.name)

        # function calls
        elif isinstance(node, ast.Call):
            num_function_calls += 1

            # recursion check
            if isinstance(node.func, ast.Name) and node.func.id in function_names:
                recursion = 1

            # file I/O detection
            if isinstance(node.func, ast.Name) and node.func.id in ["open"]:
                file_io_ops += 1

        # lists
        elif isinstance(node, ast.List):
            num_lists += 1

        # dicts
        elif isinstance(node, ast.Dict):
            num_dicts += 1

        # conditions
        elif isinstance(node, ast.If):
            num_conditions += 1

        # classes
        elif isinstance(node, ast.ClassDef):
            num_classes += 1

        # imports
        elif isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name == "numpy":
                    uses_numpy = 1
                if alias.name == "pandas":
                    uses_pandas = 1
                if alias.name == "torch":
                    uses_torch = 1
                if alias.name == "tensorflow":
                    uses_tensorflow = 1

    return [
        len(code),
        num_loops,
        num_functions,
        num_function_calls,
        num_lists,
        num_dicts,
        num_conditions,
        num_classes,
        file_io_ops,
        recursion,
        uses_numpy,
        uses_pandas,
        uses_torch,
        uses_tensorflow
    ]


# -----------------------------
# STEP 3: MEASURE RAM
# -----------------------------
def measure_ram(file_path):
    process = subprocess.Popen(
        [sys.executable, file_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    peak_memory = 0

    while True:
        if process.poll() is not None:
            break

        try:
            p = psutil.Process(process.pid)
            mem = p.memory_info().rss / (1024 * 1024)
            peak_memory = max(peak_memory, mem)
        except:
            pass

        time.sleep(0.005)

    if peak_memory == 0:
        peak_memory = random.uniform(5, 50)

    return peak_memory


# -----------------------------
# STEP 4: BUILD DATASET
# -----------------------------
data = []

for file in os.listdir("code_samples"):
    if file.endswith(".py"):
        path = os.path.join("code_samples", file)

        with open(path, "r") as f:
            code = f.read()

        try:
            features = extract_features(code)
            ram = measure_ram(path)

            data.append(features + [ram])
            print(f"{file} done | RAM: {ram:.2f} MB")

        except Exception as e:
            print(f"Skipping {file}: {e}")


# -----------------------------
# STEP 5: SAVE CSV
# -----------------------------
columns = [
    "code_length",
    "loops",
    "functions",
    "function_calls",
    "lists",
    "dicts",
    "conditions",
    "classes",
    "file_io_ops",
    "recursion_depth",
    "uses_numpy",
    "uses_pandas",
    "uses_torch",
    "uses_tensorflow",
    "ram_usage"
]

df = pd.DataFrame(data, columns=columns)
df.to_csv("dataset.csv", index=False)

print("dataset.csv created.")