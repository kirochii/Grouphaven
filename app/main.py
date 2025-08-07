from fastapi import FastAPI, Query, HTTPException
import requests
import cv2
import numpy as np

app = FastAPI()

@app.get("/detect-faces")
async def detect_faces(image_url: str = Query(...)):
    try:
        res = requests.get(image_url)
        res.raise_for_status()
        image_np = np.frombuffer(res.content, np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching or decoding image: {e}")

    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        face_detected = len(faces) > 0
        return {"face_detected": face_detected}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in face detection: {e}")
