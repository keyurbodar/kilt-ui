"use client";

import { type ReactNode, useState } from "react";
import { ActivityLine } from "@/registry/kilt/activity-line";
import { AgentMessage } from "@/registry/kilt/agent-message";
import { Alert } from "@/registry/kilt/alert";
import { Badge } from "@/registry/kilt/badge";
import { Button } from "@/registry/kilt/button";
import { CaptainAvatar } from "@/registry/kilt/captain-avatar";
import { Card } from "@/registry/kilt/card";
import { Checkbox } from "@/registry/kilt/checkbox";
import { CommandPalette } from "@/registry/kilt/command-palette";
import { Composer } from "@/registry/kilt/composer";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/registry/kilt/dialog";
import { Input } from "@/registry/kilt/input";
import { Kbd } from "@/registry/kilt/kbd";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/registry/kilt/menu";
import { MenuLabel } from "@/registry/kilt/menu-label";
import { MenuRow } from "@/registry/kilt/menu-row";
import { MenuSeparator } from "@/registry/kilt/menu-separator";
import { MessageFooter } from "@/registry/kilt/message-footer";
import { PaneTab } from "@/registry/kilt/pane-tab";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/kilt/popover";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/registry/kilt/preview-card";
import { ProjectChip } from "@/registry/kilt/project-chip";
import { SidebarModeToggle } from "@/registry/kilt/sidebar-mode-toggle";
import { SidebarSectionHeader } from "@/registry/kilt/sidebar-section-header";
import { SidebarThreadRow } from "@/registry/kilt/sidebar-thread-row";
import { Switch } from "@/registry/kilt/switch";
import { Textarea } from "@/registry/kilt/textarea";
import { Toaster, toast } from "@/registry/kilt/toast";
import { Tooltip, TooltipProvider } from "@/registry/kilt/tooltip";
import { UserMessage } from "@/registry/kilt/user-message";

const AVATAR = "https://doop.design/a/grlpOpk__G.png";
const AVATAR_2 = "https://doop.design/a/dZlPVJgfem.png";

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="flex w-full max-w-[520px] flex-col gap-3">{children}</div>;
}

function MenuDemo() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Open menu</Button>} />
      <MenuContent>
        <MenuItem keys={["⌘", "N"]}>New thread</MenuItem>
        <MenuItem>New Captain</MenuItem>
        <MenuSeparator />
        <MenuItem intent="danger">Archive</MenuItem>
      </MenuContent>
    </Menu>
  );
}

function ModeToggleDemo() {
  const [mode, setMode] = useState<"captains" | "threads">("threads");
  return <SidebarModeToggle mode={mode} onModeChange={setMode} />;
}

function ActivityDemo() {
  const [open, setOpen] = useState(false);
  return (
    <ActivityLine open={open} onClick={() => setOpen((o) => !o)}>
      Worked for 54s
    </ActivityLine>
  );
}

function PaletteDemo() {
  const [open, setOpen] = useState(false);
  const img = (src: string) => <img src={src} alt="" className="size-4 rounded-[2px] object-cover" />;
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} iconEnd={<Kbd variant="default">⌘K</Kbd>}>
        Open palette
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          {
            label: "Captains",
            items: [
              { id: "bosun", label: "Bosun", category: "Captains", icon: img(AVATAR), meta: "11h" },
              { id: "atlas", label: "Atlas", category: "Captains", icon: img(AVATAR_2), meta: "23h" },
            ],
          },
          {
            label: "This thread",
            items: [
              { id: "pin", label: "Pin thread", category: "Threads" },
              { id: "rename", label: "Rename thread", category: "Threads" },
              { id: "delete", label: "Delete thread", category: "Threads", intent: "danger" },
            ],
          },
          {
            label: "Actions",
            items: [
              { id: "new", label: "New thread", category: "Actions", keys: ["⇧", "⌘", "O"] },
              { id: "captain", label: "New Captain", category: "Actions" },
            ],
          },
        ]}
      />
    </>
  );
}

export const kiltDemos: Record<string, () => ReactNode> = {
  "activity-line": () => <ActivityDemo />,
  "agent-message": () => (
    <AgentMessage lead={<p>I updated the tokens and opened a pull request.</p>} footer={<MessageFooter time="2:14 PM" />}>
      <p>Next I will wire the components to the registry.</p>
    </AgentMessage>
  ),
  alert: () => (
    <Stack>
      <Alert color="warning" title="Machine is offline" description="Reconnect it to keep the thread running." action={<Button size="xs">Reconnect</Button>} />
      <Alert color="success" title="Pull request merged" />
      <Alert color="danger" title="Build failed" description="3 checks failed on main." />
      <Alert color="info" title="New model available" />
    </Stack>
  ),
  badge: () => (
    <Row>
      <Badge>Neutral</Badge>
      <Badge color="accent">Accent</Badge>
      <Badge color="success" dot>Merged</Badge>
      <Badge color="warning">Review</Badge>
      <Badge color="danger" variant="filled">Failed</Badge>
      <Badge color="info" variant="ghost">Info</Badge>
      <Badge size="count">3</Badge>
    </Row>
  ),
  button: () => (
    <Stack>
      <Row>
        <Button>New thread</Button>
        <Button intent="accent">Send</Button>
        <Button intent="danger">Archive</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="link">Link</Button>
        <Button variant="inverse">Inverse</Button>
      </Row>
      <Row>
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="base">Base</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </Row>
      <Row>
        <Button variant="segmented" shape="segment-start" selected>Diff</Button>
        <Button variant="segmented" shape="segment-end">Files</Button>
      </Row>
    </Stack>
  ),
  "captain-avatar": () => (
    <Row>
      {(["2xs", "xs", "sm", "base", "xl", "2xl"] as const).map((s) => (
        <CaptainAvatar key={s} src={AVATAR} size={s} alt="Bosun" />
      ))}
    </Row>
  ),
  card: () => (
    <Stack>
      <Card title="Usage">This month used 41% of the plan.</Card>
      <Card variant="interactive" title="Open thread">Interactive cards take focus.</Card>
      <Card variant="panel" footer={<Button size="xs">Manage</Button>}>Panel card with actions.</Card>
    </Stack>
  ),
  checkbox: () => (
    <Row>
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Indeterminate" indeterminate />
      <Checkbox aria-label="Disabled" disabled />
    </Row>
  ),
  "command-palette": () => <PaletteDemo />,
  composer: () => (
    <Stack>
      <Composer />
    </Stack>
  ),
  dialog: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Archive thread</Button>} />
      <DialogContent
        title="Archive this thread?"
        description="Its machines stop and its pull requests keep running."
        actions={
          <>
            <DialogClose render={<Button variant="ghost">Cancel</Button>} />
            <DialogClose render={<Button intent="danger">Archive</Button>} />
          </>
        }
      >
        You can unarchive it from Threads at any time.
      </DialogContent>
    </Dialog>
  ),
  input: () => (
    <Stack>
      <Input placeholder="Search threads…" />
      <Input size="sm" font="mono" placeholder="main" />
      <Input variant="ghost" placeholder="Untitled" />
      <Input aria-invalid placeholder="Invalid" />
      <Input disabled placeholder="Disabled" />
    </Stack>
  ),
  kbd: () => (
    <Row>
      <Kbd variant="default">⌘</Kbd>
      <Kbd>⌘K</Kbd>
      <span className="rounded-md bg-[var(--kilt-color-primary)] p-2">
        <Kbd variant="on-fill">↵</Kbd>
      </span>
    </Row>
  ),
  menu: () => <MenuDemo />,
  "menu-label": () => (
    <div className="kilt-menu w-60">
      <MenuLabel>Projects</MenuLabel>
      <MenuRow>Home</MenuRow>
    </div>
  ),
  "menu-row": () => (
    <div className="kilt-menu w-72">
      <MenuRow keys={["⌘", "N"]}>New thread</MenuRow>
      <MenuRow density="rich" description="Start in this project">New thread</MenuRow>
      <MenuRow highlighted meta="11h">Highlighted</MenuRow>
      <MenuRow checked>Checked</MenuRow>
      <MenuRow intent="danger">Archive</MenuRow>
      <MenuRow disabled>Disabled</MenuRow>
    </div>
  ),
  "menu-separator": () => (
    <div className="kilt-menu w-60">
      <MenuRow>New thread</MenuRow>
      <MenuSeparator />
      <MenuRow intent="danger">Archive</MenuRow>
    </div>
  ),
  "message-footer": () => <MessageFooter time="2:14 PM" />,
  "pane-tab": () => (
    <Row>
      <PaneTab>Overview</PaneTab>
      <PaneTab selected>Diff</PaneTab>
      <PaneTab selected unfocused>Files</PaneTab>
    </Row>
  ),
  popover: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent arrow>Popover content</PopoverContent>
    </Popover>
  ),
  "preview-card": () => (
    <PreviewCard>
      <PreviewCardTrigger render={<Button variant="link">Hover for preview</Button>} />
      <PreviewCardContent width={320}>Preview content</PreviewCardContent>
    </PreviewCard>
  ),
  "project-chip": () => (
    <Row>
      {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
        <ProjectChip key={n} color={`chart-${n}`}>HO</ProjectChip>
      ))}
    </Row>
  ),
  "sidebar-mode-toggle": () => <ModeToggleDemo />,
  "sidebar-section-header": () => (
    <div className="w-60">
      <SidebarSectionHeader count={1}>Working</SidebarSectionHeader>
    </div>
  ),
  "sidebar-thread-row": () => (
    <div className="flex w-60 flex-col">
      <SidebarThreadRow href="#" title="Create Kiki design system tokens" time="30s" chip={<ProjectChip>HO</ProjectChip>} project="Home" machine="build" active />
      <SidebarThreadRow href="#" title="Fix toast swipe" time="2h" chip={<ProjectChip color="chart-5">KI</ProjectChip>} project="Kiki" machine="build2" />
    </div>
  ),
  switch: () => (
    <Row>
      <Switch aria-label="Off" />
      <Switch aria-label="On" defaultChecked />
      <Switch aria-label="Disabled" disabled />
    </Row>
  ),
  textarea: () => (
    <Stack>
      <Textarea placeholder="Describe what you want Capy to build…" rows={3} />
      <Textarea variant="editor" placeholder="Editor" rows={3} />
    </Stack>
  ),
  toast: () => (
    <Toaster>
      <Row>
        {(["success", "error", "warning", "info", "default"] as const).map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => toast.add({ type, title: "Pull request opened", description: "kiki-design#14 is ready for review." })}
          >
            {type}
          </Button>
        ))}
      </Row>
    </Toaster>
  ),
  tooltip: () => (
    <TooltipProvider>
      <Row>
        <Tooltip label="New thread" keys="⌘N">
          <Button variant="outline">Hover me</Button>
        </Tooltip>
        <Tooltip label="Archive">
          <Button variant="ghost">No shortcut</Button>
        </Tooltip>
      </Row>
    </TooltipProvider>
  ),
  "user-message": () => (
    <UserMessage footer={<MessageFooter time="2:13 PM" />}>Build the Kilt registry and deploy it.</UserMessage>
  ),
};
