import type { ReactNode } from "react";
import { MockLayout as MockLayoutShell } from "@/components/mock/MockLayout";

interface MockLayoutProps {
  readonly children: ReactNode;
}

export default function MockLayout({ children }: MockLayoutProps) {
  return <MockLayoutShell>{children}</MockLayoutShell>;
}

