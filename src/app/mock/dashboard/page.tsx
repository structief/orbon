import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_REPOS } from "@/lib/mock-data";

export default function MockDashboardPage() {
  const repos = MOCK_REPOS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Connected repositories and quick access to specs.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/mock/repos/connect">Connect a repository</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-700">Connected repositories</h2>
        {repos.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-8 text-center text-sm text-slate-600">
              No repositories connected yet. Use “Connect a repository” to add one (mock).
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {repos.map((repo) => (
              <li key={repo.id}>
                <Link
                  href={`/mock/repos/${repo.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-500/60 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                >
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardHeader className="border-0 p-0 pb-2">
                      <CardTitle className="text-base">
                        {repo.owner} / {repo.name}
                      </CardTitle>
                      <CardDescription>
                        Branch: {repo.defaultBranch} · {repo.specs.length} spec
                        {repo.specs.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 text-xs text-slate-600">
                      View spec overview
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
