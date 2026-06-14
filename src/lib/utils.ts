// Update the affiliate code prefix from FST to FAST
export function generateAffiliateCode(): string {
  const prefix = 'FAST';
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  return `${prefix}${randomNum}${randomLetter}`;
}

// Update the validation pattern
export function isValidAffiliateCode(code: string): boolean {
  const pattern = /^FAST\d{4}[A-Z]$/;
  return pattern.test(code);
}