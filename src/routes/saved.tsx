import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Mail, Microscope, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { deleteSaved, downloadText, getSaved, timeAgo, type SavedItem } from "@/lib/storage";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Work | AI Workplace Assistant" },
      { name: "description", content: "Revisit, copy and download every draft and analysis you saved." },
      { property: "og:title", content: "Saved Work | AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Revisit, copy and download every draft and analysis you saved.",
      },
    ],
  }),
  component: SavedWork,
});

function SavedWork() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getSaved());
    sync();
    window.addEventListener("awpa:storage", sync);
    return () => window.removeEventListener("awpa:storage", sync);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Saved Work" description="Everything you saved from the generators." />

      {items.length === 0 ? (
        <div className="card-surface p-12 text-center text-sm text-muted-foreground">
          Nothing saved yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  {item.kind === "email" ? <Mail className="size-4" /> : <Microscope className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                      toast.success("Completed successfully.");
                    }}
                  >
                    <Copy className="size-4" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadText(`${item.title || "saved"}.txt`, item.content)}
                  >
                    <Download className="size-4" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => deleteSaved(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-surface/60 p-4 font-sans text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}