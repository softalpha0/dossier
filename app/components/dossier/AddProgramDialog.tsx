import { IconLink, IconPlus } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PROGRAM_TYPES, typeLabel } from "@/lib/dossier";
import { sendAgentTask } from "@/lib/agent-task";

const MAX_PASTE = 20_000;

function isHttpUrl(value: string) {
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * "Add program": hands the reading-and-extracting work to the agent, which
 * calls fetch-program-page and add-program in the visible side panel.
 */
export function AddProgramDialog({
  triggerClassName,
  size = "default",
}: {
  triggerClassName?: string;
  size?: "default" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"link" | "text">("link");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [type, setType] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const urlError =
    touched && mode === "link" && !isHttpUrl(url)
      ? "Enter the full link, starting with https://"
      : null;
  const textError =
    touched && mode === "text" && text.trim().length < 80
      ? "Paste the program's rules and questions (at least a few lines)."
      : null;

  function submit() {
    setTouched(true);
    const typeHint = type
      ? `It is a ${type}.`
      : "Work out the program type from the page.";
    if (mode === "link") {
      if (!isHttpUrl(url)) return;
      void sendAgentTask({
        message: `Add this program to Dossier from its official page: ${url.trim()}\n${typeHint}`,
        context: JSON.stringify({ task: "add-program", sourceUrl: url.trim(), programType: type || null }),
      });
    } else {
      if (text.trim().length < 80) return;
      void sendAgentTask({
        message: `Add this program to Dossier from the text I pasted (no link). ${typeHint}\n\n---\n${text.trim().slice(0, MAX_PASTE)}`,
        context: JSON.stringify({ task: "add-program", sourceUrl: null, programType: type || null }),
      });
    }
    setOpen(false);
    setUrl("");
    setText("");
    setType("");
    setTouched(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size === "lg" ? "lg" : "default"} className={triggerClassName}>
          <IconPlus className="size-4" strokeWidth={2} />
          Add program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="dossier-serif text-2xl font-medium">
            Add a program
          </DialogTitle>
          <DialogDescription>
            Dossier reads the official call and turns its rules, questions and
            deadline into a checklist. Anything the page doesn't say is marked
            "Not stated".
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "link" | "text")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">From a link</TabsTrigger>
            <TabsTrigger value="text">Paste the text</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="mt-4 space-y-2">
            <Label htmlFor="program-url">Official program page</Label>
            <div className="relative">
              <IconLink className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="program-url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://…"
                className="pl-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                aria-invalid={urlError ? true : undefined}
                aria-describedby="program-url-help"
              />
            </div>
            <p id="program-url-help" className={urlError ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {urlError ?? "Use the page with the rules and questions, not a news article about it."}
            </p>
          </TabsContent>
          <TabsContent value="text" className="mt-4 space-y-2">
            <Label htmlFor="program-text">Program text</Label>
            <Textarea
              id="program-text"
              rows={8}
              placeholder="Paste the eligibility rules, required documents, questions and deadline…"
              value={text}
              maxLength={MAX_PASTE}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={textError ? true : undefined}
              aria-describedby="program-text-help"
            />
            <p id="program-text-help" className={textError ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {textError ?? "Best for PDFs and pages that need a login."}
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="program-type">Type (optional)</Label>
          <select
            id="program-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Let Dossier work it out</option>
            {PROGRAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Read and add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
