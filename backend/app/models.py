from pydantic import BaseModel
from typing import List, Optional

class AssessmentRecommendation(BaseModel):
    url: str
    name: str
    adaptive_support: str  # "Yes" or "No"
    description: str
    duration: int  # in minutes
    remote_support: str  # "Yes" or "No"
    test_type: List[str]  # e.g., ["Knowledge & Skills"]

class RecommendRequest(BaseModel):
    query: str
    top_k: int = 10

class RecommendResponse(BaseModel):
    query: str
    recommended_assessments: List[AssessmentRecommendation]

class HealthResponse(BaseModel):
    status: str
    message: str
