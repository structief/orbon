import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMockRepoById,
  getMockSpecById,
  getMockPlaceholderSections,
} from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ repoId: string; specId: string }>;
}

export default async function MockSpecDetailPage({ params }: PageProps) {
  const { repoId, specId } = await params;
  if (!specId) notFound();

  const repo = getMockRepoById(repoId);
  const spec = getMockSpecById(specId);
  const placeholders = getMockPlaceholderSections();

  if (!repo || !spec) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">
            <Link href={`/mock/repos/${repoId}`} className="hover:text-sky-600">
              {repo.owner} / {repo.name}
            </Link>
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{spec.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{spec.status}</Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/mock/repos/${repoId}/specs/${specId}/edit`} aria-label="Edit spec">
            Edit
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="detail" className="space-y-6">
          {spec.journeys.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-slate-700">User journeys</h2>
              <ul className="space-y-4">
                {spec.journeys.map((journey) => (
                  <li key={journey.id}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{journey.title}</CardTitle>
                          <Badge>{journey.priority}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{journey.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {journey.acceptanceScenarios.map((scenario) => (
                          <div
                            key={scenario.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800"
                          >
                            <p>
                              <span className="font-medium text-slate-500">Given </span>
                              {scenario.given}
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">When </span>
                              {scenario.when}
                            </p>
                            <p>
                              <span className="font-medium text-slate-500">Then </span>
                              {scenario.then}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {spec.requirements.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-slate-700">Requirements</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
                {spec.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {spec.successCriteria.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-slate-700">Success criteria</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
                {spec.successCriteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium text-slate-700">Future sections</h2>
            <ul className="space-y-2">
              {placeholders.map((ph) => (
                <li key={ph.id}>
                  <Card className="border-dashed border-slate-300 bg-slate-50">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">{ph.title}</CardTitle>
                      <p className="text-xs text-slate-500">{ph.description}</p>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>
        <TabsContent value="history">
          <p className="text-sm text-slate-500">
            <Link
              href={`/mock/repos/${repoId}/specs/${specId}/history`}
              className="text-sky-600 hover:underline"
            >
              Open History page
            </Link>{" "}
            to view mock history entries.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
