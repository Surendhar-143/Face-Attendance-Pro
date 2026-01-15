from qdrant_client import QdrantClient
from qdrant_client.http import models
import numpy as np
import uuid
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        # Using local file storage for persistence
        # In Docker, this path is volume-mounted
        self.client = QdrantClient(path="qdrant_db") 
        self.collection_name = "faces"
        
        # Check if collection exists, if not create it
        collections = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in collections.collections)
        
        if not exists:
            logger.info("Creating Qdrant collection...")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=128, distance=models.Distance.COSINE),
            )

    def add_face(self, user_name: str, embedding: np.ndarray):
        """
        Add a face vector to the database.
        Generates a UUID for the point ID.
        """
        point_id = str(uuid.uuid4())
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=point_id,
                    vector=embedding.tolist(),
                    payload={"name": user_name}
                )
            ]
        )

    def search_face(self, query_embedding: np.ndarray, threshold: float = 0.4):
        """
        Search for the closest face vector.
        Returns (name, score) or (None, 0.0)
        """
        hits = self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding.tolist(),
            limit=1
        ).points
        
        if hits:
            best_hit = hits[0]
            # Qdrant Cosine score is 0..1 (1 is identical) except for corner cases
            # SFace cosine similarity is also higher is better.
            logger.info(f"Vector match: {best_hit.payload['name']} ({best_hit.score})")
            
            if best_hit.score > threshold:
                return best_hit.payload["name"], best_hit.score
                
        return None, 0.0
