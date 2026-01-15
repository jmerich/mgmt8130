import type { Anomaly } from '../types';

interface AnomaliesTabProps {
  anomalies: Anomaly[];
  onResolve: (id: string, action: 'resolve' | 'dismiss') => void;
}

const typeIcons: Record<Anomaly['type'], string> = {
  price_creep: '📈',
  duplicate: '👯',
  zombie: '🧟',
  outlier: '⚠️',
};

const typeLabels: Record<Anomaly['type'], string> = {
  price_creep: 'Price Creep',
  duplicate: 'Duplicate Charge',
  zombie: 'Unused Subscription',
  outlier: 'Unusual Purchase',
};

export function AnomaliesTab({ anomalies, onResolve }: AnomaliesTabProps) {
  const activeAnomalies = anomalies.filter((a) => a.status === 'new');
  const resolvedAnomalies = anomalies.filter((a) => a.status !== 'new');

  return (
    <div className="anomalies">
      <div className="section-header">
        <h3>Detected Anomalies</h3>
        <p>AI-powered audits surfaced {activeAnomalies.length} issues worth investigating.</p>
      </div>

      {activeAnomalies.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <p>No anomalies detected. Your finances look clean!</p>
        </div>
      ) : (
        <div className="anomaly-list">
          {activeAnomalies.map((anomaly) => (
            <div key={anomaly.id} className="anomaly-card">
              <div className="anomaly-icon">{typeIcons[anomaly.type]}</div>
              <div className="anomaly-content">
                <div className="anomaly-header">
                  <span className="anomaly-type">{typeLabels[anomaly.type]}</span>
                  <span className="anomaly-merchant">{anomaly.merchant}</span>
                </div>
                <p className="anomaly-description">{anomaly.description}</p>
                <div className="anomaly-savings">
                  <span className="savings-amount">💰 ${anomaly.potentialSavings}/year potential savings</span>
                </div>
              </div>
              <div className="anomaly-actions">
                <button className="btn primary small" onClick={() => onResolve(anomaly.id, 'resolve')}>
                  Fix This
                </button>
                <button className="btn secondary small" onClick={() => onResolve(anomaly.id, 'dismiss')}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedAnomalies.length > 0 && (
        <div className="resolved-section">
          <h4>Previously Resolved ({resolvedAnomalies.length})</h4>
          <p className="resolved-summary">
            Total saved: ${resolvedAnomalies.filter((a) => a.status === 'resolved').reduce((sum, a) => sum + a.potentialSavings, 0)}/year
          </p>
        </div>
      )}
    </div>
  );
}
