const botRegex = /(bot|crawler|spider|preview|headless|lighthouse|facebookexternalhit|slackbot|embedly|discordbot|linkedinbot|whatsapp|telegrambot)/i;

export function isBotUserAgent(userAgent?: string | null): boolean {
  if (!userAgent) {
    return false;
  }
  return botRegex.test(userAgent);
}
