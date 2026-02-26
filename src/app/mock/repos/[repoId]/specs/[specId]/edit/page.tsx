"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SPECS } from "@/lib/mock-data";

export default function MockSpecEditPage() {
  const router = useRouter();
  const params = useParams();
  const repoId = params.repoId as string;
  const specId = params.specId as string;

  const [saved, setSaved] = useState(false);
  const spec = specId ? MOCK_SPECS.find((s) => s.id === specId) : null;

  if (!specId || !spec) {
    return (
      <div className="text-sm text-slate-600">
        Spec not found.{" "}
        <Link href={`/mock/repos/${repoId}`} className="text-sky-600 hover:underline">
          Back to overview
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    router.push(`/mock/repos/${repoId}/specs/${specId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit spec (mock)</h1>
        <p className="mt-1 text-sm text-slate-500">
          Changes are not persisted. This is a static mock.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Spec content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-xs font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                type="text"
                defaultValue={spec.title}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Requirements (one per line, mock)
              </label>
              <textarea
                rows={4}
                defaultValue={spec.requirements.join("\n")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Success criteria (one per line, mock)
              </label>
              <textarea
                rows={4}
                defaultValue={spec.successCriteria.join("\n")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit">Save (mock)</Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href={`/mock/repos/${repoId}/specs/${specId}`}>Cancel</Link>
          </Button>
        </div>
      </form>

      {saved && (
        <p className="text-sm text-sky-600">Redirecting to spec detail…</p>
      )}
    </div>
  );
}
