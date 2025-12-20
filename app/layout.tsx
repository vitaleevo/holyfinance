import type { Metadata } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HolyFinanças",
  description: "Gestão Financeira Pessoal",
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${notoSans.variable} dark`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background-dark text-white overflow-hidden h-screen flex" suppressHydrationWarning>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
