import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

def train_model():
    dataset_path = "Dataset/loan_risk_prediction_dataset.csv"
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    print("Loading loan risk prediction dataset...")
    df = pd.read_csv(dataset_path)
    print(f"Loaded {df.shape[0]} records.")

    # Target variable: 'LoanApproved'
    # Features: 'Age', 'Income', 'LoanAmount', 'CreditScore', 'YearsExperience', 'Gender', 'Education', 'EmploymentType'
    feature_cols = ['Age', 'Income', 'LoanAmount', 'CreditScore', 'YearsExperience', 'Gender', 'Education', 'EmploymentType']
    target_col = 'LoanApproved'

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Fit label encoders for categorical features and save them
    label_encoders = {}
    categorical_cols = ['Gender', 'Education', 'EmploymentType']
    
    for col in categorical_cols:
        le = LabelEncoder()
        # Fill missing values if any
        X[col] = X[col].fillna('Unknown')
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
        print(f"Encoded column '{col}': Classes = {le.classes_.tolist()}")

    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train Random Forest Classifier
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"Model Training Accuracy: {train_acc * 100:.2f}%")
    print(f"Model Testing Accuracy: {test_acc * 100:.2f}%")

    # Create target model directory
    model_dir = "backend/model"
    os.makedirs(model_dir, exist_ok=True)

    # Save model and encoders
    model_path = os.path.join(model_dir, "loan_predictor.joblib")
    encoders_path = os.path.join(model_dir, "label_encoders.joblib")
    
    joblib.dump(model, model_path)
    joblib.dump(label_encoders, encoders_path)
    
    print(f"SUCCESS: Saved trained model to {model_path}")
    print(f"SUCCESS: Saved label encoders to {encoders_path}")

if __name__ == "__main__":
    train_model()
