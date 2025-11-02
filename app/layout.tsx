import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "./context/Web3Context";

export const metadata: Metadata = {
  title: "The Legacy Protocol",
  description: "Secure Your Digital Legacy. Automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?display=swap&amp;family=Inter%3Awght%40400%3B500%3B700%3B900&amp;family=Noto+Sans%3Awght%40400%3B500%3B700%3B900&amp;family=Space+Grotesk%3Awght%40400%3B500%3B700&amp;family=Plus+Jakarta+Sans%3Awght%40400%3B500%3B700%3B800"
        />
      </head>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}