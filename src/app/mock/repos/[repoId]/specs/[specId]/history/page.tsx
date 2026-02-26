import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockRepoById, getMockSpecById, getMockHistoryBySpecId } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ repoId: string; specId: string }>;
}

export default async function MockSpecHistoryPage({ params }: PageProps) {
  const { repoId, specId } = await params;
  if (!specId) notFound();

  const repo = getMockRepoById(repoId);
  const spec = getMockSpecById(specId);
  const history = getMockHistoryBySpecId(specId);

  if (!repo || !spec) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-500">
          <Link href={`/mock/repos/${repoId}/specs/${specId}`} className="hover:text-sky-600">
            {spec.title}
          </Link>
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">History (mock)</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mock history entries. Not real Git data.
        </p>
      </div>

      <ul className="space-y-3">
        {history.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-8 text-center text-sm text-slate-600">
              No history entries for this spec in the mock.
            </CardContent>
          </Card>
        ) : (
          history.map((entry) => (
            <li key={entry.id}>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-slate-800">
                    {entry.summary}
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    {entry.timestamp} · {entry.author}
                  </p>
                </CardHeader>
              </Card>
            </li>
          ))
        )}
      </ul>

      <div>
        <Link
          href={`/mock/repos/${repoId}/specs/${specId}`}
          className="text-sm text-sky-600 hover:underline"
        >
          Back to spec detail
        </Link>
      </div>
    </div>
  );
}
