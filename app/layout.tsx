import type { Metadata } from "next";
import { Playfair_Display, Alex_Brush } from "next/font/google";
import "./globals.css";
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alex-brush",
});

export const metadata: Metadata = {
  title: "Engagement Invitation",
  description: "Wedding & Engagement Card",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
