# -----------------------------
# STEP 1: IMPORTS
# -----------------------------
import ast
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# -----------------------------
# STEP 2: LOAD DATASET
# -----------------------------
# Make sure dataset.csv is in same folder
df = pd.read_csv("dataset.csv")

# Features (X) and target (y)
X = df.drop("ram_usage", axis=1)
y = df["ram_usage"]

# -----------------------------
# STEP 3: TRAIN-TEST SPLIT
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# STEP 4: TRAIN MODEL
# -----------------------------
model = RandomForestRegressor(
    n_estimators=100,   # number of trees
    max_depth=10,       # controls overfitting
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# STEP 5: EVALUATE MODEL
# -----------------------------
preds = model.predict(X_test)

mae = mean_absolute_error(y_test, preds)
print(f"Mean Absolute Error: {mae:.2f} MB")

# -----------------------------
# STEP 6: FEATURE IMPORTANCE
# -----------------------------
feature_names = X.columns
importances = model.feature_importances_

print("\nFeature Importance:")
for name, imp in zip(feature_names, importances):
    print(f"{name}: {imp:.3f}")

# -----------------------------
# STEP 7: FEATURE EXTRACTION FOR NEW CODE
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
# STEP 8: PREDICT NEW FILE
# -----------------------------
def predict_file(file_path):
    with open(file_path, "r") as f:
        code = f.read()

    features = extract_features(code)
    prediction = model.predict(features)[0]

    print(f"\nPredicted RAM usage: {prediction:.2f} MB")


# -----------------------------
# STEP 9: TEST ON A FILE
# -----------------------------
# Change this to any file you want

import joblib
joblib.dump(model, "ram_model.pkl")