from ultralytics import YOLO
import cv2

# Load the model
model = YOLO('models/NID_fields_detector.pt')

def detect_fields(image_path):
    # Load image
    image = cv2.imread(image_path)
    
    # Detect fields
    results = model(image)[0]
    
    # Extract detected fields
    required_fields = ['banglaName', 'birthDate', 'englishName', 'fatherName', 'motherName', 'numberNID']
    fields = {}
    for detection in results.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = detection
        if 0 <= int(class_id) < len(model.names):  # Check if class_id is valid
            field_name = model.names[int(class_id)]
            if field_name in required_fields:
                fields[field_name] = (x1, y1, x2, y2)
    
    return fields

if __name__ == "__main__":
    image_path = 'NID_image.png'  # Replace with your image path
    fields = detect_fields(image_path)
    print(fields)
