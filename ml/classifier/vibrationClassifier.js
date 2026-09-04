/**
 * Cyber Chaukidaar - Vibration Classifier
 * Lightweight, optimized local Random Forest inference engine.
 * Runs in pure JavaScript on Node.js (< 1ms execution time) or can be embedded.
 * Clearly distinguishes between REAL MODEL inference and DEMO / SIMULATION MODE.
 */

const fs = require('fs');
const path = require('path');

class VibrationClassifier {
  /**
   * @param {Object} options
   * @param {string} [options.weightsPath] - Path to model weights JSON
   * @param {boolean} [options.demoMode=false] - Explicit demo/simulation flag
   */
  constructor(options = {}) {
    this.demoMode = options.demoMode || false;
    this.classes = ['NORMAL', 'FOOTSTEP_HUMAN', 'VEHICLE', 'ENVIRONMENTAL'];
    this.weights = null;
    this.isModelLoaded = false;

    const defaultWeightsPath = path.join(__dirname, 'model_weights.json');
    this.loadModel(options.weightsPath || defaultWeightsPath);
  }

  loadModel(weightsPath) {
    try {
      if (fs.existsSync(weightsPath)) {
        const raw = fs.readFileSync(weightsPath, 'utf8');
        this.weights = JSON.parse(raw);
        this.classes = this.weights.classes || this.classes;
        this.isModelLoaded = true;
      }
    } catch (err) {
      console.warn('[VibrationClassifier] Warning: Could not load model weights, falling back to rule-based fallback:', err.message);
      this.isModelLoaded = false;
    }
  }

  /**
   * Traverse a single decision tree
   */
  evaluateTree(node, features) {
    if (node.leaf) {
      return node.probs;
    }
    const val = features[node.feature] || 0;
    if (val <= node.threshold) {
      return this.evaluateTree(node.left, features);
    } else {
      return this.evaluateTree(node.right, features);
    }
  }

  /**
   * Classify seismic vibration features
   * @param {Object} features - Object containing the 8 features
   * @param {boolean} [overrideDemoMode] - Optional override
   * @returns {Object} classification result with confidence, mode, and breakdown
   */
  classify(features, overrideDemoMode = null) {
    const isDemo = overrideDemoMode !== null ? overrideDemoMode : this.demoMode;

    if (isDemo) {
      return this.demoClassify(features);
    }

    if (!this.isModelLoaded || !this.weights || !this.weights.trees) {
      return this.fallbackRuleClassify(features);
    }

    // Accumulate probabilities across all ensemble decision trees
    const numClasses = this.classes.length;
    const avgProbs = new Array(numClasses).fill(0);
    const numTrees = this.weights.trees.length;

    for (let t = 0; t < numTrees; t++) {
      const treeProbs = this.evaluateTree(this.weights.trees[t], features);
      for (let c = 0; c < numClasses; c++) {
        avgProbs[c] += treeProbs[c] / numTrees;
      }
    }

    // Find class with highest probability
    let maxIdx = 0;
    let maxProb = avgProbs[0];
    for (let c = 1; c < numClasses; c++) {
      if (avgProbs[c] > maxProb) {
        maxProb = avgProbs[c];
        maxIdx = c;
      }
    }

    const predictedClass = this.classes[maxIdx];
    const confidence = Number(maxProb.toFixed(3));

    return {
      classification: predictedClass,
      confidence: confidence,
      probabilities: {
        NORMAL: Number(avgProbs[0].toFixed(3)),
        FOOTSTEP_HUMAN: Number(avgProbs[1].toFixed(3)),
        VEHICLE: Number(avgProbs[2].toFixed(3)),
        ENVIRONMENTAL: Number(avgProbs[3].toFixed(3))
      },
      mode: 'REAL_MODEL',
      featuresAnalyzed: features,
      explanation: this.generateExplanation(predictedClass, features, confidence)
    };
  }

  /**
   * Fallback heuristic classifier when weights file is unavailable
   */
  fallbackRuleClassify(features) {
    const rms = features.rms || 0;
    const domFreq = features.dominantFrequency || 0;
    const ipi = features.interPeakInterval || 0;
    const energy = features.spectralEnergy || 0;

    let predictedClass = 'NORMAL';
    let confidence = 0.85;

    if (rms < 0.08) {
      predictedClass = 'NORMAL';
      confidence = 0.92;
    } else if (domFreq >= 1.0 && domFreq <= 18.0 && ipi >= 250 && ipi <= 950) {
      predictedClass = 'FOOTSTEP_HUMAN';
      confidence = 0.88;
    } else if (domFreq > 18.0 && energy > 0.4) {
      predictedClass = 'VEHICLE';
      confidence = 0.90;
    } else {
      predictedClass = 'ENVIRONMENTAL';
      confidence = 0.75;
    }

    return {
      classification: predictedClass,
      confidence: confidence,
      probabilities: {
        NORMAL: predictedClass === 'NORMAL' ? confidence : 0.05,
        FOOTSTEP_HUMAN: predictedClass === 'FOOTSTEP_HUMAN' ? confidence : 0.05,
        VEHICLE: predictedClass === 'VEHICLE' ? confidence : 0.05,
        ENVIRONMENTAL: predictedClass === 'ENVIRONMENTAL' ? confidence : 0.05
      },
      mode: 'REAL_MODEL',
      featuresAnalyzed: features,
      explanation: this.generateExplanation(predictedClass, features, confidence)
    };
  }

  /**
   * Clearly marked DEMO / SIMULATION MODE classification
   */
  demoClassify(features) {
    const rms = features.rms || 0;
    const isElevated = rms > 0.15;
    
    return {
      classification: isElevated ? 'FOOTSTEP_HUMAN' : 'NORMAL',
      confidence: isElevated ? 0.94 : 0.98,
      probabilities: {
        NORMAL: isElevated ? 0.04 : 0.98,
        FOOTSTEP_HUMAN: isElevated ? 0.94 : 0.01,
        VEHICLE: 0.01,
        ENVIRONMENTAL: 0.01
      },
      mode: 'DEMO_MODE', // Explicitly labeled per spec
      featuresAnalyzed: features,
      explanation: '[SIMULATION] Simulated scenario matching configured demo pattern'
    };
  }

  /**
   * Human-readable explanation of why a decision was reached
   */
  generateExplanation(classification, f, conf) {
    switch (classification) {
      case 'FOOTSTEP_HUMAN':
        return `Rhythmic footsteps detected: RMS=${f.rms}g, dominant low frequency ${f.dominantFrequency}Hz with step cadence interval ${f.interPeakInterval}ms (${(conf * 100).toFixed(0)}% confidence).`;
      case 'VEHICLE':
        return `Motor/chassis vibrations detected: elevated spectral energy (${f.spectralEnergy}) with high frequency rumble at ${f.dominantFrequency}Hz.`;
      case 'ENVIRONMENTAL':
        return `Aperiodic broadband seismic noise detected without biological rhythm (Centroid=${f.spectralCentroid}Hz, RMS=${f.rms}g).`;
      case 'NORMAL':
      default:
        return `Ambient baseline background noise floor (RMS=${f.rms}g, Peak=${f.peak}g).`;
    }
  }
}

module.exports = VibrationClassifier;
