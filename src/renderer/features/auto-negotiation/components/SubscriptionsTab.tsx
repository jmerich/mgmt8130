import type { Subscription } from '../../../shared/types';
import { SubscriptionCard } from './SubscriptionCard';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  negotiatedDiscounts: Record<string, number>;
  onNegotiate: (sub: Subscription) => void;
  activeNegotiationId?: string;
}

export function SubscriptionsTab({
  subscriptions,
  negotiatedDiscounts,
  onNegotiate,
  activeNegotiationId,
}: SubscriptionsTabProps) {
  return (
    <div className="subscriptions-tab">
      <div className="tab-header">
        <h2>Your Subscriptions</h2>
        <p>Select any subscription to start an AI-powered negotiation</p>
      </div>
      <div className="subscriptions-grid">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            discount={negotiatedDiscounts[subscription.id]}
            onNegotiate={() => onNegotiate(subscription)}
            isNegotiating={activeNegotiationId === subscription.id}
          />
        ))}
      </div>
    </div>
  );
}
