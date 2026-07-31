import { Check, Copy, Download, RefreshCw, Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { downloadText } from "@/lib/storage";

export function OutputPanel({
  title,
  value,
  onChange,
  onRegenerate,
  onSave,
  filename,
  loading,
  loadingLabel,
  placeholder,
  rows = 18,
  extra,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
  filename: string;
  loading?: boolean;
  loadingLabel?: string;
  placeholder?: string;
  rows?: number;
  extra?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const disabled = !value.trim();

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Completed successfully.");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="card-surface flex min-h-[28rem] flex-col p-5" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {loading ? (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="size-3.5 animate-spin" aria-hidden />
            {loadingLabel ?? "Generating..."}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex-1">
        {extra}
        <Textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Your generated output will appear here."}
          className="h-full min-h-[20rem] resize-y bg-surface/60 font-sans text-sm leading-relaxed"
          aria-label={`${title} editable content`}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copy} disabled={disabled}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy
        </Button>
        <Button size="sm" variant="outline" onClick={onSave} disabled={disabled}>
          <Save className="size-4" /> Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadText(filename, value)}
          disabled={disabled}
        >
          <Download className="size-4" /> Download
        </Button>
        <Button size="sm" onClick={onRegenerate} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Regenerate
        </Button>
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        AI-generated content should be reviewed for accuracy before professional use.
      </p>
    </section>
  );
}