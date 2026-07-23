import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'SmartInvest - Your Wealth, Perfected',
  description: 'AI-driven investment platform for smart investors',
  icons: {
    icon: '/smartinvest-logo.png',
    shortcut: '/smartinvest-logo.png',
    apple: '/smartinvest-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
