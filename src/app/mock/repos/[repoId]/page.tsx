import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockRepoById } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ repoId: string }>;
}

export default async function MockReposRepoPage({ params }: PageProps) {
  const { repoId } = await params;
  const repo = getMockRepoById(repoId);

  if (!repo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {repo.owner} / {repo.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Branch: {repo.defaultBranch} · {repo.specs.length} spec
          {repo.specs.length !== 1 ? "s" : ""}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-700">Specs</h2>
        {repo.specs.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-8 text-center text-sm text-slate-600">
              No specs in this repo for the selected branch. (Mock empty state.)
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {repo.specs.map((spec) => (
              <li key={spec.id}>
                <Link
                  href={`/mock/repos/${repoId}/specs/${spec.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                >
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardHeader className="border-0 p-0 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">{spec.title}</CardTitle>
                        <Badge variant="outline">{spec.status}</Badge>
                        <Badge>{spec.priority}</Badge>
                      </div>
                      <CardDescription>{spec.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 text-xs text-slate-600">
                      Updated {spec.lastUpdated} by {spec.lastAuthor}
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
