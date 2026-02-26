import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Spec Editor Mock",
  description: "Static mock of the Spec Editor MVP UI"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}

