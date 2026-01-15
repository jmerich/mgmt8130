import { AI_AGENTS, type AgentKey } from '../types';

interface StrategiesTabProps {
  selectedAgent: AgentKey;
  onSelectAgent: (agent: AgentKey) => void;
}

export function StrategiesTab({ selectedAgent, onSelectAgent }: StrategiesTabProps) {
  return (
    <div className="strategies-tab">
      <div className="tab-header">
        <h2>AI Negotiation Strategies</h2>
        <p>Choose your AI agent personality and advanced tactics</p>
      </div>

      {/* Agent Selection */}
      <section className="strategy-section">
        <h3>🤖 Agent Personalities</h3>
        <p className="section-desc">Select an AI personality that matches your negotiation style</p>
        <div className="agents-grid">
          {Object.entries(AI_AGENTS).map(([key, agent]) => (
            <div
              key={key}
              className={`agent-card ${selectedAgent === key ? 'selected' : ''}`}
              onClick={() => onSelectAgent(key as AgentKey)}
            >
              <div className="agent-icon">{agent.icon}</div>
              <h4>{agent.name}</h4>
              <p className="agent-style">{agent.style}</p>
              <div className="agent-success">
                <div className="success-bar" style={{ width: `${agent.successRate}%` }}></div>
                <span>{agent.successRate}% success</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Tactics */}
      <section className="strategy-section">
        <h3>🎯 Advanced Tactics</h3>
        <div className="tactics-grid">
          <TacticCard
            icon="🔄"
            title="Cancel-Rejoin Loop"
            description="Autonomously cancel and rejoin to trigger win-back offers"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="⏰"
            title="Strategic Lapse"
            description="Let subscriptions lapse to trigger retention offers"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="🔢"
            title="Multi-Round Negotiation"
            description="5-8 strategic turns for maximum discount extraction"
            status="active"
            risk="low"
          />
          <TacticCard
            icon="😢"
            title="Emotional Tone Switching"
            description="Adaptive emotional responses mid-conversation"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="🚀"
            title="Auto-Escalation"
            description="Automatic escalation to human retention teams"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="🕐"
            title="Strategic Delay"
            description="Wait days to reply for maximum pressure"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="📉"
            title="Downgrade Threat"
            description="Threaten plan downgrade instead of full cancellation"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="❌"
            title="Offer Rejection"
            description="Reject initial offers to force better counteroffers"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="📦"
            title="Bundle Threat"
            description="Threaten to cancel multiple services simultaneously"
            status="ready"
            risk="high"
          />
          <TacticCard
            icon="📜"
            title="Loyalty Reference"
            description="Leverage historical subscription length"
            status="active"
            risk="low"
          />
          <TacticCard
            icon="🔍"
            title="Competitor Evaluation"
            description="Pretend to actively evaluate competitors"
            status="ready"
            risk="low"
          />
          <TacticCard
            icon="🤫"
            title="Silence Pressure"
            description="Force vendor to follow up first"
            status="ready"
            risk="medium"
          />
          <TacticCard
            icon="📊"
            title="Historical Average"
            description="Auto-accept only if savings beat historical average"
            status="active"
            risk="low"
          />
        </div>
      </section>
    </div>
  );
}

function TacticCard({ icon, title, description, status, risk }: {
  icon: string;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'disabled';
  risk: 'low' | 'medium' | 'high';
}) {
  return (
    <div className={`tactic-card ${status}`}>
      <div className="tactic-header">
        <span className="tactic-icon">{icon}</span>
        <span className={`tactic-status ${status}`}>{status}</span>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className={`risk-badge ${risk}`}>
        {risk === 'low' ? '🟢' : risk === 'medium' ? '🟡' : '🔴'} {risk} risk
      </div>
    </div>
  );
}
