import { useEffect, useRef } from 'react';
import { AI_AGENTS, type NegotiationState } from '../types';

interface NegotiationChatProps {
  negotiation: NegotiationState;
  onClose: () => void;
}

export function NegotiationChat({ negotiation, onClose }: NegotiationChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [negotiation.messages]);

  const agent = negotiation.selectedAgent ? AI_AGENTS[negotiation.selectedAgent] : AI_AGENTS.polite;

  return (
    <div className="negotiation-overlay">
      <div className="negotiation-modal advanced">
        <div className="chat-header">
          <div className="chat-title">
            <span className="chat-icon">{agent.icon}</span>
            <div>
              <h3>Negotiating with {negotiation.subscription.serviceName}</h3>
              <p>{agent.name} - {agent.style}</p>
            </div>
          </div>
          <div className="negotiation-progress">
            <span>Turn {negotiation.currentTurn}/{negotiation.totalTurns}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(negotiation.currentTurn / negotiation.totalTurns) * 100}%` }}
              ></div>
            </div>
          </div>
          {negotiation.status !== 'chatting' && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>

        <div className="chat-messages">
          {negotiation.messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? agent.icon : '👤'}
              </div>
              <div className="message-content">
                <span className="message-sender">
                  {msg.role === 'ai' ? agent.name : `${negotiation.subscription.serviceName} Rep`}
                </span>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}

          {negotiation.status === 'chatting' && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {negotiation.status === 'success' && negotiation.discount && (
          <div className="negotiation-result success">
            <div className="result-icon">🎉</div>
            <h4>Negotiation Successful!</h4>
            <p className="discount-amount">{negotiation.discount}% discount secured</p>
            <p className="savings-detail">
              You'll save ${((negotiation.subscription.currentPrice * negotiation.discount) / 100).toFixed(2)}/month
            </p>
            <button className="btn primary" onClick={onClose}>Done</button>
          </div>
        )}

        {negotiation.status === 'failed' && (
          <div className="negotiation-result failed">
            <div className="result-icon">😔</div>
            <h4>No Discount Available</h4>
            <p>The service wasn't able to offer a discount at this time. Try again in 30 days.</p>
            <button className="btn secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
