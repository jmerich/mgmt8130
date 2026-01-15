import type { Subscription } from '../../../shared/types';
import { getServiceIcon } from '../utils';

interface SafetyTabProps {
  subscriptions: Subscription[];
}

export function SafetyTab({ subscriptions }: SafetyTabProps) {
  return (
    <div className="safety-tab">
      <div className="tab-header">
        <h2>Safety & Guardrails</h2>
        <p>Protect your subscriptions with intelligent safety controls</p>
      </div>

      {/* Safety Status */}
      <div className="safety-status">
        <div className="safety-indicator active">
          <span className="safety-icon-large">🛡️</span>
          <span className="safety-text">All Safety Systems Active</span>
        </div>
      </div>

      <div className="safety-grid">
        <SafetyCard
          icon="🔒"
          title="Never Lose Access"
          description="Hard guardrail preventing accidental service loss"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="🧪"
          title="Shadow Sandbox"
          description="Simulate negotiations before executing"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="↩️"
          title="Auto-Rollback"
          description="Instant restoration after accidental cancellation"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="⏱️"
          title="Grace Period Engine"
          description="Exploit cancellation grace periods for safety"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="⚠️"
          title="Access Risk Detection"
          description="Real-time monitoring of access status"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="👤"
          title="Human Checkpoints"
          description="Require approval for high-risk services"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="📉"
          title="Partial Cancellation"
          description="Feature-level rollback instead of full cancel"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="🛡️"
          title="Downgrade Shields"
          description="Temporary protection during negotiations"
          enabled={true}
          critical={false}
        />
        <SafetyCard
          icon="🚨"
          title="Emergency Restore"
          description="One-click restoration after contract violations"
          enabled={true}
          critical={true}
        />
        <SafetyCard
          icon="🔴"
          title="Kill Switch"
          description="Per-subscription emergency stop control"
          enabled={true}
          critical={true}
        />
      </div>

      {/* Protected Services */}
      <section className="protected-services">
        <h3>🔐 Protected Services</h3>
        <div className="service-protection-list">
          {subscriptions.slice(0, 8).map(sub => (
            <div key={sub.id} className="protected-service">
              <span className="service-icon">{getServiceIcon(sub.serviceName)}</span>
              <span className="service-name">{sub.serviceName}</span>
              <span className="protection-level high">Full Protection</span>
              <button className="kill-switch-btn">Kill Switch</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SafetyCard({ icon, title, description, enabled, critical }: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  critical: boolean;
}) {
  return (
    <div className={`safety-card ${enabled ? 'enabled' : 'disabled'} ${critical ? 'critical' : ''}`}>
      <div className="safety-header">
        <span className="safety-card-icon">{icon}</span>
        {critical && <span className="critical-badge">CRITICAL</span>}
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="safety-toggle">
        <span className={`toggle ${enabled ? 'on' : 'off'}`}></span>
        <span>{enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
    </div>
  );
}
