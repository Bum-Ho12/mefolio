import { Metadata } from 'next';
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://mefolio-three.vercel.app"),
  title: { default: "Bumho Nisubire — Software Engineer", template: "%s | Bumho Nisubire" },
  description: "Mobile & full-stack engineer in Nairobi. Flutter, React, Kotlin Multiplatform, Node.js. Creator of mes-engine.",
  openGraph: { type: "website", siteName: "Bumho Nisubire", images: ["/og.png"] },
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