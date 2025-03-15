import string
import easyocr
 
reader = easyocr.Reader(['en', 'bn'], gpu=False)    

def read_text(cropped_field):
    try:
        detections = reader.readtext(cropped_field)
        if detections:
            text = ""
            for detection in detections:
                bbox, detected_text, score = detection
                if score > 0.2:  # Only consider text with confidence above 0.2
                    text += detected_text + " "
            return text.strip()
        return ""
    except Exception as e:
        print(f"Error reading text: {e}")
        return ""
 
 