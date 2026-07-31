import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI Workplace Assistant" },
      { name: "description", content: "Set your display name, signature and output preferences." },
      { property: "og:title", content: "Settings | AI Workplace Assistant" },
      { property: "og:description", content: "Set your display name, signature and output preferences." },
    ],
  }),
  component: SettingsPage,
});

type Prefs = { name: string; signature: string; autoSave: boolean };
const KEY = "awpa.prefs";

function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>({ name: "", signature: "", autoSave: false });

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (raw) setPrefs(JSON.parse(raw) as Prefs);
  }, []);

  const save = () => {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
    toast.success("Completed successfully.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Personalise how your AI output is written." />

      <section className="card-surface space-y-5 p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={prefs.name}
            onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
            placeholder="Alex Carter"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signature">Email signature</Label>
          <Textarea
            id="signature"
            rows={4}
            value={prefs.signature}
            onChange={(e) => setPrefs({ ...prefs, signature: e.target.value })}
            placeholder={"Best regards,\nAlex Carter\nOperations Lead"}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Auto-save generated output</p>
            <p className="text-xs text-muted-foreground">Keep every result in Saved Work automatically.</p>
          </div>
          <Switch
            checked={prefs.autoSave}
            onCheckedChange={(v) => setPrefs({ ...prefs, autoSave: v })}
            aria-label="Auto-save generated output"
          />
        </div>

        <Button onClick={save}>Save</Button>
      </section>

      <p className="text-xs text-muted-foreground">
        AI-generated content should be reviewed for accuracy before professional use.
      </p>
    </div>
  );
}