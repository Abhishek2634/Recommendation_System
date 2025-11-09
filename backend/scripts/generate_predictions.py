# backend/scripts/generate_predictions.py
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.recommender import RecommendationEngine

print("="*70)
print("SHL ASSESSMENT RECOMMENDER - TEST PREDICTIONS")
print("="*70)

# Load Test-Set from Excel
print("\nLoading test queries from Excel (Test-Set sheet)...")
test_df = pd.read_excel('data/raw/Gen_AI-Dataset.xlsx', sheet_name='Test-Set')
test_queries = test_df['Query'].tolist()

print(f"Loaded {len(test_queries)} test queries\n")

# Initialize recommender (uses Train-Set)
print("Initializing recommendation engine...")
engine = RecommendationEngine(training_data_path='data/raw/Gen_AI-Dataset.xlsx')
print("✅ Engine ready!\n")

# Generate predictions
results = []

for idx, query in enumerate(test_queries, 1):
    print(f"[{idx}/{len(test_queries)}] Processing: {query[:60]}...")
    
    # Get top 10 recommendations
    recommendations = engine.recommend(query, top_k=10)
    
    # Add to results
    for rec in recommendations:
        results.append({
            'Query': query,
            'Assessment_url': rec['url']
        })

# Create output directory
os.makedirs('outputs', exist_ok=True)

# Save predictions
output_df = pd.DataFrame(results)
output_df.to_csv('outputs/test_predictions.csv', index=False)

print(f"\n{'='*70}")
print(f"✅ TEST PREDICTIONS COMPLETE!")
print(f"{'='*70}")
print(f"Total predictions: {len(results)}")
print(f"Test queries processed: {len(test_queries)}")
print(f"Predictions per query: 10")
print(f"Output file: outputs/test_predictions.csv")

print(f"\nSample (first 20 rows):")
print(output_df.head(20).to_string(index=False))

print(f"\n{'='*70}")
print("✅ READY FOR SUBMISSION!")
print(f"{'='*70}")
print("Submit: outputs/test_predictions.csv")
