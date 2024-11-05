import cv2 
from detect_fields import detect_fields
from textRead import *   

def read_field(image, bbox):
    x1, y1, x2, y2 = map(int, bbox) 
    field_crop = image[y1:y2, x1:x2] 
    
  
    text = read_text(field_crop)
    # print(text)
 
    return text

if __name__ == "__main__":
    image_path = 'image.png'   
    image = cv2.imread(image_path)

    if image is None:
        print("Error: Image not found or could not be loaded.")
    else:
         
        fields = detect_fields(image_path)
        
        image2 = image.copy()
        for field_name, bbox in fields.items():
            text = read_field(image, bbox)
            print(f"{field_name}: {text}")
            # Draw bounding box and field name on image
            x1, y1, x2, y2 = map(int, bbox)
            cv2.rectangle(image2, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(image2, field_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (178, 190, 181), 1)
        
        # Save 
        output_path = 'output.png'  
        cv2.imwrite(output_path, image2)
        print(f"Output image saved to {output_path}")
