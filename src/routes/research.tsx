import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Link2, Upload, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { OutputPanel } from "@/components/output-panel";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyzeContent, fetchUrlContent, type Analysis } from "@/lib/ai.functions";
import { extractFileText } from "@/lib/extract-file";
import { logTask, saveItem } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Summarise pasted text, PDFs, DOCX files and article URLs into insights, recommendations and action items.",
      },
      { property: "og:title", content: "AI Research Assistant | AI Workplace Assistant" },
      {
        property: "og:description",
        content:
          "Summarise pasted text, PDFs, DOCX files and article URLs into insights, recommendations and action items.",
      },
    ],
  }),
  component: ResearchAssistant;
});

function formatAnalysis(a: Analysis) {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
  return [
    `Summary\n${a.summary}`,
    `Key Insights\n${list(a.keyInsights)}`,
    `Recommendations\n${list(a.recommendations)}`,
    `Action Items\n${list(a.actionItems)}`,
  ].join("\n\n");
}

function ResearchAssistant() {
  const analyze = useServerFn(analyzeContent);
  const fetchUrl = useServerFn(fetchUrlContent);
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const content = await extractFileText(file);
      if (!content) throw new Error("empty");
      setFileName(file.name);
      setFileText(content);
      toast.success("Completed successfully.");
    } catch {
      toast.error("Please provide valid input.");
    }
  };

  const run = async () => {
    setLoading(true);
    try {
      let content = "";
      let label = "Pasted text";

      if (tab === "text") {
        content = text;
      } else if (tab === "file") {
        content = fileText;
        label = fileName || "Document";
      } else {
        if (!/^https?:\/\/\S+$/.test(url.trim())) throw new Error("Please provide valid input.");
        const res = await fetchUrl({ data: { url: url.trim() } });
        content = res.content;
        label = url.trim();
      }

      if (content.trim().length < 20) throw new Error("Please provide valid input.");

      const result = await analyze({ data: { content, label } });
      setOutput(formatAnalysis(result));
      logTask("research", label.slice(0, 80));
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
        title="AI Research Assistant"
        description="Summarise text, documents or articles into decision-ready output."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5" aria-label="Research inputs">
          <h2 className="text-sm font-semibold">Input</h2>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">Paste Text</TabsTrigger>
              <TabsTrigger value="file">Upload Document</TabsTrigger>
              <TabsTrigger value="url">Enter URL</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4 space-y-2">
              <Label htmlFor="paste">Paste Text</Label>
              <Textarea
                id="paste"
                rows={14}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste meeting notes, a report or any material to analyse."
              />
            </TabsContent>

            <TabsContent value="file" className="mt-4 space-y-3">
              <Label>Upload Document</Label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-surface/60 px-4 py-10 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Upload className="size-5" />
                <span>Click to upload PDF, DOCX or TXT</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              {fileName ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="size-4" /> {fileName} · {fileText.length.toLocaleString()} characters
                </p>
              ) : null}
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-2">
              <Label htmlFor="url">Enter URL</Label>
              <div className="flex gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
                  <Link2 className="size-4" />
                </span>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full" onClick={run} disabled={loading}>
            <Wand2 className="size-4" />
            {loading ? "Analysing..." : "Generate"}
          </Button>
        </section>

        <OutputPanel
          title="Analysis"
          value={output}
          onChange={setOutput}
          loading={loading}
          loadingLabel="Analysing..."
          onRegenerate={run}
          filename="research-analysis.txt"
          placeholder="Summary, Key Insights, Recommendations and Action Items will appear here."
          onSave={() => {
            saveItem({ kind: "research", title: fileName || url || "Research analysis", content: output });
            toast.success("Completed successfully.");
          }}
        />
      </div>
    </div>
  );
}