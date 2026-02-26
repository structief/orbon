export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
          Spec Editor
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Workspace is ready</h1>
        <p className="mt-2 text-sm text-slate-600">
          This is the root Next.js app. The static mock experience for the Spec
          Editor lives under the <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-800">/mock</code> route.
        </p>
      </div>
    </main>
  );
}

