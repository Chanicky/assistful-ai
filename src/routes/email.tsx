import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { OutputPanel } from "@/components/output-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { logTask, saveItem } from "@/lib/storage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | AI Workplace Assistant" },
      {
        name: "description",
        content: "Generate professional formal emails from a recipient, subject, purpose and key points.",
      },
      { property: "og:title", content: "Smart Email Generator | AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Generate professional formal emails from a recipient, subject, purpose and key points.",
      },
    ],
  }),
  component: EmailGenerator,
});

function EmailGenerator() {
  const run = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!recipient.trim() || !subject.trim() || !purpose.trim()) {
      toast.error("Please provide valid input.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { recipient, subject, purpose, keyPoints, tone } });
      setOutput(res.content);
      logTask("email", subject);
      toast.success("Completed successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Please provide valid input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Smart Email Generator"
        description="Describe the message and get a polished, professional draft."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5" aria-label="Email inputs">
          <h2 className="text-sm font-semibold">Input</h2>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Priya Menon, Head of Operations"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Q3 vendor contract renewal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Request approval to extend the contract by 12 months."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Key Points</Label>
            <Textarea
              id="points"
              rows={5}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={"One point per line\n- 8% cost reduction\n- Decision needed by 15 Aug"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Formal", "Friendly professional", "Concise", "Persuasive"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={generate} disabled={loading}>
            <Wand2 className="size-4" />
            {loading ? "Generating..." : "Generate"}
          </Button>
        </section>

        <OutputPanel
          title="Output"
          value={output}
          onChange={setOutput}
          loading={loading}
          loadingLabel="Generating..."
          onRegenerate={generate}
          filename={`${subject.trim() || "email"}.txt`}
          placeholder="Your generated email will appear here and stays fully editable."
          onSave={() => {
            saveItem({ kind: "email", title: subject || "Untitled email", content: output });
            toast.success("Completed successfully.");
          }}
        />
      </div>
    </div>
  );
}