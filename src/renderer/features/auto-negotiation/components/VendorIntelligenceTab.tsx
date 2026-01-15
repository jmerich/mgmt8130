import { VENDOR_INTELLIGENCE } from '../demo-data';
import { getServiceIcon } from '../utils';

export function VendorIntelligenceTab() {
  return (
    <div className="intelligence-tab">
      <div className="tab-header">
        <h2>Vendor Intelligence Database</h2>
        <p>Real-time insights on vendor negotiation behavior and patterns</p>
      </div>

      {/* Global Stats */}
      <div className="intel-stats">
        <div className="intel-stat">
          <span className="intel-stat-icon">🌐</span>
          <span className="intel-stat-value">2.4M+</span>
          <span className="intel-stat-label">Negotiations Analyzed</span>
        </div>
        <div className="intel-stat">
          <span className="intel-stat-icon">💡</span>
          <span className="intel-stat-value">847</span>
          <span className="intel-stat-label">Crowd-Sourced Tips</span>
        </div>
        <div className="intel-stat">
          <span className="intel-stat-icon">📈</span>
          <span className="intel-stat-value">23%</span>
          <span className="intel-stat-label">Avg Discount Achieved</span>
        </div>
        <div className="intel-stat">
          <span className="intel-stat-icon">🎯</span>
          <span className="intel-stat-value">78%</span>
          <span className="intel-stat-label">Success Rate</span>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="vendor-intel-grid">
        {Object.entries(VENDOR_INTELLIGENCE).map(([vendor, intel]) => (
          <div key={vendor} className="vendor-intel-card">
            <div className="vendor-header">
              <span className="vendor-icon">{getServiceIcon(vendor)}</span>
              <h3>{vendor}</h3>
              <div className={`generosity-score ${intel.generosityScore >= 70 ? 'high' : intel.generosityScore >= 50 ? 'medium' : 'low'}`}>
                {intel.generosityScore}/100
              </div>
            </div>

            <div className="vendor-metrics">
              <div className="metric">
                <span className="metric-label">Difficulty</span>
                <span className={`metric-value difficulty-${intel.negotiationDifficulty.toLowerCase()}`}>
                  {intel.negotiationDifficulty}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Discount</span>
                <span className="metric-value">{intel.avgDiscount}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Win-Back</span>
                <span className="metric-value">{intel.winBackLikelihood}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Price Floor</span>
                <span className="metric-value">${intel.priceFloor}</span>
              </div>
            </div>

            <div className="best-timing">
              <span className="timing-icon">⏰</span>
              <span>Best: {intel.bestDay}, {intel.bestTime}</span>
            </div>

            <div className="retention-budget">
              <span className="budget-label">Retention Budget:</span>
              <span className={`budget-value ${intel.retentionBudget.includes('High') ? 'high' : 'medium'}`}>
                {intel.retentionBudget}
              </span>
            </div>

            <div className="crowd-tips">
              <h4>💡 What Works</h4>
              <ul>
                {intel.crowdSourcedTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Heat Map Section */}
      <section className="heatmap-section">
        <h3>🗓️ Negotiation Success Heatmap</h3>
        <p>Best days and times to negotiate across all vendors</p>
        <div className="heatmap">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="heatmap-row">
              <span className="day-label">{day}</span>
              {[...Array(12)].map((_, hour) => {
                const intensity = Math.random();
                return (
                  <div
                    key={hour}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: `rgba(76, 175, 80, ${intensity})`,
                    }}
                    title={`${day} ${hour + 8}:00 - ${Math.round(intensity * 100)}% success`}
                  ></div>
                );
              })}
            </div>
          ))}
          <div className="heatmap-legend">
            <span>8AM</span>
            <span>12PM</span>
            <span>4PM</span>
            <span>8PM</span>
          </div>
        </div>
      </section>
    </div>
  );
}
