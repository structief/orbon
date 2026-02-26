"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_REPOS } from "@/lib/mock-data";

export default function MockReposConnectPage() {
  const router = useRouter();
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showError) return;
    setSubmitted(true);
    const firstRepo = MOCK_REPOS[0];
    if (firstRepo) {
      router.push(`/mock/repos/${firstRepo.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Connect a repository</h1>
        <p className="mt-1 text-sm text-slate-500">
          Simulated connection. No real Git or API calls are made.
        </p>
      </div>

      {showError && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800">Connection failed (mock)</CardTitle>
            <CardDescription className="text-xs text-amber-800">
              This is a mock error state. Invalid repo or failed connection—for stakeholder review only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setShowError(false)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Repository details</CardTitle>
          <CardDescription>
            Enter owner and repository name. In this mock, any submit will redirect to the
            existing mock repo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="owner" className="mb-1 block text-xs font-medium text-slate-700">
                Owner
              </label>
              <input
                id="owner"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. structief"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="repo" className="mb-1 block text-xs font-medium text-slate-700">
                Repository name
              </label>
              <input
                id="repo"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g. spec-editor"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={showError}>Connect (mock)</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowError(true)}
              >
                Show error state (mock)
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/mock/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {submitted && (
        <p className="text-xs text-sky-600">
          Redirecting to mock repo overview…
        </p>
      )}
    </div>
  );
}
