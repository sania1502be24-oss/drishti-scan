// 100% Client-Side Local Password Analysis Utility
// NEVER transmits or logs passwords to any server or AI

const COMMON_BREACHED_PASSWORDS = new Set([
  'password', '123456', '123456789', 'guest', 'qwerty', '12345678',
  '111111', '12345', '1234567', 'dragon', 'welcome', 'login',
  'admin', 'iloveyou', 'sunshine', 'princess', 'football', 'monkey',
  'charlie', 'donald', 'master', 'letmein', 'shadow', 'superman',
  'trustno1', 'starwars', 'harley', 'batman', 'baseball', 'killer',
  'michael', 'mustang', 'secret', 'jordan', 'chelsea', 'matrix'
]);

const KEYBOARD_SEQUENCES = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  '1234567890', '0987654321', 'poiuytrewq', 'lkjhgfdsa'
];

const MEMORABLE_WORDS = [
  'falcon', 'granite', 'breeze', 'beacon', 'shield', 'harbor',
  'glacier', 'meadow', 'quantum', 'orbit', 'timber', 'summit',
  'voyage', 'radiant', 'echo', 'solstice', 'canyon', 'phoenix',
  'aurora', 'zenith', 'compass', 'nebula', 'cascade', 'strata'
];

export function analyzePassword(password) {
  if (!password) {
    return {
      score: 0,
      label: 'None',
      entropy: 0,
      charCount: 0,
      crackTimeOnline: 'Instant',
      crackTimeOffline: 'Instant',
      warnings: [],
      suggestions: ['Enter a password to evaluate its strength.'],
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSymbol: false,
    };
  }

  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  // Shannon Entropy: H = L * log2(poolSize)
  const entropy = poolSize > 0 ? Math.round(len * Math.log2(poolSize)) : 0;

  const warnings = [];
  const suggestions = [];

  // Check 1: Length
  if (len < 8) {
    warnings.push('Length is dangerously short (< 8 characters).');
    suggestions.push('Increase length to at least 12–16 characters.');
  } else if (len < 12) {
    suggestions.push('Consider aiming for 14+ characters or a memorable multi-word passphrase.');
  }

  // Check 2: Common dictionary / breached passwords
  const lowerPwd = password.toLowerCase();
  if (COMMON_BREACHED_PASSWORDS.has(lowerPwd)) {
    warnings.push('This password appears directly in top breached credential dumps!');
    suggestions.push('Never use common dictionary words or well-known phrases.');
  }

  // Check 3: Repetition
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Contains repetitive character sequences (e.g., "aaa" or "111").');
  }

  // Check 4: Keyboard walks
  for (const seq of KEYBOARD_SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const walk = seq.substring(i, i + 4);
      if (lowerPwd.includes(walk)) {
        warnings.push(`Contains predictable keyboard pattern: "${walk}".`);
        break;
      }
    }
  }

  // Calculate qualitative Score (0 to 100)
  let score = 0;
  // Length contribution (up to 40 pts)
  score += Math.min(40, len * 2.8);

  // Variety contribution (up to 30 pts)
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  score += varietyCount * 7.5;

  // Entropy bonus (up to 30 pts)
  if (entropy > 70) score += 30;
  else if (entropy > 50) score += 20;
  else if (entropy > 35) score += 10;

  // Penalties
  if (warnings.length > 0) {
    score -= warnings.length * 15;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Label & color
  let label = 'Very Weak';
  if (score >= 80) label = 'Excellent';
  else if (score >= 60) label = 'Strong';
  else if (score >= 40) label = 'Fair';
  else if (score >= 20) label = 'Weak';

  // Realistic Crack Times
  // Total search space = poolSize ^ len
  const combinations = Math.pow(poolSize, len);
  
  // Online attack: 100 attempts / min = 1.67 attempts / sec
  const onlineSecs = combinations / (100 / 60);
  const crackTimeOnline = formatDuration(onlineSecs);

  // Offline GPU array: 100 Billion hashes / sec (e.g., 8x RTX 4090 cluster on NTLM/MD5)
  const offlineSecs = combinations / 1e11;
  const crackTimeOffline = formatDuration(offlineSecs);

  if (!hasSymbol) suggestions.push('Include special symbols (!, @, #, $, etc.) to expand combinatorial space.');
  if (!hasNumber) suggestions.push('Add numeric digits.');

  return {
    score,
    label,
    entropy,
    charCount: len,
    crackTimeOnline,
    crackTimeOffline,
    warnings,
    suggestions,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
  };
}

export function generateMemorablePassphrase(wordCount = 4) {
  const chosen = [];
  const words = [...MEMORABLE_WORDS];
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * words.length);
    chosen.push(words[idx]);
  }
  const randomNum = Math.floor(Math.random() * 90 + 10);
  return `${chosen.join('-')}-${randomNum}!`;
}

function formatDuration(seconds) {
  if (seconds < 1) return 'Instant (< 1 sec)';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1000000) return `${(seconds / (31536000 * 1000)).toFixed(1)}k years`;
  return 'Centuries+ (Infeasible)';
}
