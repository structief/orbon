import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOCK_USER_SESSION } from "@/lib/mock-data";

interface MockLayoutProps {
  readonly children: ReactNode;
}

export function MockLayout({ children }: MockLayoutProps) {
  const user = MOCK_USER_SESSION;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/mock"
              className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-sm font-semibold text-white">
                SE
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight">
                  Spec Editor (Mock)
                </span>
                <span className="text-[11px] text-slate-500">
                  Static click-through preview — no real data
                </span>
              </div>
            </Link>
          </div>

          <nav
            className={cn("flex items-center gap-4 text-xs text-slate-600")}
            aria-label="Mock navigation"
          >
            <Link
              href="/mock/dashboard"
              className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Dashboard
            </Link>
            <span
              className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700"
              title="Mock user"
            >
              {user.name}
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}
