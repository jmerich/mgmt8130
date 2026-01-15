import type { Subscription } from '../../../shared/types';
import { VENDOR_INTELLIGENCE } from '../demo-data';
import { getServiceIcon, formatDate } from '../utils';

interface SubscriptionCardProps {
  subscription: Subscription;
  discount?: number;
  onNegotiate: () => void;
  isNegotiating: boolean;
}

export function SubscriptionCard({ subscription, discount, onNegotiate, isNegotiating }: SubscriptionCardProps) {
  const hasDiscount = discount && discount > 0;
  const discountedPrice = hasDiscount
    ? subscription.currentPrice * (1 - discount / 100)
    : subscription.currentPrice;

  const vendorIntel = VENDOR_INTELLIGENCE[subscription.serviceName];

  return (
    <div className={`subscription-card ${hasDiscount ? 'has-discount' : ''}`}>
      <div className="subscription-icon">
        {getServiceIcon(subscription.serviceName)}
      </div>

      <div className="subscription-info">
        <h3>{subscription.serviceName}</h3>
        <span className="subscription-category">{subscription.category}</span>

        {vendorIntel && (
          <div className="vendor-quick-intel">
            <span className={`generosity-badge ${vendorIntel.generosityScore >= 70 ? 'high' : vendorIntel.generosityScore >= 50 ? 'medium' : 'low'}`}>
              {vendorIntel.generosityScore}% generous
            </span>
            <span className="avg-discount">Avg: {vendorIntel.avgDiscount}% off</span>
          </div>
        )}

        <div className="pricing">
          {hasDiscount ? (
            <>
              <span className="original-price">${subscription.currentPrice.toFixed(2)}</span>
              <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
              <span className="discount-badge">-{discount}%</span>
            </>
          ) : (
            <span className="current-price">
              ${subscription.currentPrice}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          )}
        </div>

        <div className="next-billing">
          Next billing: {formatDate(subscription.nextBillingDate)}
        </div>
      </div>

      <div className="subscription-actions">
        {isNegotiating ? (
          <div className="negotiating-badge">
            <div className="spinner small"></div>
            <span>Negotiating...</span>
          </div>
        ) : hasDiscount ? (
          <div className="success-badge">✓ Discount Applied</div>
        ) : subscription.negotiationEligible ? (
          <button className="btn primary negotiate-btn" onClick={onNegotiate}>
            🤖 AI Negotiate
          </button>
        ) : (
          <span className="not-eligible">Not eligible yet</span>
        )}
      </div>
    </div>
  );
}
