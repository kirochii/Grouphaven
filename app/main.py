from fastapi import FastAPI, HTTPException, Query
import face_recognition
import requests
import io

app = FastAPI()

@app.get("/detect-faces")
async def detect_faces(image_url: str = Query(..., description="URL of the image to analyze")):
    try:
        response = requests.get(image_url)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {e}")

    try:
        image = face_recognition.load_image_file(io.BytesIO(response.content))
        face_locations = face_recognition.face_locations(image)
        face_detected = len(face_locations) > 0
        return {"face_detected": face_detected}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {e}")
