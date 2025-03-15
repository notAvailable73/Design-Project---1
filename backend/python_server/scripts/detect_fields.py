from ultralytics import YOLO
import cv2
import os
import sys

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory
parent_dir = os.path.dirname(current_dir)
# Path to the model
model_path = os.path.join(parent_dir, 'models', 'NID_fields_detector.pt')

model = YOLO(model_path)

def detect_fields(image_path): 
    image = cv2.imread(image_path)
    
    results = model(image)[0]
    
    required_fields = ['banglaName', 'birthDate', 'englishName', 'fatherName', 'motherName', 'numberNID']
    fields = {}
    
    for detection in results.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = detection
        if 0 <= int(class_id) < len(model.names):  # Ensure class_id is valid
            field_name = model.names[int(class_id)]
            if field_name in required_fields:
                fields[field_name] = (x1, y1, x2, y2)  
    
    return fields

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        fields = detect_fields(image_path)
        print(fields)
    else:
        print("Error: No image path provided.")
