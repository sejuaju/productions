import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ExtSwap | Layer 2 DEX Platform",
  description: "The most efficient Layer 2 DEX platform for swapping tokens with minimal fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
