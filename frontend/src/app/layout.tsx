import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, Upload, History, BarChart } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI-Powered Workflow Automation System",
  description: "Digitize handwritten manufacturing logs using Gemini",
};

import ConnectionObserver from "@/components/ConnectionObserver";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex h-screen overflow-hidden`}>
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
          <div className="p-4 text-xl font-bold text-white border-b border-slate-800">
            Workflow AI
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/upload" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition">
              <Upload className="w-5 h-5" />
              Upload
            </Link>
            <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition">
              <History className="w-5 h-5" />
              History
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition opacity-50 cursor-not-allowed">
              <BarChart className="w-5 h-5" />
              Analytics (Soon)
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <header className="bg-white shadow-sm h-16 flex items-center px-6 md:hidden">
            <span className="text-xl font-bold">Workflow AI</span>
          </header>
          <div className="p-6">
            {children}
          </div>
          <ConnectionObserver />
        </main>
      </body>
    </html>
  );
}
