export function isErrorMessage(message: string): boolean {
  if (!message) return false;
  const errorKeywords = ['already exists', 'not found', 'error', 'invalid', 'failed'];
  return errorKeywords.some(keyword => message.toLowerCase().includes(keyword));
}