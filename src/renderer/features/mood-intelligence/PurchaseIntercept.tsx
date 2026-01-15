/**
 * Purchase Intercept Screen
 *
 * Full-screen intervention UI that appears when a potentially
 * impulsive purchase is detected. Shows mood analysis, risk score,
 * and swipe-to-decide interface.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MoodPrediction, MoodState, RiskLevel } from '../../services/mood-detection';
import './PurchaseIntercept.css';

interface PurchaseDetails {
  amount: number;
  merchant: string;
  category: string;
  imageUrl?: string;
}

interface PurchaseInterceptProps {
  isVisible: boolean;
  purchase: PurchaseDetails;
  moodPrediction: MoodPrediction;
  onApprove: () => void;
  onBlock: () => void;
  onDelay: (hours: number) => void;
  onClose: () => void;
}

export const PurchaseIntercept: React.FC<PurchaseInterceptProps> = ({
  isVisible,
  purchase,
  moodPrediction,
  onApprove,
  onBlock,
  onDelay,
  onClose,
}) => {
  const [swipePosition, setSwipePosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cooldownTimer, setCooldownTimer] = useState<number | null>(null);
  const [decision, setDecision] = useState<'approved' | 'blocked' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  // Breathing exercise timer
  useEffect(() => {
    if (!showBreathingExercise) return;

    const phases = ['inhale', 'hold', 'exhale'] as const;
    const durations = [4000, 4000, 4000]; // 4s each
    let phaseIndex = 0;

    const cycle = () => {
      setBreathPhase(phases[phaseIndex]);
      phaseIndex = (phaseIndex + 1) % 3;
    };

    cycle();
    const interval = setInterval(cycle, durations[phaseIndex]);
    return () => clearInterval(interval);
  }, [showBreathingExercise]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTimer === null || cooldownTimer <= 0) return;

    const interval = setInterval(() => {
      setCooldownTimer(prev => (prev !== null && prev > 0) ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setSwipePosition(Math.max(-150, Math.min(150, diff)));
  };

  const handleTouchEnd = () => {
    if (swipePosition > 100) {
      // Swiped right - Approve
      setIsAnimating(true);
      setDecision('approved');
      setTimeout(() => {
        onApprove();
      }, 500);
    } else if (swipePosition < -100) {
      // Swiped left - Block
      setIsAnimating(true);
      setDecision('blocked');
      setTimeout(() => {
        onBlock();
      }, 500);
    } else {
      // Spring back
      setSwipePosition(0);
    }
  };

  const handleDelayClick = (hours: number) => {
    setCooldownTimer(hours * 3600);
    onDelay(hours);
  };

  const getMoodEmoji = (mood: MoodState): string => {
    const emojis: Record<MoodState, string> = {
      stressed: '😰',
      bored: '😑',
      happy: '😊',
      sad: '😢',
      anxious: '😟',
      neutral: '😐',
      euphoric: '🤑',
    };
    return emojis[mood] || '😐';
  };

  const getRiskColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      low: '#4caf50',
      moderate: '#ff9800',
      high: '#f44336',
      critical: '#d32f2f',
    };
    return colors[level];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isVisible) return null;

  return (
    <div className={`purchase-intercept-overlay ${isAnimating ? 'animating' : ''}`}>
      <div className="intercept-backdrop" onClick={onClose} />

      <div
        className={`intercept-container ${decision ? `decision-${decision}` : ''}`}
        style={{
          transform: `translateX(${swipePosition}px) rotate(${swipePosition * 0.05}deg)`,
        }}
      >
        {/* Swipe Indicators */}
        <div className={`swipe-indicator left ${swipePosition < -50 ? 'active' : ''}`}>
          <span className="swipe-icon">🛑</span>
          <span>BLOCK</span>
        </div>
        <div className={`swipe-indicator right ${swipePosition > 50 ? 'active' : ''}`}>
          <span className="swipe-icon">✓</span>
          <span>ALLOW</span>
        </div>

        {/* Main Card */}
        <div
          ref={cardRef}
          className="intercept-card"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Alert Header */}
          <div className="intercept-header" style={{ borderColor: getRiskColor(moodPrediction.riskLevel) }}>
            <div className="alert-pulse" style={{ backgroundColor: getRiskColor(moodPrediction.riskLevel) }} />
            <div className="header-content">
              <h2>Purchase Detected</h2>
              <p className="risk-label" style={{ color: getRiskColor(moodPrediction.riskLevel) }}>
                {moodPrediction.riskLevel.toUpperCase()} IMPULSE RISK
              </p>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* Purchase Info */}
          <div className="purchase-info">
            <div className="merchant-logo">
              {purchase.imageUrl ? (
                <img src={purchase.imageUrl} alt={purchase.merchant} />
              ) : (
                <span className="merchant-initial">{purchase.merchant[0]}</span>
              )}
            </div>
            <div className="purchase-details">
              <h3>{purchase.merchant}</h3>
              <span className="category-badge">{purchase.category}</span>
            </div>
            <div className="purchase-amount">
              {formatCurrency(purchase.amount)}
            </div>
          </div>

          {/* Risk Gauge */}
          <div className="risk-gauge-container">
            <svg className="risk-gauge" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4caf50" />
                  <stop offset="50%" stopColor="#ff9800" />
                  <stop offset="100%" stopColor="#f44336" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Colored arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${moodPrediction.impulseRiskScore * 2.5} 250`}
              />
              {/* Needle */}
              <line
                x1="100"
                y1="90"
                x2={100 + Math.cos((180 - moodPrediction.impulseRiskScore * 1.8) * Math.PI / 180) * 60}
                y2={90 - Math.sin((180 - moodPrediction.impulseRiskScore * 1.8) * Math.PI / 180) * 60}
                stroke="#333"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="90" r="6" fill="#333" />
            </svg>
            <div className="risk-score">
              <span className="score-value">{moodPrediction.impulseRiskScore}</span>
              <span className="score-label">Impulse Score</span>
            </div>
          </div>

          {/* Mood Analysis */}
          <div className="mood-analysis">
            <div className="mood-badge">
              <span className="mood-emoji">{getMoodEmoji(moodPrediction.primaryMood)}</span>
              <div className="mood-info">
                <span className="mood-label">Current State</span>
                <span className="mood-value">{moodPrediction.primaryMood}</span>
              </div>
              <div className="confidence">
                <span className="confidence-value">{moodPrediction.confidence}%</span>
                <span className="confidence-label">confidence</span>
              </div>
            </div>
          </div>

          {/* AI Triggers */}
          <div className="triggers-section">
            <h4>Why we're alerting you:</h4>
            <ul className="trigger-list">
              {moodPrediction.triggers.map((trigger, index) => (
                <li key={index} className="trigger-item">
                  <span className="trigger-icon">⚠️</span>
                  {trigger}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Recommendation */}
          <div className="ai-recommendation">
            <div className="ai-avatar">🤖</div>
            <div className="recommendation-content">
              <strong>AI Recommendation</strong>
              <p>{moodPrediction.recommendations[0]}</p>
            </div>
          </div>

          {/* Breathing Exercise */}
          {showBreathingExercise && (
            <div className="breathing-exercise">
              <div className={`breath-circle ${breathPhase}`}>
                <span className="breath-text">
                  {breathPhase === 'inhale' ? 'Breathe In' :
                   breathPhase === 'hold' ? 'Hold' : 'Breathe Out'}
                </span>
              </div>
              <button
                className="btn secondary small"
                onClick={() => setShowBreathingExercise(false)}
              >
                Done
              </button>
            </div>
          )}

          {/* Cooldown Timer */}
          {cooldownTimer !== null && cooldownTimer > 0 && (
            <div className="cooldown-active">
              <div className="cooldown-icon">⏳</div>
              <div className="cooldown-info">
                <span className="cooldown-label">Cooling off period active</span>
                <span className="cooldown-time">
                  {Math.floor(cooldownTimer / 3600)}h {Math.floor((cooldownTimer % 3600) / 60)}m {cooldownTimer % 60}s
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="intercept-actions">
            <button
              className="btn breathing-btn"
              onClick={() => setShowBreathingExercise(true)}
            >
              😮‍💨 Breathe First
            </button>

            <div className="delay-options">
              <span className="delay-label">Wait instead:</span>
              <div className="delay-buttons">
                <button className="delay-btn" onClick={() => handleDelayClick(1)}>1hr</button>
                <button className="delay-btn" onClick={() => handleDelayClick(6)}>6hr</button>
                <button className="delay-btn" onClick={() => handleDelayClick(24)}>24hr</button>
              </div>
            </div>
          </div>

          {/* Swipe Instruction */}
          <div className="swipe-instruction">
            <div className="swipe-arrows">
              <span className="arrow left">← Block</span>
              <span className="swipe-text">Swipe to decide</span>
              <span className="arrow right">Allow →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseIntercept;
