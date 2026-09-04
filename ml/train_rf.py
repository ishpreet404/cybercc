"""
Cyber Chaukidaar - Local Random Forest Training Script
Generates synthetic & empirical seismic vibration profiles for 4 classes:
  1. NORMAL (ambient ground floor)
  2. FOOTSTEP_HUMAN (1-15 Hz, rhythmic foot strike 400-800ms)
  3. VEHICLE (15-50 Hz continuous engine rumble)
  4. ENVIRONMENTAL (wind/gusts, aperiodic broadband noise)

Trains a compact, optimized RandomForestClassifier and exports decision tree rules to JSON.
"""

import json
import os
import numpy as np

def generate_synthetic_dataset(samples_per_class=200):
    np.random.seed(42)
    X = []
    y = []

    # Features order:
    # 0: rms, 1: peak, 2: peakToPeak, 3: variance, 4: dominantFrequency,
    # 5: spectralEnergy, 6: spectralCentroid, 7: interPeakInterval

    # 0: NORMAL
    for _ in range(samples_per_class):
        rms = np.random.uniform(0.01, 0.05)
        peak = rms * np.random.uniform(1.2, 2.0)
        p2p = peak * np.random.uniform(1.5, 2.0)
        var = rms**2
        dom_freq = np.random.uniform(0.5, 5.0)
        spec_energy = np.random.uniform(0.001, 0.03)
        spec_centroid = np.random.uniform(2.0, 15.0)
        ipi = 0.0
        X.append([rms, peak, p2p, var, dom_freq, spec_energy, spec_centroid, ipi])
        y.append("NORMAL")

    # 1: FOOTSTEP_HUMAN
    for _ in range(samples_per_class):
        rms = np.random.uniform(0.12, 0.45)
        peak = rms * np.random.uniform(2.5, 4.5)
        p2p = peak * np.random.uniform(1.8, 2.2)
        var = rms**2
        dom_freq = np.random.uniform(3.0, 14.0)
        spec_energy = np.random.uniform(0.10, 0.45)
        spec_centroid = np.random.uniform(6.0, 18.0)
        ipi = np.random.uniform(350.0, 750.0) # Human footstep cadence ~0.4 - 0.75s
        X.append([rms, peak, p2p, var, dom_freq, spec_energy, spec_centroid, ipi])
        y.append("FOOTSTEP_HUMAN")

    # 2: VEHICLE
    for _ in range(samples_per_class):
        rms = np.random.uniform(0.20, 0.70)
        peak = rms * np.random.uniform(1.8, 2.8)
        p2p = peak * np.random.uniform(1.8, 2.2)
        var = rms**2
        dom_freq = np.random.uniform(20.0, 48.0)
        spec_energy = np.random.uniform(0.50, 1.80)
        spec_centroid = np.random.uniform(25.0, 45.0)
        ipi = np.random.uniform(40.0, 150.0) # Fast engine cylinder harmonics
        X.append([rms, peak, p2p, var, dom_freq, spec_energy, spec_centroid, ipi])
        y.append("VEHICLE")

    # 3: ENVIRONMENTAL
    for _ in range(samples_per_class):
        rms = np.random.uniform(0.06, 0.25)
        peak = rms * np.random.uniform(1.8, 3.2)
        p2p = peak * np.random.uniform(1.5, 2.2)
        var = rms**2
        dom_freq = np.random.uniform(1.0, 25.0)
        spec_energy = np.random.uniform(0.05, 0.35)
        spec_centroid = np.random.uniform(15.0, 35.0)
        ipi = np.random.uniform(0.0, 200.0)
        X.append([rms, peak, p2p, var, dom_freq, spec_energy, spec_centroid, ipi])
        y.append("ENVIRONMENTAL")

    return np.array(X), np.array(y)

def tree_to_dict(tree, feature_names, classes, node_id=0):
    left = tree.children_left[node_id]
    right = tree.children_right[node_id]
    
    if left == -1 and right == -1: # Leaf
        val = tree.value[node_id][0]
        total = float(np.sum(val))
        probs = [round(float(v) / total, 3) for v in val]
        pred_idx = int(np.argmax(val))
        return {
            "leaf": True,
            "prediction": classes[pred_idx],
            "probs": probs
        }
    
    feat_idx = tree.feature[node_id]
    thresh = round(float(tree.threshold[node_id]), 4)
    return {
        "feature": feature_names[feat_idx],
        "threshold": thresh,
        "left": tree_to_dict(tree, feature_names, classes, left),
        "right": tree_to_dict(tree, feature_names, classes, right)
    }

def main():
    print("[*] Generating synthetic seismic dataset...")
    X, y = generate_synthetic_dataset(samples_per_class=300)

    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import classification_report

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        feature_names = [
            "rms", "peak", "peakToPeak", "variance",
            "dominantFrequency", "spectralEnergy", "spectralCentroid", "interPeakInterval"
        ]
        classes = ["NORMAL", "FOOTSTEP_HUMAN", "VEHICLE", "ENVIRONMENTAL"]

        clf = RandomForestClassifier(n_estimators=5, max_depth=4, random_state=42)
        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)
        print("\n[+] Model Evaluation:")
        print(classification_report(y_test, y_pred))

        trees_data = []
        for estimator in clf.estimators_:
            trees_data.append(tree_to_dict(estimator.tree_, feature_names, classes))

        output_model = {
            "modelType": "RandomForestClassifier",
            "version": "1.0.0",
            "numTrees": len(clf.estimators_),
            "classes": classes,
            "featureOrder": feature_names,
            "trees": trees_data
        }

        out_path = os.path.join(os.path.dirname(__file__), "classifier", "model_weights.json")
        with open(out_path, "w") as f:
            json.dump(output_model, f, indent=2)
        print(f"[+] Saved model weights to {out_path}")

    except ImportError:
        print("[!] scikit-learn is not installed in the python environment. Pre-compiled model weights are already provided in classifier/model_weights.json.")

if __name__ == "__main__":
    main()
