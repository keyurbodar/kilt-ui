// Vendored from Kiki (components/model-picker/catalog.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export const efforts = [
  "none",
  "instant",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

export type Effort = (typeof efforts)[number];

export type ModelRoute = {
  kind: "capy" | "member_seat" | "org_credential" | "user_credential";
  label: string;
  service?: string;
  ref?: string;
};

export type ModelEntry = {
  id: string;
  name: string;
  provider: string;
  efforts: ReadonlyArray<Effort>;
  defaultEffort?: Effort;
  fast: boolean;
  pro: boolean;
  ultrafast?: boolean;
  daybreak?: "red" | "blue";
  limits?: { context: number; output?: number };
  pricing?: { input: number; output: number; cacheRead?: number };
  route?: ModelRoute;
  ads?: boolean;
  replaces?: ReadonlyArray<string>;
  unavailable?: "region";
  aliasOf?: string;
};

export type Modes = {
  fast: boolean;
  pro: boolean;
  ultrafast: boolean;
  daybreak: boolean;
};

export const modeKeys = ["fast", "pro", "ultrafast", "daybreak"] as const;

export type ModeKey = (typeof modeKeys)[number];

export type ModelSelection = {
  modelId: string;
  effort?: Effort;
  fast: boolean;
  pro?: boolean;
  ultrafast?: boolean;
  daybreak?: boolean;
};

export type FavoriteSlot = {
  modelId: string;
  effort?: Effort;
  fast: boolean;
  pro?: boolean;
  ultrafast?: boolean;
  daybreak?: boolean;
};

export type RouteKind = "plan" | "credits" | "key";

export type RouteOption = { entry: ModelEntry; label: string; kind: RouteKind };

export type ModelGroup = {
  key: string;
  lab: string;
  name: string;
  older: boolean;
  routes: readonly [RouteOption, ...RouteOption[]];
};

export const defaultModelId = "anthropic/claude-opus-5-5";

export const defaultSelection: ModelSelection = {
  modelId: defaultModelId,
  fast: false,
  pro: false,
};

const labOrder =
  "anthropic.claude-code.openai.xai.bench.moonshotai.zai.deepseek.google.qwen.minimax.xiaomi.tencent.meituan.meta.nvidia.particle.inception.openrouter.vercel-gateway.gravity.codex.copilot.supergrok.claude.azure".split(
    ".",
  );

const labNames: Record<string, string> = {
  anthropic: "Anthropic",
  "claude-code": "Claude Code",
  openai: "OpenAI",
  xai: "xAI",
  bench: "Benchmark",
  moonshotai: "Moonshot",
  zai: "Z.ai",
  deepseek: "DeepSeek",
  google: "Google",
  qwen: "Qwen",
  minimax: "MiniMax",
  xiaomi: "Xiaomi",
  tencent: "Tencent",
  meituan: "Meituan",
  meta: "Meta",
  nvidia: "NVIDIA",
  particle: "Particle",
  inception: "Inception",
  openrouter: "OpenRouter",
  "vercel-gateway": "Vercel AI Gateway",
  gravity: "Gravity",
  codex: "Codex",
  copilot: "Copilot",
  supergrok: "SuperGrok",
  claude: "Claude",
  azure: "Azure",
};

const olderModels = new Set(
  "claude-fable-5-1,claude-fable-5,claude-opus-5,claude-sonnet-5,claude-haiku-4-5,claude-opus-4-8,claude-opus-4-7,claude-sonnet-4-6,claude-opus-4-6,claude-opus-4-5,deepseek-v4.1-flash,deepseek-v4-flash-0731,gemini-3.7-flash,gemini-3.6-flash,kimi-k3,gpt-6-sol,gpt-5.6-sol,gpt-5.6-terra,gpt-5.6-luna,gpt-5.5,gpt-5.5-pro,gpt-5.4-mini,gpt-5.4,gpt-5.3-codex,hy4-preview,hy3,grok-4.6,grok-4.5".split(
    ",",
  ),
);

const effortLabels: Record<Effort, string> = {
  none: "None",
  instant: "Instant",
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra high",
  max: "Max",
};

const claudeCode = "claude-code";

export const effortLabel = (effort: Effort) => effortLabels[effort];

export const labName = (lab: string) => labNames[lab] ?? lab;

export const labRank = (lab: string) => {
  const index = labOrder.indexOf(lab);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const modelSlug = (id: string) => id.slice(id.indexOf("/") + 1);

export const matchesId = (entry: ModelEntry, id: string) =>
  entry.id === id || entry.replaces?.includes(id) === true;

const entryProvider = (entry: ModelEntry) =>
  entry.provider === "custom" && entry.route !== undefined
    ? entry.route.label
    : entry.provider;

export const isPlanEntry = (entry: ModelEntry) =>
  entry.provider === claudeCode ||
  (entry.route?.kind === "member_seat" && entry.route.service === "claude");

export const routeOption = (entry: ModelEntry): RouteOption => {
  if (isPlanEntry(entry)) return { entry, label: "Claude plan", kind: "plan" };
  if (entry.route === undefined || entry.route.kind === "capy")
    return { entry, label: "Capy credits", kind: "credits" };
  if (entry.route.kind === "member_seat")
    return {
      entry,
      label: `${labName(entry.route.service ?? entry.route.label)} plan`,
      kind: "plan",
    };
  return { entry, label: entry.route.label, kind: "key" };
};

export const labOf = (entry: ModelEntry) =>
  entry.provider === claudeCode ? "anthropic" : entryProvider(entry);

export const isKeyEntry = (entry: ModelEntry) =>
  routeOption(entry).kind === "key";

const groupKey = (entry: ModelEntry) =>
  `${labOf(entry)}/${modelSlug(entry.id)}`;

/** The lab a model id belongs to, keyed as `ProviderIcon` and `labOf` key it. */
export const providerOfModelId = (id: string) =>
  id.startsWith(`${claudeCode}/`) ? "anthropic" : id.slice(0, id.indexOf("/"));

export const groupKeyOfId = (id: string) =>
  `${providerOfModelId(id)}/${modelSlug(id)}`;

export function groupModels(
  entries: ReadonlyArray<ModelEntry>,
): ReadonlyArray<ModelGroup> {
  const visible = entries.some((entry) => entry.aliasOf !== undefined)
    ? entries.filter((entry) => entry.aliasOf === undefined)
    : entries;
  return [...new Set(visible.map(groupKey))]
    .flatMap((key): ModelGroup[] => {
      const [first, ...rest] = visible
        .filter((entry) => groupKey(entry) === key)
        .toSorted((a, b) => Number(isPlanEntry(b)) - Number(isPlanEntry(a)))
        .map(routeOption);
      if (first === undefined) return [];
      const routes: [RouteOption, ...RouteOption[]] = [first, ...rest];
      return [
        {
          key,
          lab: labOf(first.entry),
          name: first.entry.name,
          older: olderModels.has(modelSlug(first.entry.id)),
          routes,
        },
      ];
    })
    .toSorted((a, b) => labRank(a.lab) - labRank(b.lab));
}

export const findGroup = (groups: ReadonlyArray<ModelGroup>, id: string) =>
  groups.find((group) =>
    group.routes.some((route) => matchesId(route.entry, id)),
  ) ?? groups.find((group) => group.key === groupKeyOfId(id));

export const preferredRoute = (
  group: ModelGroup,
  preferences: Record<string, string>,
  id?: string,
) =>
  group.routes.find(
    (route) => id !== undefined && matchesId(route.entry, id),
  ) ??
  group.routes.find((route) => route.entry.id === preferences[group.key]) ??
  group.routes[0];

export const resolveModes = (
  entry: ModelEntry,
  wanted: Partial<Modes> | undefined,
): Modes => {
  const pro = wanted?.pro === true && entry.pro;
  return {
    pro,
    fast: !pro && wanted?.fast === true && entry.fast,
    ultrafast: !pro && wanted?.ultrafast === true && entry.ultrafast === true,
    daybreak: wanted?.daybreak === true && entry.daybreak !== undefined,
  };
};

export const toggleMode = (modes: Modes, key: ModeKey): Modes =>
  key === "daybreak"
    ? { ...modes, daybreak: !modes.daybreak }
    : {
        fast: false,
        pro: false,
        ultrafast: false,
        daybreak: modes.daybreak,
        [key]: !modes[key],
      };

export const selectEntry = (
  value: ModelSelection,
  entry: ModelEntry,
): ModelSelection => {
  const pro = value.pro === true && entry.pro;
  return {
    ...value,
    modelId: entry.id,
    effort:
      !pro && value.effort !== undefined && entry.efforts.includes(value.effort)
        ? value.effort
        : undefined,
    fast: !pro && value.fast && entry.fast,
    pro,
    ultrafast: !pro && value.ultrafast === true && entry.ultrafast === true,
    daybreak: value.daybreak === true && entry.daybreak !== undefined,
  };
};

export const stepEffort = (
  entry: ModelEntry,
  effort: Effort | undefined,
  step: number,
): Effort | undefined => {
  const from = effort ?? entry.defaultEffort ?? entry.efforts[0];
  const at = from === undefined ? 0 : entry.efforts.indexOf(from) + step;
  return entry.efforts[Math.min(entry.efforts.length - 1, Math.max(0, at))];
};

export const selectionSummary = (
  entry: ModelEntry,
  effort: Effort | undefined,
  modes: Modes,
) => {
  const reasoning = modes.pro ? undefined : (effort ?? entry.defaultEffort);
  return [
    reasoning !== undefined && entry.efforts.length > 0
      ? effortLabel(reasoning)
      : null,
    modes.fast ? "Fast" : null,
    modes.pro ? "Pro" : null,
    modes.ultrafast ? "Ultrafast" : null,
    modes.daybreak ? "Daybreak" : null,
  ]
    .filter((part) => part !== null)
    .join(" ");
};

export const isFreeRoute = (route: RouteOption) =>
  route.kind === "credits" &&
  route.entry.pricing?.input === 0 &&
  route.entry.pricing.output === 0;

export const featuredModels = (groups: ReadonlyArray<ModelGroup>) =>
  groups.flatMap((group) =>
    !group.older && group.routes.some(isFreeRoute)
      ? [
          {
            group,
            note:
              group.routes[0].entry.ads === true
                ? "Free, supported by ads"
                : "Free on Capy",
          },
        ]
      : [],
  );

export const formatContext = (tokens: number) =>
  tokens >= 1_000_000
    ? `${Number((tokens / 1_000_000).toFixed(1))}M`
    : `${Math.round(tokens / 1000)}K`;

export const formatPrice = (amount: number) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 6,
  });

export const priceLabel = (entry: ModelEntry) => {
  if (entry.pricing === undefined) return "";
  if (entry.pricing.input === 0 && entry.pricing.output === 0) return "Free";
  return `${formatPrice(entry.pricing.input)} / ${formatPrice(entry.pricing.output)}`;
};

export const maxFavorites = 9;

export const slotFromModel = (modelId: string): FavoriteSlot => ({
  modelId,
  effort: undefined,
  fast: false,
});

export const matchesSearch = (group: ModelGroup, query: string) => {
  const needle = query.trim().toLowerCase();
  if (needle === "") return true;
  return [group.name, labName(group.lab)].some((field) =>
    field.toLowerCase().includes(needle),
  );
};

const wordMatch = (name: string, query: string) => {
  const lower = name.toLowerCase();
  const needle = query.trim().toLowerCase();
  return (
    lower === needle ||
    lower.startsWith(needle) ||
    lower.split(/[\s\-.]+/).some((word) => word.startsWith(needle))
  );
};

export const searchModels = (
  groups: ReadonlyArray<ModelGroup>,
  query: string,
) =>
  groups
    .filter((group) => matchesSearch(group, query))
    .toSorted(
      (a, b) =>
        Number(wordMatch(b.name, query)) - Number(wordMatch(a.name, query)) ||
        Number(a.older) - Number(b.older),
    );

const rows = (data: unknown): ReadonlyArray<unknown> => {
  if (Array.isArray(data)) return data;
  const models = (data as { models?: unknown } | null)?.models;
  return Array.isArray(models) ? models : [];
};

const isEntry = (item: unknown): item is ModelEntry =>
  typeof item === "object" &&
  item !== null &&
  typeof (item as ModelEntry).id === "string" &&
  (typeof (item as ModelEntry).name === "string" ||
    typeof (item as { label?: unknown }).label === "string");

/**
 * `/models` answers either the bare catalog or an envelope with its
 * credentials, and a catalog row may be as thin as an id, a label and a
 * provider, so the rest fills in with what Capy's picker can live without.
 */
export const parseEntries = (data: unknown): ReadonlyArray<ModelEntry> =>
  rows(data)
    .filter(isEntry)
    .map((item) => {
      const entry = item as ModelEntry & { label?: string };
      return {
        ...entry,
        name: entry.name ?? entry.label ?? modelSlug(entry.id),
        efforts: Array.isArray(entry.efforts) ? entry.efforts : [],
        fast: entry.fast === true,
        pro: entry.pro === true,
      };
    });
