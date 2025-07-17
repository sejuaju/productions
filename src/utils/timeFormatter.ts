const TIME_UNITS: { short: string; seconds: number }[] = [
  { short: 'y', seconds: 31536000 },
  { short: 'mo', seconds: 2592000 },
  { short: 'w', seconds: 604800 },
  { short: 'd', seconds: 86400 },
  { short: 'h', seconds: 3600 },
  { short: 'm', seconds: 60 },
  { short: 'sec', seconds: 1 },
];

export const formatTimeAgo = (timestamp: string | Date): string => {
  if (!timestamp) return '';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  let secondsAgo = Math.round((now.getTime() - date.getTime()) / 1000);

  if (isNaN(secondsAgo)) {
    return '';
  }

  if (secondsAgo < 5) {
    return 'just now';
  }

  const parts: string[] = [];

  for (const { short, seconds } of TIME_UNITS) {
    const count = Math.floor(secondsAgo / seconds);
    if (count > 0) {
      parts.push(`${count}${short}`);
      secondsAgo -= count * seconds;
    }
  }

  if (parts.length === 0) {
    return 'just now';
  }

  // Join the first two largest parts, e.g., "1d 2h", "2h 30min", "30min 5sec"
  return parts.slice(0, 2).join(' ') + ' ago';
}; 