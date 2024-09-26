import os
import tempfile
from fastapi import APIRouter, UploadFile, HTTPException
from ultralytics import YOLO
import base64
from fastapi.responses import JSONResponse
import json

gingivitis_model = YOLO('./gingi.pt', task="classify")

router = APIRouter()

@router.post('/gingivitis')
async def gingivitis_detection(file: UploadFile = None):
    if file is None:
        raise HTTPException(status_code=400, detail="No file provided")
    try:
        if file:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
                temp_file.write(file.file.read())

            predict = gingivitis_model(temp_file.name)
            js = predict[0].tojson()
            predict_dict = json.loads(js)
            name = predict_dict[0]["name"]
            confidence = predict_dict[0]["confidence"]
            print(name)

            predict[0].save('./gingivitis-class.jpg')
            os.remove(temp_file.name)
            with open('./gingivitis-class.jpg', "rb") as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

            result = {'status': 'success', 'generatedImage': encoded_image, 'class': name, 'conf': confidence}
            os.remove('./gingivitis-class.jpg')
            return JSONResponse(content=result)
        else:
            return {'status': 'error with file'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))