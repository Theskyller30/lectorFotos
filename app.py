from flask import Flask, render_template, request, jsonify
import pytesseract
from PIL import Image
import cv2
import numpy as np
import io
import re

app = Flask(__name__)

# Ruta al ejecutable de Tesseract OCR (¡AJUSTA ESTA RUTA!)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def escanear_texto(imagen):
    """
    Escanea una imagen y extrae el texto.

    Args:
        imagen: La imagen en formato PIL.Image.

    Returns:
        El texto extraído de la imagen.
    """
    imagen = cv2.cvtColor(np.array(imagen), cv2.COLOR_BGR2GRAY)

    # Escalado (ajustar el factor según sea necesario)
    imagen = cv2.resize(imagen, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR) 

    # Reducción de ruido
    imagen = cv2.fastNlMeansDenoising(imagen, None, h=10, templateWindowSize=7, searchWindowSize=21)

    # Eliminar líneas (usando morfología matemática)
    kernel = np.ones((1, 5), np.uint8)  # Kernel para eliminar líneas horizontales
    imagen = cv2.morphologyEx(imagen, cv2.MORPH_OPEN, kernel)

    # Mejorar el contraste
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    imagen = clahe.apply(imagen)

    # Binarización (probar diferentes métodos)
    _, imagen_bn = cv2.threshold(imagen, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # OCR con Tesseract (probar diferentes PSM)
    texto = pytesseract.image_to_string(imagen_bn, lang='spa', config='--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/:.-') 

    # Postprocesamiento 
    texto = " ".join(texto.split())

    # Corrección de errores comunes (ejemplo)
    texto = texto.replace("0", "O").replace("1", "l") 

    # Extraer información con expresiones regulares (ejemplo)
    fecha_match = re.search(r"(\d{2}/\d{2}/\d{4})", texto)
    if fecha_match:
        fecha = fecha_match.group(1)
        print("Fecha:", fecha)

    return texto

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        archivo = request.files["imagen"]
        if archivo:
            imagen = Image.open(io.BytesIO(archivo.read()))
            texto_extraido = escanear_texto(imagen)
            return jsonify({"texto": texto_extraido})
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)