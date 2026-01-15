export function AntiDarkPatternTab() {
  return (
    <div className="protection-tab">
      <div className="tab-header">
        <h2>Anti-Dark Pattern Shield</h2>
        <p>Protect yourself from manipulative subscription tactics</p>
      </div>

      {/* Shield Status */}
      <div className="shield-status">
        <div className="shield-visual">
          <span className="shield-icon-xl">🛡️</span>
          <div className="shield-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
        </div>
        <div className="shield-info">
          <h3>Shield Active</h3>
          <p>Protecting against 47 known dark pattern types</p>
          <div className="blocked-count">
            <span className="count">23</span>
            <span className="label">Dark patterns blocked this month</span>
          </div>
        </div>
      </div>

      <div className="protection-grid">
        <ProtectionCard
          icon="🚨"
          title="Fake Urgency Detection"
          description="Identifies artificial scarcity and false deadlines"
          blocked={8}
        />
        <ProtectionCard
          icon="😢"
          title="Emotional Manipulation"
          description="Detects guilt-tripping and fear-based language"
          blocked={5}
        />
        <ProtectionCard
          icon="🏷️"
          title="Dark Pattern Classification"
          description="Categorizes and labels manipulation tactics"
          blocked={12}
        />
        <ProtectionCard
          icon="❄️"
          title="Cooling-Off Enforcer"
          description="Ensures mandatory waiting periods are respected"
          blocked={3}
        />
        <ProtectionCard
          icon="😈"
          title="Guilt-Trip Neutralizer"
          description="Blocks emotional manipulation in cancellation flows"
          blocked={7}
        />
        <ProtectionCard
          icon="😱"
          title="Scare Tactic Deflector"
          description="Neutralizes retention fear tactics"
          blocked={4}
        />
        <ProtectionCard
          icon="🚫"
          title="Do Nothing Pressure"
          description="Resists pressure to maintain status quo"
          blocked={6}
        />
        <ProtectionCard
          icon="⚖️"
          title="Benefits vs Cost Analyzer"
          description="Objective reframing of value propositions"
          blocked={2}
        />
        <ProtectionCard
          icon="💚"
          title="Subscription Shame Removal"
          description="Supportive UI for guilt-free decisions"
          blocked={0}
        />
        <ProtectionCard
          icon="📋"
          title="Vendor Report Card"
          description="Accountability scores for vendor behavior"
          blocked={0}
        />
      </div>

      {/* Recent Blocks */}
      <section className="recent-blocks">
        <h3>🚫 Recently Blocked Dark Patterns</h3>
        <div className="blocks-list">
          <div className="block-item">
            <span className="block-icon">🚨</span>
            <div className="block-details">
              <strong>Netflix</strong>: "Offer expires in 2 hours!" - Fake urgency detected
              <span className="block-time">2 hours ago</span>
            </div>
          </div>
          <div className="block-item">
            <span className="block-icon">😢</span>
            <div className="block-details">
              <strong>Spotify</strong>: "We'll miss you..." - Emotional manipulation blocked
              <span className="block-time">5 hours ago</span>
            </div>
          </div>
          <div className="block-item">
            <span className="block-icon">😱</span>
            <div className="block-details">
              <strong>Adobe</strong>: "You'll lose all your work!" - Scare tactic neutralized
              <span className="block-time">1 day ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProtectionCard({ icon, title, description, blocked }: {
  icon: string;
  title: string;
  description: string;
  blocked: number;
}) {
  return (
    <div className="protection-card">
      <div className="protection-header">
        <span className="protection-icon">{icon}</span>
        {blocked > 0 && <span className="blocked-badge">{blocked} blocked</span>}
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}
