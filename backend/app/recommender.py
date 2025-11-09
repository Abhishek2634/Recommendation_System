# app/recommender.py
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
from pathlib import Path


class RecommendationEngine:
    def __init__(self, training_data_path='data/raw/Gen_AI-Dataset.xlsx'):
        print("Loading training data...")
        
        self.training_df = pd.read_excel(training_data_path, sheet_name='Train-Set')
        self.assessment_metadata = self._build_assessment_metadata()
        
        print(f"Loaded {len(self.training_df)} training examples")
        print(f"Found {len(self.assessment_metadata)} unique assessments")
        
        print("Loading sentence transformer model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("Computing embeddings...")
        self.training_queries = self.training_df['Query'].tolist()
        self.training_embeddings = self.model.encode(
            self.training_queries,
            show_progress_bar=True
        )
        
        print("✅ Recommendation engine ready!")
    
    def _build_assessment_metadata(self):
        """Build metadata for each unique assessment"""
        metadata = {}
        
        for url in self.training_df['Assessment_url'].unique():
            name = url.split('/')[-2].replace('-', ' ').title()
            if name.endswith('New'):
                name = name[:-3] + '(New)'
            
            metadata[url] = {
                'url': url,
                'name': name,
                'adaptive_support': 'No',
                'description': f'Assessment for {name}. Comprehensive evaluation tool.',
                'duration': self._estimate_duration(name),
                'remote_support': 'Yes',
                'test_type': self._infer_test_type(name, url)
            }
        
        return metadata
    
    def _estimate_duration(self, name):
        """Estimate duration based on assessment name"""
        name_lower = name.lower()
        
        if 'quick' in name_lower or 'screening' in name_lower:
            return 15
        elif 'comprehensive' in name_lower or 'advanced' in name_lower:
            return 45
        elif 'behavioral' in name_lower or 'personality' in name_lower:
            return 25
        else:
            return 30
    
    def _infer_test_type(self, name, url):
        """Infer test type from name and URL"""
        text = (name + ' ' + url).lower()
        
        type_keywords = {
            'Knowledge & Skills': ['java', 'python', 'sql', 'javascript', 'coding', 'programming', 'technical'],
            'Personality & Behaviour': ['personality', 'opq', 'motivational', 'behavioral'],
            'Ability & Aptitude': ['numerical', 'verbal', 'reasoning', 'cognitive', 'verify'],
            'Competencies': ['leadership', 'competenc', 'professional'],
            'Simulations': ['simulation', 'work sample'],
        }
        
        for test_type, keywords in type_keywords.items():
            if any(keyword in text for keyword in keywords):
                return [test_type]
        
        return ['Knowledge & Skills']
    
    def recommend(self, query, top_k=10):
        """Generate recommendations with REAL similarity scores"""
        # Encode query
        query_embedding = self.model.encode([query])
        
        # Calculate similarities with all training queries
        similarities = cosine_similarity(
            query_embedding,
            self.training_embeddings
        )[0]
        
        # Get top similar queries (get more candidates)
        top_indices = np.argsort(similarities)[-top_k*3:][::-1]
        
        # Collect assessments with their similarity scores
        url_scores = {}  # Store best score for each URL
        
        for idx in top_indices:
            url = self.training_df.iloc[idx]['Assessment_url']
            score = float(similarities[idx])
            
            # Keep the highest similarity score for each assessment
            if url not in url_scores:
                url_scores[url] = score
            else:
                url_scores[url] = max(url_scores[url], score)
        
        # Sort assessments by similarity score (highest first)
        sorted_urls = sorted(url_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        
        # Build recommendations with real scores
        recommendations = []
        for url, score in sorted_urls:
            if url in self.assessment_metadata:
                metadata = self.assessment_metadata[url].copy()
                metadata['similarity_score'] = score  # Add real similarity score
                recommendations.append(metadata)
        
        return recommendations
