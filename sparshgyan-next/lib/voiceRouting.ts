export type AgentDestination =
  | 'home'
  | 'login'
  | 'ai_course'
  | 'vision_assist'
  | 'live_captions';

export const DESTINATION_PATHS: Record<AgentDestination, string> = {
  home: '/',
  login: '/',
  ai_course: '/product',
  vision_assist: '/vision',
  live_captions: '/captions',
};

export function resolveDestination(destination: AgentDestination) {
  const path = DESTINATION_PATHS[destination];
  const fallback = destination === 'login';

  return {
    path,
    fallback,
    message: fallback
      ? 'Login is not available in this frontend-only build. Navigated to home.'
      : `Navigated to ${destination}.`,
  };
}

export function inferDestinationFromCommand(
  command: string,
): AgentDestination | null {
  const lower = command.toLowerCase().trim();

  if (lower.includes('home') || lower.includes('dashboard')) return 'home';
  if (lower.includes('caption')) return 'live_captions';
  if (lower.includes('vision') || lower.includes('camera'))
    return 'vision_assist';
  if (
    lower.includes('course') ||
    lower.includes('product') ||
    lower.includes('learn')
  )
    return 'ai_course';
  if (
    lower.includes('login') ||
    lower.includes('sign in') ||
    lower.includes('signin')
  )
    return 'login';

  return null;
}
