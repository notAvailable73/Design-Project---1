
# NID Data Extractor

Welcome to the **NID Data Extractor** repository! This guide will help you install and run the project step-by-step.

## Prerequisites

- Python 3.12 or higher is recommended.

## Installation

1. **Install Python**

   Ensure you have Python installed on your system. If not, download and install it from [Python's official website](https://www.python.org/downloads/).

2. **Clone the Repository**

   ```bash
   git clone https://github.com/notAvailable73/Design-Project---1.git
   ```
   Open the Repository folder.

3. **Install Required Packages**

   Install the necessary packages listed in `requirements.txt` by running:

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a Virtual Environment**

   It’s recommended to use a virtual environment to manage dependencies. Run the following command to create one:

   ```bash
   python -m venv myenv
   ```
   You can use any name instead of `myenv`

5. **Modify EasyOCR Utility (if applicable)**

   In the following file:

   ```bash
   myenv/lib/python3.12/site-packages/easyocr/utils.py
   ```

   Locate the function `compute_ratio_and_resize`, and replace all instances of `Image.ANTIALIAS` with `Image.LANCZOS`.

6. **Activate the Virtual Environment**

   Activate the virtual environment:

   - **Windows**:
     ```bash
     myenv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source myenv/bin/activate
     ```

7. **Run the Script**

   Execute the main script by running:

   ```bash
   python read_fields.py
   ```

8. **Optional Configuration**

   To change the directory path for the NID images, update the file path in `read_fields.py` as required.

## Thank you

Thank you for using **NID Data Extractor**!
