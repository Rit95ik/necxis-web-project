import * as React from 'react';
import ClientLayout from '@/components/ClientLayout';
import '@/app/globals.css';

export const metadata = {
  title: 'Necxis App',
  description: 'A web application for the Necxis project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
} 