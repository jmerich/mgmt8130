// Utility functions for Auto-Negotiation feature

export function getServiceIcon(serviceName: string): string {
  const icons: Record<string, string> = {
    Netflix: '🎬',
    Spotify: '🎵',
    'Adobe Creative Cloud': '🎨',
    'Amazon Prime': '📦',
    Hulu: '📺',
    'Disney+': '🏰',
    'HBO Max': '🎭',
    'YouTube Premium': '▶️',
    'Microsoft 365': '💼',
    Dropbox: '📁',
    'Apple Music': '🍎',
    NordVPN: '🔒',
    Notion: '📝',
    'Slack Pro': '💬',
    'Grammarly Premium': '✍️',
    'Paramount+': '⛰️',
    'Peacock Premium': '🦚',
    'LinkedIn Premium': '👔',
    'Canva Pro': '🎨',
    'ChatGPT Plus': '🤖',
    'Duolingo Plus': '🦉',
    'New York Times': '📰',
    Peloton: '🚴',
    Masterclass: '🎓',
    Audible: '🎧',
  };
  return icons[serviceName] || '📱';
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
