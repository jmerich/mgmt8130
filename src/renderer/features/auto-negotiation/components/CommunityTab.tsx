export function CommunityTab() {
  return (
    <div className="community-tab">
      <div className="tab-header">
        <h2>Community & Social</h2>
        <p>Leverage collective intelligence for better negotiations</p>
      </div>

      {/* Leaderboard */}
      <section className="leaderboard-section">
        <h3>🏆 Top Negotiators This Month</h3>
        <div className="leaderboard">
          <div className="leaderboard-item rank-1">
            <span className="rank">1</span>
            <span className="avatar">👤</span>
            <span className="name">SaverPro***</span>
            <span className="savings">$847 saved</span>
          </div>
          <div className="leaderboard-item rank-2">
            <span className="rank">2</span>
            <span className="avatar">👤</span>
            <span className="name">Budget***</span>
            <span className="savings">$623 saved</span>
          </div>
          <div className="leaderboard-item rank-3">
            <span className="rank">3</span>
            <span className="avatar">👤</span>
            <span className="name">Deal***</span>
            <span className="savings">$512 saved</span>
          </div>
        </div>
      </section>

      <div className="community-grid">
        <CommunityCard
          icon="🏆"
          title="Success Leaderboard"
          description="Anonymous ranking of top negotiators"
          metric="12,847 active users"
        />
        <CommunityCard
          icon="📊"
          title="Vendor Cooperation Score"
          description="Community-rated vendor negotiability"
          metric="156 vendors rated"
        />
        <CommunityCard
          icon="📈"
          title="Aggregate Churn Pressure"
          description="Collective bargaining through churn data"
          metric="Coming soon"
        />
        <CommunityCard
          icon="👥"
          title="Collective Bargaining"
          description="Group negotiations for maximum leverage"
          metric="Beta access"
        />
        <CommunityCard
          icon="🏅"
          title="Vendor Badges"
          description="'This vendor caves 42% of the time'"
          metric="23 badges available"
        />
        <CommunityCard
          icon="🧾"
          title="Savings Receipts"
          description="Shareable proof of your wins"
          metric="Share to social"
        />
        <CommunityCard
          icon="❤️"
          title="Subscription Health Score"
          description="Overall subscription portfolio health"
          metric="Your score: 87/100"
        />
        <CommunityCard
          icon="⏸️"
          title="Auto-Pause Unused"
          description="Automatically pause unused subscriptions"
          metric="2 candidates found"
        />
        <CommunityCard
          icon="⏰"
          title="Cancel Before Charge"
          description="Predictive cancellation before billing"
          metric="3 upcoming"
        />
        <CommunityCard
          icon="📉"
          title="Break-Even Optimizer"
          description="Calculate optimal subscription timing"
          metric="Active"
        />
      </div>
    </div>
  );
}

function CommunityCard({ icon, title, description, metric }: {
  icon: string;
  title: string;
  description: string;
  metric: string;
}) {
  return (
    <div className="community-card">
      <div className="community-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="community-metric">{metric}</div>
    </div>
  );
}
