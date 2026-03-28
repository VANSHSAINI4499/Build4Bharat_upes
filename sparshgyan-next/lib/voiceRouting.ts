export type AgentDestination =
  | 'home'
  | 'login'
  | 'dashboard'
  | 'ai_course'
  | 'vision_assist'
  | 'live_captions';

export const DESTINATION_PATHS: Record<AgentDestination, string> = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  ai_course: '/product',
  vision_assist: '/vision',
  live_captions: '/captions',
};

export function resolveDestination(destination: AgentDestination) {
  const path = DESTINATION_PATHS[destination];

  return {
    path,
    fallback: false,
    message: `Navigated to ${destination}.`,
  };
}

export function inferDestinationFromCommand(
  command: string,
): AgentDestination | null {
  const lower = command.toLowerCase().trim();

  if (lower.includes('home')) return 'home';
  if (lower.includes('dashboard') || lower.includes('progress') || lower.includes('parent'))
    return 'dashboard';
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
