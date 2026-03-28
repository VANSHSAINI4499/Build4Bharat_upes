import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { VoiceAssistant } from '@/components/layout/VoiceAssistant';
import { ElevenLabsWidget } from '@/components/layout/ElevenLabsWidget';
import { WelcomeAnnouncer } from '@/components/layout/WelcomeAnnouncer';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sparshgyan — Accessibility Without Limits',
  description:
    'AI-powered accessibility platform with live captions, haptic Braille, voice navigation, and gesture control for users with disabilities.',
  keywords: [
    'accessibility',
    'braille',
    'live captions',
    'gesture control',
    'voice navigation',
    'deaf',
    'blind',
    'inclusive',
  ],
  authors: [{ name: 'UPES Team' }],
  openGraph: {
    title: 'Sparshgyan — Accessibility Without Limits',
    description:
      'Real-time live captions, haptic Braille via Arduino, gesture control, and voice navigation.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WelcomeAnnouncer />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <VoiceAssistant />
          <ElevenLabsWidget />
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'rgba(13, 13, 20, 0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                color: '#f1f5f9',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
