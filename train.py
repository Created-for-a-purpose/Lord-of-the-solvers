import os
import time
import numpy 
import pandas as pd
from sklearn.metrics import average_precision_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

from concrete.ml.sklearn import XGBClassifier
from concrete.ml.deployment import FHEModelDev

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
X_test = tfidf_vectorizer.transform(text_X_test)

# Converting to dense vectors
X_train = X_train.toarray()
X_test = X_test.toarray()

model = XGBClassifier()
parameters = {
    "n_bits": [2, 3],
    "max_depth": [3,5,7,10],
    "n_estimators": [50, 100, 150],
    "n_jobs": [-1],
}

grid_search = GridSearchCV(model, parameters, cv=3, n_jobs=1, scoring="accuracy")
grid_search.fit(X_train, y_train)
print(f"Best score: {grid_search.best_score_}")

best_model = grid_search.best_estimator_
y_proba_test_tfidf = best_model.predict_proba(X_test)
y_pred_test_tfidf = numpy.argmax(y_proba_test_tfidf, axis=1)
accuracy_tfidf = numpy.mean(y_pred_test_tfidf == y_test)
print(f"Accuracy: {accuracy_tfidf:.4f}")

y_pred_swap = y_proba_test_tfidf[:, 0]
y_pred_send = y_proba_test_tfidf[:, 1]

ap_swap_tfidf = average_precision_score((y_test == 0), y_pred_swap)
ap_send_tfidf = average_precision_score((y_test == 1), y_pred_send)

print(f"Average precision score for swap class: " f"{ap_swap_tfidf:.4f}")
print(f"Average precision score for send class: " f"{ap_send_tfidf:.4f}")

print("5 most swappy intents (class 0):")
for i in range(5):
    print(text_X_test.iloc[y_proba_test_tfidf[:, 0].argsort()[-1 - i]])

print("-" * 100)

print("5 most sendy intents (class 1):")
for i in range(5):
    print(text_X_test.iloc[y_proba_test_tfidf[:, 1].argsort()[-1 - i]])

print("-" * 100)

start = time.perf_counter()
best_model.compile(X_train)
end = time.perf_counter()
print(f"Compilation time: {end - start:.4f} seconds")

# Let's write a custom example and predict in FHE
tested_tweet = ["Can I exchange ETH for BTC?"]
X_tested_tweet = tfidf_vectorizer.transform(numpy.array(tested_tweet)).toarray()
clear_proba = best_model.predict_proba(X_tested_tweet)
# Now let's predict with FHE over a single prompt and print the time it takes
start = time.perf_counter()
decrypted_proba = best_model.predict_proba(X_tested_tweet, fhe="execute")
end = time.perf_counter()
print(f"FHE inference time: {end - start:.4f} seconds")
print(f"Probabilities from the FHE inference: {decrypted_proba}")
print(f"Probabilities from the clear model: {clear_proba}")

fhe_api = FHEModelDev("solver_fhe_model", best_model)
fhe_api.save()