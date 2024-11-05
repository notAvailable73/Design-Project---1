import string
import easyocr
 
reader = easyocr.Reader(['en', 'bn'], gpu=False)    

def read_text(cropped_field):
    detections = reader.readtext(cropped_field)
    for detection in detections:
        bbox, text, score = detection
        # text = text.upper().replace(' ', '')
 
    return text 
 
 