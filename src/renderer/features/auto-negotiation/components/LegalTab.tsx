export function LegalTab() {
  return (
    <div className="legal-tab">
      <div className="tab-header">
        <h2>Legal & Compliance Tools</h2>
        <p>AI-powered legal protection and consumer rights enforcement</p>
      </div>

      <div className="legal-grid">
        <LegalCard
          icon="📜"
          title="AI ToS Reader"
          description="Automatically analyzes Terms of Service for hidden traps"
          features={['Plain language translation', 'Risk highlighting', 'Comparison alerts']}
        />
        <LegalCard
          icon="🚫"
          title="Illegal Price Hike Detection"
          description="Identifies price increases that violate regulations"
          features={['Regional law database', 'Auto-alert system', 'Documentation']}
        />
        <LegalCard
          icon="⚖️"
          title="Consumer Protection Citations"
          description="Auto-cite relevant consumer protection laws"
          features={['Multi-jurisdiction', 'Legal templates', 'Authority references']}
        />
        <LegalCard
          icon="🌍"
          title="Regional Legal Scripts"
          description="Location-specific legal pressure tactics"
          features={['GDPR (EU)', 'CCPA (California)', 'ACCC (Australia)']}
        />
        <LegalCard
          icon="🔍"
          title="Billing Error Forensics"
          description="Detect and document billing discrepancies"
          features={['Pattern analysis', 'Historical comparison', 'Evidence collection']}
        />
        <LegalCard
          icon="💸"
          title="Refund Automation"
          description="Automated refund demand generation"
          features={['Template generation', 'Escalation paths', 'Success tracking']}
        />
        <LegalCard
          icon="🕵️"
          title="Trial Abuse Detection"
          description="Identify vendor trial manipulation tactics"
          features={['Auto-renewal traps', 'Hidden charges', 'Conversion tricks']}
        />
        <LegalCard
          icon="🔄"
          title="Contract Trap Detection"
          description="Flag renewal and commitment traps"
          features={['Auto-renewal alerts', 'Lock-in warnings', 'Exit cost analysis']}
        />
        <LegalCard
          icon="📋"
          title="Dispute Playbooks"
          description="Step-by-step escalation strategies"
          features={['BBB complaints', 'FTC reports', 'Chargebacks']}
        />
        <LegalCard
          icon="💳"
          title="Chargeback Readiness"
          description="Prepare documentation for payment disputes"
          features={['Evidence bundling', 'Timeline creation', 'Bank templates']}
        />
      </div>
    </div>
  );
}

function LegalCard({ icon, title, description, features }: {
  icon: string;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="legal-card">
      <div className="legal-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <ul className="legal-features">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
