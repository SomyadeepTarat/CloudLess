import joblib
import sys
import ast
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ram_model.pkl")

# -----------------------------
# LOAD TRAINED MODEL
# -----------------------------
model = joblib.load(MODEL_PATH)

# -----------------------------
# FEATURE EXTRACTION (UPDATED)
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

    uses_numpy = 0
    uses_pandas = 0
    uses_torch = 0
    uses_tensorflow = 0

    file_io_ops = 0
    recursion_depth = 0

    function_names = set()
    call_graph = {}

    # -----------------------------
    # FIRST PASS
    # -----------------------------
    for node in ast.walk(tree):

        # loops
        if isinstance(node, (ast.For, ast.While)):
            num_loops += 1

        # functions
        elif isinstance(node, ast.FunctionDef):
            num_functions += 1
            function_names.add(node.name)
            call_graph[node.name] = []

        # function calls
        elif isinstance(node, ast.Call):
            num_function_calls += 1

            # detect file I/O
            if isinstance(node.func, ast.Name):
                if node.func.id in ["open", "read", "write"]:
                    file_io_ops += 1

            # detect method calls like f.read()
            elif isinstance(node.func, ast.Attribute):
                if node.func.attr in ["read", "write", "readlines"]:
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

        elif isinstance(node, ast.ImportFrom):
            if node.module:
                if "numpy" in node.module:
                    uses_numpy = 1
                if "pandas" in node.module:
                    uses_pandas = 1
                if "torch" in node.module:
                    uses_torch = 1
                if "tensorflow" in node.module:
                    uses_tensorflow = 1

    # -----------------------------
    # SECOND PASS: BUILD CALL GRAPH
    # -----------------------------
    class CallVisitor(ast.NodeVisitor):
        def __init__(self):
            self.current_function = None

        def visit_FunctionDef(self, node):
            self.current_function = node.name
            self.generic_visit(node)

        def visit_Call(self, node):
            if isinstance(node.func, ast.Name):
                if self.current_function:
                    call_graph[self.current_function].append(node.func.id)
            self.generic_visit(node)

    CallVisitor().visit(tree)

    # -----------------------------
    # DETECT RECURSION DEPTH
    # -----------------------------
    def get_depth(func, visited):
        if func not in call_graph or func in visited:
            return 0
        visited.add(func)

        depths = []
        for callee in call_graph[func]:
            if callee == func:
                return 1  # direct recursion
            depths.append(get_depth(callee, visited.copy()))

        return 1 + max(depths, default=0)

    for func in function_names:
        recursion_depth = max(recursion_depth, get_depth(func, set()))

    # -----------------------------
    # FINAL FEATURE VECTOR
    # -----------------------------
    return [[
        len(code),
        num_loops,
        num_functions,
        num_function_calls,
        num_lists,
        num_dicts,
        num_conditions,
        num_classes,
        file_io_ops,
        recursion_depth,
        uses_numpy,
        uses_pandas,
        uses_torch,
        uses_tensorflow
    ]]

# -----------------------------
# CPU ESTIMATION (RULE-BASED)
# -----------------------------
def estimate_cpu(features):
    loops = features[0][1]
    calls = features[0][3]

    score = loops * 2 + calls

    if score < 10:
        return "Low"
    elif score < 30:
        return "Medium"
    else:
        return "High"

# -----------------------------
# GPU DETECTION
# -----------------------------
def needs_gpu(features):
    uses_torch = features[0][12]
    uses_tensorflow = features[0][13]

    return uses_torch or uses_tensorflow

# -----------------------------
# SYSTEM RECOMMENDER
# -----------------------------
def recommend_system(ram, cpu, gpu):

    if gpu:
        return {
            "RAM": "16+ GB",
            "CPU": "8+ cores",
            "GPU": "Required",
            "Suggestion": "Use GPU machine / cloud"
        }

    elif ram < 500 and cpu == "Low":
        return {
            "RAM": "4 GB",
            "CPU": "2 cores",
            "GPU": "No",
            "Suggestion": "Run on your laptop"
        }

    elif ram < 2000:
        return {
            "RAM": "8 GB",
            "CPU": "4-6 cores",
            "GPU": "Optional",
            "Suggestion": "Standard PC"
        }

    else:
        return {
            "RAM": "16 GB",
            "CPU": "8 cores",
            "GPU": "No",
            "Suggestion": "High-end machine"
        }


def analyze_code(code, file_path=None):
    features = extract_features(code)

    ram = float(model.predict(features)[0])
    cpu = estimate_cpu(features)
    gpu = bool(needs_gpu(features))
    system = recommend_system(ram, cpu, gpu)

    return {
        "file_path": file_path,
        "predicted_ram_mb": round(ram, 2),
        "cpu_load": cpu,
        "gpu_needed": gpu,
        "system": system
    }

# -----------------------------
# MAIN FUNCTION
# -----------------------------
def analyze_file(file_path):
    # Robust path handling: check if file exists, if not try common relative paths
    if not os.path.exists(file_path):
        # Case: User provides ../code_samples/script_1.py from ml/ directory
        if file_path.startswith("../") and os.path.exists(file_path[3:]):
            file_path = file_path[3:]
        # Case: User provides code_samples/script_1.py from project root
        elif not file_path.startswith("ml/") and os.path.exists(os.path.join("ml", file_path)):
            file_path = os.path.join("ml", file_path)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "r") as f:
        code = f.read()

    result = analyze_code(code, file_path)

    print("\n===== ANALYSIS =====")
    print(f"Predicted RAM: {result['predicted_ram_mb']:.2f} MB")
    print(f"CPU Load: {result['cpu_load']}")
    print(f"GPU Needed: {'Yes' if result['gpu_needed'] else 'No'}")

    print("\n===== RECOMMENDED SYSTEM =====")
    for k, v in result["system"].items():
        print(f"{k}: {v}")

    return result

# -----------------------------
# RUN FROM TERMINAL
# -----------------------------
if __name__ == "__main__":
    args = sys.argv[1:]
    json_mode = False

    if args and args[0] == "--json":
        json_mode = True
        args = args[1:]

    if len(args) < 1:
        print("Usage: python recommender.py <file.py>")
    else:
        try:
            result = analyze_file(args[0])
            if json_mode:
                print(json.dumps(result))
        except Exception as exc:
            if json_mode:
                print(json.dumps({"error": str(exc)}))
                sys.exit(1)
            raise
