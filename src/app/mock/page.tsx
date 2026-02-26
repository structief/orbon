import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MockEntryPage() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <Card className="max-w-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Spec Editor Mock
          </p>
          <CardTitle>Sign-in / onboarding (preview)</CardTitle>
          <CardDescription>
            This is a static mock of the Spec Editor MVP UI. Use it to click
            through the main journeys before any backend is implemented.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm text-slate-800">
            <p>
              Continue to a mock dashboard that shows a connected repository
              and entry points into the main spec journeys.
            </p>
            <p className="text-xs text-slate-500">
              No real authentication happens here; everything is in-memory and
              safe to demo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/mock/dashboard">Continue to mock dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Back to workspace root</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

