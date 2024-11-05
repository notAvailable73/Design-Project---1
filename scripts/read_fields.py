import cv2
import easyocr
import detect_fields
from textRead import *

# Initialize EasyOCR reader
reader = easyocr.Reader(['en', 'bn'])  # English and Bangla

def read_field(image, bbox):
    x1, y1, x2, y2 = map(int, bbox)
    # crop field
    field_crop = image[y1:y2, x1:x2] 

    # process field
    field_crop_gray = cv2.cvtColor(field_crop, cv2.COLOR_BGR2GRAY)
    _,field_crop_thresh = cv2.threshold(field_crop_gray, 64, 255, cv2.THRESH_BINARY_INV)

    # get text from field
    field_text, field_text_score = read_text(field_crop_thresh)

    detections = reader.readtext(field_crop)
    if detections:
        return detections[0][1]  # Return the detected text
    return None

if __name__ == "__main__":
    image_path = 'NID_image.png'  # Replace with your image path
    image = cv2.imread(image_path)
    
    if image is None:
        print("Error: Image not found or could not be loaded.")
    else:
        fields = detect_fields.detect_fields(image_path)
        print(fields)
        for field_name, bbox in fields.items():
            text = read_field(image, bbox)
            print(f"{field_name}: {bbox}")
