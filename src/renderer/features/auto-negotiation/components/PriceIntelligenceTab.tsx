import type { Subscription } from '../../../shared/types';
import { getServiceIcon } from '../utils';

interface PriceIntelligenceTabProps {
  subscriptions: Subscription[];
}

export function PriceIntelligenceTab({ subscriptions }: PriceIntelligenceTabProps) {
  return (
    <div className="pricing-tab">
      <div className="tab-header">
        <h2>Price Intelligence Engine</h2>
        <p>Uncover hidden pricing disparities and maximize savings</p>
      </div>

      {/* Price Alerts */}
      <div className="price-alerts">
        <div className="alert warning">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text"><strong>3 subscriptions</strong> have new-user pricing lower than your current rate</span>
          <button className="alert-action">Investigate</button>
        </div>
        <div className="alert info">
          <span className="alert-icon">💡</span>
          <span className="alert-text"><strong>LinkedIn Premium</strong> has regional pricing 40% lower in India</span>
          <button className="alert-action">View Options</button>
        </div>
      </div>

      <div className="pricing-grid">
        <PricingCard
          icon="👤"
          title="New vs Existing Price"
          description="Detect when new users get better deals"
          status="3 disparities found"
          statusType="warning"
        />
        <PricingCard
          icon="🌍"
          title="Geo-Pricing Arbitrage"
          description="Find lower prices in different regions"
          status="5 opportunities"
          statusType="success"
        />
        <PricingCard
          icon="🎓"
          title="Eligibility Probing"
          description="Check student, military, nonprofit discounts"
          status="2 eligible"
          statusType="success"
        />
        <PricingCard
          icon="😤"
          title="Loyalty Penalty Detection"
          description="Identify when loyalty costs you more"
          status="1 penalty found"
          statusType="warning"
        />
        <PricingCard
          icon="🔎"
          title="Competitor Price Crawler"
          description="Shadow pricing from alternative services"
          status="Active"
          statusType="active"
        />
        <PricingCard
          icon="🤝"
          title="Forced Price Matching"
          description="Leverage competitor prices in negotiation"
          status="Ready"
          statusType="ready"
        />
        <PricingCard
          icon="📈"
          title="Inflation Fairness Score"
          description="Track price increases vs inflation"
          status="2 unfair"
          statusType="warning"
        />
        <PricingCard
          icon="❓"
          title="Why Am I Paying More?"
          description="AI agent that demands pricing justification"
          status="Ready"
          statusType="ready"
        />
        <PricingCard
          icon="⏪"
          title="Retroactive Credits"
          description="Claim credits for past overcharges"
          status="$47.50 available"
          statusType="success"
        />
        <PricingCard
          icon="📦"
          title="Bundle Breaking"
          description="Optimize by unbundling services"
          status="1 opportunity"
          statusType="success"
        />
      </div>

      {/* Price Comparison Table */}
      <section className="price-comparison">
        <h3>💰 Your Prices vs Market</h3>
        <div className="comparison-table">
          <div className="comparison-header">
            <span>Service</span>
            <span>Your Price</span>
            <span>New User</span>
            <span>Best Available</span>
            <span>Status</span>
          </div>
          {subscriptions.slice(0, 6).map(sub => {
            const newUserPrice = sub.currentPrice * (0.7 + Math.random() * 0.2);
            const bestPrice = sub.currentPrice * (0.5 + Math.random() * 0.3);
            const isOverpaying = sub.currentPrice > newUserPrice;
            return (
              <div key={sub.id} className={`comparison-row ${isOverpaying ? 'overpaying' : ''}`}>
                <span className="service-name">
                  {getServiceIcon(sub.serviceName)} {sub.serviceName}
                </span>
                <span className="your-price">${sub.currentPrice.toFixed(2)}</span>
                <span className="new-user-price">${newUserPrice.toFixed(2)}</span>
                <span className="best-price">${bestPrice.toFixed(2)}</span>
                <span className={`price-status ${isOverpaying ? 'warning' : 'ok'}`}>
                  {isOverpaying ? '⚠️ Overpaying' : '✓ Fair'}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PricingCard({ icon, title, description, status, statusType }: {
  icon: string;
  title: string;
  description: string;
  status: string;
  statusType: 'success' | 'warning' | 'active' | 'ready';
}) {
  return (
    <div className="pricing-card">
      <div className="pricing-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className={`pricing-status ${statusType}`}>{status}</div>
    </div>
  );
}
