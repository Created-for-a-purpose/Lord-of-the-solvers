import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer 
from joblib import dump

train = pd.read_csv("dataset.csv", names=["UserExpression", "Intent", "TokenOrder"])

text_X = train["UserExpression"]
y = train["Intent"]
y = y.replace(["Swap", "Send"], [0, 1])

swap_ratio = y.value_counts()[1] / y.value_counts().sum()
send_ratio = y.value_counts()[0] / y.value_counts().sum()

text_X_train, text_X_test, y_train, y_test = train_test_split(
    text_X, y, test_size=0.1, random_state=42
)

tfidf_vectorizer = TfidfVectorizer(max_features=500, stop_words="english")
X_train = tfidf_vectorizer.fit_transform(text_X_train)

dump(tfidf_vectorizer, "tfidf_vectorizer.joblib")