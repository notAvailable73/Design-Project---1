import cv2 
import sys
import json
import os
from .detect_fields import detect_fields
from .textRead import read_text   

def read_field(image, bbox):
    x1, y1, x2, y2 = map(int, bbox) 
    field_crop = image[y1:y2, x1:x2] 
    
    text = read_text(field_crop)
    return text

def extract_nid_data(image_path, save_output_image=False):
    image = cv2.imread(image_path)

    if image is None:
        return {"error": "Image not found or could not be loaded."}
    
    try:
        fields = detect_fields(image_path)
        
        result = {}
        image2 = image.copy()
        
        for field_name, bbox in fields.items():
            text = read_field(image, bbox)
            result[field_name] = text
            
            # Draw bounding box and field name on image if requested
            if save_output_image:
                x1, y1, x2, y2 = map(int, bbox)
                cv2.rectangle(image2, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(image2, field_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (178, 190, 181), 1)
        
        # Save output image if requested
        if save_output_image:
            output_dir = os.path.dirname(image_path)
            output_path = os.path.join(output_dir, 'output_' + os.path.basename(image_path))
            cv2.imwrite(output_path, image2)
            result["output_image"] = output_path
            
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        save_output = len(sys.argv) > 2 and sys.argv[2].lower() == 'true'
        
        result = extract_nid_data(image_path, save_output)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No image path provided."}))
