# -----------------------------
# STEP 1: IMPORTS
# -----------------------------
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

model = joblib.load("model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    try:
        features = [
            data["code_length"],
            data["loops"],
            data["functions"],
            data["function_calls"],
            data["lists"],
            data["dicts"],
            data["conditions"],
            data["classes"],
            data["file_io_ops"],
            data["recursion_depth"],
            data["uses_numpy"],
            data["uses_pandas"],
            data["uses_torch"],
            data["uses_tensorflow"],
        ]
    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400

    prediction = model.predict([features])[0]

    return jsonify({
        "predicted_ram": round(float(prediction), 2)
    })


# -----------------------------
# STEP 4: RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)