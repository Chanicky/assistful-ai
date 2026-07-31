import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Mail, Microscope, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getSaved, getTasks, timeAgo, type TaskItem } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Track recent AI tasks and jump into the email generator or research assistant.",
      },
      { property: "og:title", content: "Dashboard | AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Track recent AI tasks and jump into the email generator or research assistant.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setTasks(getTasks());
      setSavedCount(getSaved().length);
    };
    sync();
    window.addEventListener("awpa:storage", sync);
    return () => window.removeEventListener("awpa:storage", sync);
  }, []);

  const stats = [
    { label: "Recent AI Tasks", value: tasks.length },
    { label: "Emails generated", value: tasks.filter((t) => t.kind === "email").length },
    { label: "Documents analysed", value: tasks.filter((t) => t.kind === "research").length },
    { label: "Saved Work", value: savedCount },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your AI workspace for professional writing and research."
      />

      <section className="gradient-hero flex flex-wrap items-center justify-between gap-4 rounded-xl p-6 text-primary-foreground">
        <div className="max-w-lg">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-80">
            <Sparkles className="size-3.5" /> Start something
          </p>
          <h2 className="mt-2 text-xl font-semibold">Turn rough notes into polished work</h2>
          <p className="mt-1 text-sm opacity-90">
            Draft formal emails or summarise documents, articles and URLs in seconds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/email">
              <Mail className="size-4" /> Email Generator
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/research">
              <Microscope className="size-4" /> Research Assistant
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="card-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent AI Tasks</h2>
          <Link to="/saved" className="text-xs text-primary hover:underline">
            Saved Work
          </Link>
        </div>
        {tasks.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No tasks yet. Generate an email or analyse a document to get started.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  {t.kind === "email" ? <Mail className="size-4" /> : <Microscope className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.kind === "email" ? "Email Generator" : "Research Assistant"} · {timeAgo(t.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <QuickCard
          to="/templates"
          icon={<Bookmark className="size-4" />}
          title="Templates"
          body="Reusable starting points for common workplace emails."
        />
        <QuickCard
          to="/settings"
          icon={<Sparkles className="size-4" />}
          title="Settings"
          body="Set your default tone, signature and output preferences."
        />
      </section>

      <p className="text-xs text-muted-foreground">
        AI-generated content should be reviewed for accuracy before professional use.
      </p>
    </div>
  );
}

function QuickCard({
  to,
  icon,
  title,
  body,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link to={to} className="card-surface group flex items-start gap-3 p-5 transition-colors hover:bg-accent/40">
      <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
