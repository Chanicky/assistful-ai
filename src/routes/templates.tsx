import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates | AI Workplace Assistant" },
      { name: "description", content: "Ready-made prompts for common workplace emails and analyses." },
      { property: "og:title", content: "Templates | AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Ready-made prompts for common workplace emails and analyses.",
      },
    ],
  }),
  component: Templates,
});

const templates = [
  {
    title: "Meeting follow-up",
    body: "Recap decisions, owners and deadlines after an internal meeting.",
  },
  { title: "Project status update", body: "Share progress, risks and next milestones with stakeholders." },
  { title: "Client proposal", body: "Introduce scope, timeline and pricing in a persuasive tone." },
  { title: "Deadline extension request", body: "Ask for more time with clear justification." },
  { title: "Escalation notice", body: "Raise a blocking issue politely but firmly." },
  { title: "Report analysis brief", body: "Turn a long report into insights and action items." },
];

function Templates() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Templates" description="Start from a proven structure instead of a blank page." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.title} className="card-surface flex flex-col p-5">
            <p className="text-sm font-semibold">{t.title}</p>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.body}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 self-start"
              onClick={() => navigate({ to: t.title === "Report analysis brief" ? "/research" : "/email" })}
            >
              Use template <ArrowRight className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}