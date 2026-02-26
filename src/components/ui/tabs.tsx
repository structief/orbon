"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  readonly value: string;
  readonly onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
}

export function Tabs({ value: controlledValue, defaultValue, onValueChange, className, ...props }: TabsProps) {
  const [uncontrolledValue, setUncontrolled] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const handleChange = (v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  };
  const ctx: TabsContextValue = { value, onValueChange: handleChange };

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn("flex flex-col gap-3", className ?? "")} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1",
        className ?? ""
      )}
      role="tablist"
      {...props}
    />
  );
}

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  readonly value: string;
  readonly icon?: ReactNode;
}

export function TabsTrigger({
  value,
  icon,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);

  if (!ctx) {
    throw new Error("TabsTrigger must be used within <Tabs>");
  }

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
        isActive
          ? "bg-sky-600 text-white"
          : "text-slate-600 hover:bg-slate-200",
        className ?? ""
      )}
      {...props}
    >
      {icon ? <span className="text-base">{icon}</span> : null}
      {children}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  readonly value: string;
}

export function TabsContent({
  value,
  className,
  ...props
}: TabsContentProps) {
  const ctx = useContext(TabsContext);

  if (!ctx) {
    throw new Error("TabsContent must be used within <Tabs>");
  }

  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("rounded-xl border border-slate-200 p-4", className ?? "")}
      {...props}
    />
  );
}

