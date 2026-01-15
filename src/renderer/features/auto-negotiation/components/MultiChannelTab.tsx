export function MultiChannelTab() {
  return (
    <div className="channels-tab">
      <div className="tab-header">
        <h2>Multi-Channel Tactics</h2>
        <p>Coordinate negotiations across multiple communication channels</p>
      </div>

      <div className="channels-grid">
        <ChannelCard
          icon="💬"
          title="Live Chat Takeover"
          description="AI takes over live chat negotiations in real-time"
          status="active"
          features={['Real-time response', 'Sentiment analysis', 'Auto-escalation']}
        />
        <ChannelCard
          icon="📧"
          title="Email + Chat Pressure"
          description="Simultaneous pressure across email and chat"
          status="active"
          features={['Coordinated timing', 'Message consistency', 'Follow-up automation']}
        />
        <ChannelCard
          icon="📝"
          title="Web Form Automation"
          description="Automatic submission of cancellation/negotiation forms"
          status="ready"
          features={['Form detection', 'Auto-fill', 'Submission loops']}
        />
        <ChannelCard
          icon="📱"
          title="SMS Escalation"
          description="Text message escalation when other channels fail"
          status="ready"
          features={['Opt-in required', 'Smart timing', 'Response tracking']}
        />
        <ChannelCard
          icon="📞"
          title="AI Voice Calls"
          description="Autonomous voice negotiation with natural speech"
          status="beta"
          features={['Speech synthesis', 'Tone adaptation', 'Call recording']}
        />
        <ChannelCard
          icon="🔄"
          title="Callback Manipulation"
          description="Strategic scheduling of callback requests"
          status="ready"
          features={['Optimal timing', 'Rep selection', 'Queue jumping']}
        />
        <ChannelCard
          icon="🎫"
          title="Ticket Reopening"
          description="Automatic reopening of closed support tickets"
          status="ready"
          features={['Persistence loops', 'Escalation triggers', 'Priority boost']}
        />
        <ChannelCard
          icon="🌍"
          title="Regional Support Hopping"
          description="Route to favorable regional support centers"
          status="ready"
          features={['Timezone advantage', 'Policy differences', 'Language options']}
        />
        <ChannelCard
          icon="🗣️"
          title="Language Switching"
          description="Switch languages for negotiation leverage"
          status="ready"
          features={['Multi-lingual AI', 'Cultural adaptation', 'Policy variations']}
        />
        <ChannelCard
          icon="🧪"
          title="Channel A/B Testing"
          description="Test which channel works best per vendor"
          status="active"
          features={['Success tracking', 'Auto-optimization', 'Vendor profiles']}
        />
      </div>
    </div>
  );
}

function ChannelCard({ icon, title, description, status, features }: {
  icon: string;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'beta' | 'disabled';
  features: string[];
}) {
  return (
    <div className={`channel-card ${status}`}>
      <div className="channel-header">
        <span className="channel-icon">{icon}</span>
        <span className={`channel-status ${status}`}>{status}</span>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <ul className="channel-features">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
