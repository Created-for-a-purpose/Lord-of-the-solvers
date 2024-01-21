from fastapi import FastAPI
from joblib import load
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer 
from concrete.ml.deployment import FHEModelServer, FHEModelClient
from pydantic import BaseModel
import base64
from pathlib import Path
import numpy
import os
import requests
import json
import base64
import subprocess
import shutil
import time
import pandas as pd

current_dir = Path(__file__).parent

# Load the model
fhe_model = FHEModelServer(Path.joinpath(current_dir, "solver_fhe_model"))
tfidf_vectorizer = load("tfidf_vectorizer.joblib")

class PredictRequest(BaseModel):
    evaluation_key: str
    encrypted_encoding: str

# Initialize an instance of FastAPI
app = FastAPI()

@app.get("/generate-keys")
def keygen():
    print("Generating keys...")

    # different keys for every session_id
    session_id = numpy.random.randint(0, 2**32)
    fhe_api = FHEModelClient("solver_fhe_model", f".fhe_keys/{session_id}")
    fhe_api.load()

    # Generate a fresh key
    fhe_api.generate_private_and_evaluation_keys(force=True)
    evaluation_key = fhe_api.get_serialized_evaluation_keys()

    # Evaluation keys are large to share, so keep it in a tmp file
    numpy.save(f"tmp/tmp_evaluation_key_{session_id}.npy", evaluation_key)
    return session_id

@app.post("/encrypt")
def encode_quantize_encrypt(user_id, text):
    print("Encrypting...")
    if not user_id:
        raise gr.Error("You need to generate FHE keys first.")

    fhe_api = FHEModelClient("solver_fhe_model", f".fhe_keys/{user_id}")
    fhe_api.load()
    text = ["You are doing great work"]
    encodings = tfidf_vectorizer.transform(text).toarray()
    encrypted_quantized_encoding = fhe_api.quantize_encrypt_serialize(encodings)

    numpy.save(f"tmp/tmp_encrypted_quantized_encoding_{user_id}.npy", encrypted_quantized_encoding)
    return 1

@app.post("/solve")
def run_fhe(user_id):
    print("Solving your intent...")
    encoded_data_path = Path(f"tmp/tmp_encrypted_quantized_encoding_{user_id}.npy")
    if not user_id:
        raise gr.Error("You need to generate FHE keys first.")
    if not encoded_data_path.is_file():
        raise gr.Error("No encrypted data was found. Encrypt the data before trying to predict.")

    # Read encrypted_quantized_encoding from the file
    encrypted_quantized_encoding = numpy.load(encoded_data_path)

    # Read evaluation_key from the file
    evaluation_key = numpy.load(f"tmp/tmp_evaluation_key_{user_id}.npy")

    # Use base64 to encode the encodings and evaluation key
    encrypted_quantized_encoding = base64.b64encode(encrypted_quantized_encoding).decode()
    encoded_evaluation_key = base64.b64encode(evaluation_key).decode()

    query = {}
    query["evaluation_key"] = encoded_evaluation_key
    query["encrypted_encoding"] = encrypted_quantized_encoding
    headers = {"Content-type": "application/json"}
    response = requests.post(
        "http://localhost:8000/predict_intent", data=json.dumps(query), headers=headers
    )
    encrypted_prediction = base64.b64decode(response.json()["encrypted_prediction"])

    numpy.save(f"tmp/tmp_encrypted_prediction_{user_id}.npy", encrypted_prediction)
    return 1

@app.post("/decrypt")
def decrypt_prediction(user_id):
    print("Decrypting results...")
    encoded_data_path = Path(f"tmp/tmp_encrypted_prediction_{user_id}.npy")
    if not user_id:
        raise gr.Error("You need to generate FHE keys first.")
    if not encoded_data_path.is_file():
        raise gr.Error("No encrypted prediction was found. Run the prediction over the encrypted data first.")

    # Read encrypted_prediction from the file
    encrypted_prediction = numpy.load(encoded_data_path).tobytes()

    fhe_api = FHEModelClient("solver_fhe_model", f".fhe_keys/{user_id}")
    fhe_api.load()

    predictions = fhe_api.deserialize_decrypt_dequantize(encrypted_prediction)
    return predictions