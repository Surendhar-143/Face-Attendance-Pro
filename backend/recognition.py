import os
import cv2
import numpy as np
from vector_store import VectorStore
import logging

# Paths to models
YUNET_MODEL = "face_detection_yunet_2023mar.onnx"
SFACE_MODEL = "face_recognition_sface_2021dec.onnx"
DATASET_PATH = "dataset"

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    def __init__(self):
        if not os.path.exists(DATASET_PATH):
            os.makedirs(DATASET_PATH)

        # Initialize OpenCV Face Detector (YuNet)
        self.detector = cv2.FaceDetectorYN.create(
            YUNET_MODEL,
            "",
            (320, 320),
            0.6,  # Relaxed from 0.9 to 0.6 to improve detection rate
            0.3,
            5000
        )
        
        # Initialize OpenCV Face Recognizer (SFace)
        self.recognizer = cv2.FaceRecognizerSF.create(
            SFACE_MODEL,
            ""
        )
        
        # Initialize Vector Database
        self.vector_store = VectorStore()
        
        # Initial Indexing (Optional: could clearly separate "Train" vs "Run")
        # We only re-index if the DB is empty or explicitly requested
        # For simplicity in this upgrade, we trigger a scan if dataset exists
        self.reindex_dataset()

    def reindex_dataset(self):
        """Scan dataset folder and build embeddings in Qdrant."""
        logger.info("Checking dataset for new faces...")
        
        # Optimized: In a real enterprise system, we wouldn't re-scan every time.
        # We would only add new files. For now, we allow upserts.
        
        for name in os.listdir(DATASET_PATH):
            user_dir = os.path.join(DATASET_PATH, name)
            if os.path.isdir(user_dir):
                for img_name in os.listdir(user_dir):
                    img_path = os.path.join(user_dir, img_name)
                    
                    # We could check if already indexed, but Qdrant upsert is safe
                    # However, reading images is slow. 
                    # SKIP LOGIC: In a real system, track processed files.
                    
                    img = cv2.imread(img_path)
                    if img is None: continue
                    
                    # Get embedding
                    emb = self.get_embedding(img)
                    if emb is not None:
                        self.vector_store.add_face(name, emb)
                        # logger.info(f"Indexed: {name}")

        logger.info("Indexing complete.")

    def get_embedding(self, img):
        """Extract 128D embedding from an image."""
        height, width, _ = img.shape
        self.detector.setInputSize((width, height))
        
        # Detection
        self.detector.setInputSize((width, height))
        _, faces = self.detector.detect(img)
        if faces is None:
            return None
            
        # Align and Extract feature (uses the first face found)
        aligned_face = self.recognizer.alignCrop(img, faces[0])
        embedding = self.recognizer.feature(aligned_face)
        return embedding.flatten() # Ensure 1D array for Qdrant

    def find_face(self, img_path_or_array):
        """
        Match face using Vector DB.
        """
        try:
            if isinstance(img_path_or_array, str):
                img = cv2.imread(img_path_or_array)
            else:
                img = img_path_or_array

            if img is None: return None

            query_emb = self.get_embedding(img)
            if query_emb is None:
                logger.info("No face detected in query.")
                return None

            # Search in Vector DB
            name, score = self.vector_store.search_face(query_emb, threshold=0.5)
            
            if name:
                logger.info(f"Match found: {name} (Score: {score})")
                return name
            
            return None

        except Exception as e:
            logger.error(f"Recognition Error: {e}")
            import traceback
            traceback.print_exc()
            return None

    def register_user(self, name: str, images: list[bytes]):
        user_dir = os.path.join(DATASET_PATH, name)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)

        for i, img_data in enumerate(images):
            img_path = os.path.join(user_dir, f"{name}_{i}.jpg")
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                cv2.imwrite(img_path, img)
                
                # Add to Vector DB immediately
                emb = self.get_embedding(img)
                if emb is not None:
                    logger.info(f"Adding new user {name} to Vector DB.")
                    self.vector_store.add_face(name, emb)
                else:
                    logger.error(f"Failed to generate embedding for registration image: {img_path}")

