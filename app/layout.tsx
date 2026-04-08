import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://showbizy.ai"),
  title: "ShowBizy — Don't find work. Let work find you.",
  description: "AI creates creative projects and assembles local teams of creatives to execute them. Film, Music, Fashion, Content, Performing Arts, Visual Arts, Events & Brands.",
  icons: {
    icon: [
      { url: "/icon.jpg", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "ShowBizy — Don't find work. Let work find you.",
    description: "AI creates creative projects and assembles local teams of creatives. Film, Music, Fashion, Content, Performing Arts, Visual Arts, Events & Brands.",
    url: "https://showbizy.ai",
    siteName: "ShowBizy",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShowBizy — AI creates creative projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShowBizy — Don't find work. Let work find you.",
    description: "AI creates creative projects and matches local talent.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-MPE006VR07"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-MPE006VR07');` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
