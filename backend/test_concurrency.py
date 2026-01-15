import asyncio
import aiohttp
import cv2
import numpy as np
import time

API_URL = "http://localhost:8000/recognize"
CONCURRENT_REQUESTS = 10

# Generate a dummy image (black square) if no image provided
def generate_dummy_image():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    cv2.putText(img, "Test", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()

async def send_request(session, req_id, image_data):
    start_time = time.time()
    try:
        data = config = {'file': image_data}
        # In aiohttp, file uploads are handled with FormData
        data = aiohttp.FormData()
        data.add_field('file', image_data, filename='test.jpg', content_type='image/jpeg')
        
        async with session.post(API_URL, data=data) as response:
            result = await response.json()
            duration = time.time() - start_time
            print(f"[{req_id}] Status: {response.status} | Duration: {duration:.2f}s | Result: {result}")
    except Exception as e:
        print(f"[{req_id}] Error: {e}")

async def main():
    print(f"Starting concurrency test with {CONCURRENT_REQUESTS} requests...")
    image_data = generate_dummy_image()
    
    async with aiohttp.ClientSession() as session:
        tasks = [send_request(session, i, image_data) for i in range(CONCURRENT_REQUESTS)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    # Install requirements if needed: pip install aiohttp opencv-python numpy
    try:
        import aiohttp
    except ImportError:
        print("Please run: pip install aiohttp")
        exit(1)
        
    asyncio.run(main())
