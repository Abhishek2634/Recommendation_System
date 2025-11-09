# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .recommender import RecommendationEngine
from .models import RecommendRequest, HealthResponse

app = FastAPI(
    title="SHL Assessment Recommender API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine
engine = RecommendationEngine()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "API is running"
    }

@app.get("/")
def root():
    return {
        "status": "healthy",
        "message": "SHL Assessment Recommender API is running"
    }

@app.post("/recommend")
def recommend_assessments(request: RecommendRequest):
    try:
        recommendations = engine.recommend(
            query=request.query,
            top_k=request.top_k
        )
        
        # Format response with REAL similarity scores
        formatted_recommendations = []
        for rec in recommendations:
            formatted_recommendations.append({
                "assessment_name": rec['name'],
                "assessment_url": rec['url'],
                "relevance_score": rec.get('similarity_score', 0.0),  # Use real score!
                "test_type": ', '.join(rec['test_type']),
                "description": rec['description']
            })
        
        return {
            "query": request.query,
            "recommendations": formatted_recommendations,
            "count": len(formatted_recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
