import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INDILERT - Civilian Disaster Warning",
  description: "Official civilian interface for emergency alerts and guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="max-w-md mx-auto min-h-screen bg-white relative flex flex-col shadow-xl overflow-hidden pb-16">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <Navigation />
        </div>
      </body>
    </html>
  );
}
