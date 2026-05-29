import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import ToastProvider from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "Scentral",
  description: "Build fragrance combos, plan scent arcs, and share your shelf.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950">
        <ToastProvider>
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
