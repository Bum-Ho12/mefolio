import { Metadata } from 'next';
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Software Engineer`, template: `%s | ${SITE_NAME}` },
  description: "Mobile & full-stack engineer in Nairobi. Flutter, React, Kotlin Multiplatform, Node.js. Creator of mes-engine.",
  // The share image comes from src/app/opengraph-image.tsx.
  openGraph: { type: "website", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}