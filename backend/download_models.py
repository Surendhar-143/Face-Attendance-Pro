import urllib.request

models = {
    "face_detection_yunet_2023mar.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
    "face_recognition_sface_2021dec.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
}

for name, url in models.items():
    print(f"Downloading {name}...")
    try:
        urllib.request.urlretrieve(url, name)
        print("Done.")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
