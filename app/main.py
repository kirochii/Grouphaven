from fastapi import FastAPI, Query, HTTPException
import requests
import cv2
import mediapipe as mp
import numpy as np

app = FastAPI()
mp_face = mp.solutions.face_detection

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
        with mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
            results = face_detection.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            face_detected = results.detections is not None and len(results.detections) > 0
            return {"face_detected": face_detected}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in face detection: {e}")
