/**
 * Capy's Explore theme listings, from the capture of /explore/themes and each
 * listing's detail page: names, makers, copy, versions, add counts, palettes
 * and effects are the captured values. Palettes are CSS custom properties, the
 * way the detail page's stage reads them.
 */

type ThemeFixture = ThemeListingFixture["theme"];

const theme0Light = {
  "--bg": "#eef1f6",
  "--fg": "#4a5068",
  "--text": "#4a5068",
  "--primary": "#6a5ae0",
  "--primary-text": "#ffffff",
  "--shader-ink": "#6a5ae0",
  "--muted-foreground-1": "#5a6078",
  "--muted-foreground-2": "#6a7086",
  "--muted-foreground-3": "#8a90a3",
  "--icon-muted": "#8a90a3",
  "--text-link": "#2b73d5",
};

const theme0Dark = {
  "--bg": "#0a0b1e",
  "--fg": "#d2daf6",
  "--text": "#d2daf6",
  "--primary": "#a99cf5",
  "--primary-text": "#14142e",
  "--shader-ink": "#a99cf5",
  "--chrome": "#0a0b1e",
  "--panel": "#11132a",
  "--card": "#171a34",
  "--card-hover": "#1f223f",
  "--popover": "#2a2d4d",
  "--input": "var(--card)",
  "--muted": "#3c4066",
  "--muted-foreground-1": "#b9c0e0",
  "--muted-foreground-2": "#a2aacc",
  "--muted-foreground-3": "#7a80a6",
  "--icon-muted": "#7a80a6",
  "--text-link": "#8ccfff",
};

const theme1Light = {
  "--bg": "#e3e5e9",
  "--fg": "#444760",
  "--text": "#444760",
  "--primary": "#7b35ec",
  "--primary-text": "#ffffff",
  "--shader-ink": "#7b35ec",
  "--muted-foreground-1": "#54576e",
  "--muted-foreground-2": "#63667c",
  "--muted-foreground-3": "#838698",
  "--icon-muted": "#838698",
};

const theme1Dark = {
  "--bg": "#0c0c15",
  "--fg": "#bac3e0",
  "--text": "#bac3e0",
  "--primary": "#b49eec",
  "--primary-text": "#171727",
  "--shader-ink": "#b49eec",
  "--chrome": "#0c0c15",
  "--panel": "#12121f",
  "--card": "#181828",
  "--card-hover": "#1f1f30",
  "--popover": "#2b2c3d",
  "--input": "var(--card)",
  "--muted": "#3e4053",
  "--muted-foreground-1": "#a7afca",
  "--muted-foreground-2": "#949ab5",
  "--muted-foreground-3": "#6e728a",
  "--icon-muted": "#6e728a",
};

const theme2Light = {
  "--bg": "#eef3f7",
  "--fg": "#1b2b38",
  "--text": "#1b2b38",
  "--primary": "#2c6ea7",
  "--primary-text": "#ffffff",
  "--shader-ink": "#2c6ea7",
  "--muted-foreground-1": "#3b4d5c",
  "--muted-foreground-2": "#556877",
  "--muted-foreground-3": "#7c8d9a",
  "--icon-muted": "#7c8d9a",
};

const theme2Dark = {
  "--bg": "#0d141b",
  "--fg": "#e3edf3",
  "--text": "#e3edf3",
  "--primary": "#8cc1e4",
  "--primary-text": "#0b1a24",
  "--shader-ink": "#8cc1e4",
  "--chrome": "#0d141b",
  "--panel": "#121b23",
  "--card": "#17232c",
  "--card-hover": "#1d2a35",
  "--popover": "#23313d",
  "--input": "var(--card)",
  "--muted": "#32424f",
  "--muted-foreground-1": "#c1d0db",
  "--muted-foreground-2": "#a2b3c0",
  "--muted-foreground-3": "#798b99",
  "--icon-muted": "#798b99",
};

const theme3Light = {
  "--bg": "#efeff0",
  "--fg": "#1b1b1d",
  "--text": "#1b1b1d",
  "--primary": "#d97b00",
  "--primary-text": "#170d00",
  "--shader-ink": "#d97b00",
};

const theme3Dark = {
  "--bg": "#000000",
  "--fg": "#ffffff",
  "--text": "#ffffff",
  "--primary": "#58c24c",
  "--primary-text": "#000000",
  "--shader-ink": "#58c24c",
  "--chrome": "#000000",
};

const theme4Light = {
  "--bg": "#f4ebed",
  "--fg": "#2a1e22",
  "--text": "#2a1e22",
  "--primary": "#aa194f",
  "--primary-text": "#fff7f8",
  "--shader-ink": "#aa194f",
};

const theme4Dark = {
  "--bg": "#000000",
  "--fg": "#ede3e6",
  "--text": "#ede3e6",
  "--primary": "#e27284",
  "--primary-text": "#270c11",
  "--shader-ink": "#e27284",
  "--chrome": "#000000",
  "--panel": "#0c0709",
  "--card": "#170d12",
  "--card-hover": "#1e1318",
  "--popover": "#24161d",
  "--input": "var(--card)",
  "--button": "#1e1318",
  "--button-hover": "#26191f",
  "--muted": "#442f38",
  "--muted-foreground-1": "#a2989c",
  "--muted-foreground-2": "#7b7074",
  "--muted-foreground-3": "#5a5154",
  "--icon-muted": "#5f5659",
};

const theme5Light = {
  "--bg": "#f2f2f4",
  "--fg": "#1e1e20",
  "--text": "#1e1e20",
  "--primary": "#3b5de8",
  "--primary-text": "#ffffff",
  "--shader-ink": "#778abd",
};

const theme5Dark = {
  "--bg": "#09090a",
  "--fg": "#ebebec",
  "--text": "#ebebec",
  "--primary": "#21a388",
  "--primary-text": "#ffffff",
  "--shader-ink": "#566a9e",
};

const theme6Light = {
  "--bg": "#f2f2f4",
  "--fg": "#1e1e20",
  "--text": "#1e1e20",
  "--primary": "#3b5de8",
  "--primary-text": "#ffffff",
  "--shader-ink": "#778abd",
};

const theme6Dark = {
  "--bg": "#1f1d2c",
  "--fg": "#fdf5de",
  "--text": "#fdf5de",
  "--primary": "#364699",
  "--primary-text": "#fdf5de",
  "--shader-ink": "#958ac0",
};

const theme7Light = {
  "--bg": "#efeff0",
  "--fg": "#ae6300",
  "--text": "#1b1b1d",
  "--primary": "#b64200",
  "--primary-text": "#170d00",
  "--shader-ink": "#d97b00",
  "--chrome": "#e7e0d7",
};

const theme7Dark = {
  "--bg": "#000000",
  "--fg": "#ae6300",
  "--text": "#ffffff",
  "--primary": "#b64200",
  "--primary-text": "#000000",
  "--shader-ink": "#ff9000",
  "--chrome": "#190303",
};

const theme8Light = {
  "--bg": "#f2f2f4",
  "--fg": "#1e1e20",
  "--text": "#1e1e20",
  "--primary": "#3b5de8",
  "--primary-text": "#ffffff",
  "--shader-ink": "#778abd",
};

const theme8Dark = {
  "--bg": "#09090a",
  "--fg": "#ebebec",
  "--text": "#ebebec",
  "--primary": "#456af6",
  "--primary-text": "#ffffff",
  "--shader-ink": "#566a9e",
};

const theme9Light = {
  "--bg": "#f3f3f1",
  "--fg": "#2d2d2b",
  "--text": "#2d2d2b",
  "--primary": "#c65b3a",
  "--primary-text": "#ffffff",
  "--shader-ink": "#c65b3a",
};

const theme9Dark = {
  "--bg": "#252523",
  "--fg": "#f9f9f7",
  "--text": "#f9f9f7",
  "--primary": "#e07a5f",
  "--primary-text": "#ffffff",
  "--shader-ink": "#e07a5f",
};

const theme10Light = {
  "--bg": "#fcfcfc",
  "--fg": "#27272a",
  "--text": "#27272a",
  "--primary": "#1b4ed8",
  "--primary-text": "#ffffff",
  "--shader-ink": "#1b4ed8",
  "--chrome": "#fafafa",
  "--panel": "#fcfcfc",
  "--card": "#ffffff",
  "--card-hover": "#f4f4f5",
  "--popover": "#ffffff",
  "--input": "#ffffff",
  "--button": "#fafafa",
  "--button-hover": "#f4f4f5",
  "--muted": "#fafafa",
  "--muted-foreground-1": "#71717b",
  "--muted-foreground-2": "#9f9fa9",
  "--muted-foreground-3": "#d4d4d8",
  "--icon-muted": "#71717b",
  "--text-link": "#1b4ed8",
};

const theme10Dark = {
  "--bg": "#0a0a0a",
  "--fg": "#f5f5f5",
  "--text": "#f5f5f5",
  "--primary": "#346bf1",
  "--primary-text": "#ffffff",
  "--shader-ink": "#346bf1",
  "--chrome": "#000000",
  "--panel": "#0a0a0a",
  "--card": "#111111",
  "--card-hover": "#1b1b1b",
  "--popover": "#1b1b1b",
  "--input": "#1e1e1e",
  "--button": "#121212",
  "--button-hover": "#1b1b1b",
  "--muted": "#121212",
  "--muted-foreground-1": "#818181",
  "--muted-foreground-2": "#5c5c5c",
  "--muted-foreground-3": "#3d3d3d",
  "--icon-muted": "#818181",
  "--text-link": "#60a5fa",
};

const theme11Light = {
  "--bg": "#fffbeb",
  "--fg": "#1f1f1f",
  "--text": "#1f1f1f",
  "--primary": "#a3144d",
  "--primary-text": "#ffffff",
  "--shader-ink": "#a3144d",
  "--icon-muted": "#6c664b",
  "--text-link": "#036a96",
};

const theme11Dark = {
  "--bg": "#282a36",
  "--fg": "#f8f8f2",
  "--text": "#f8f8f2",
  "--primary": "#ff79c6",
  "--primary-text": "#282a36",
  "--shader-ink": "#ff79c6",
  "--chrome": "#21222c",
  "--card": "#343746",
  "--card-hover": "#424450",
  "--popover": "#343746",
  "--input": "var(--card)",
  "--muted": "#44475a",
  "--muted-foreground-3": "#6272a4",
  "--icon-muted": "#6272a4",
  "--text-link": "#8be9fd",
};

const theme12Light = {
  "--bg": "#f2f4f8",
  "--fg": "#2a3140",
  "--text": "#2a3140",
  "--primary": "#f6c108",
  "--primary-text": "#ffffff",
  "--shader-ink": "#5e6ad2",
};

const theme12Dark = {
  "--bg": "#080a0f",
  "--fg": "#e6e9ef",
  "--text": "#e6e9ef",
  "--primary": "#f6c108",
  "--primary-text": "#ffffff",
  "--shader-ink": "#606acc",
};

const theme0: ThemeFixture = {
  light: theme0Light,
  dark: theme0Dark,
  wallpaper: { name: "Witch on the Holy Night" },
  appearance: { effect: "dither" },
};

const theme1: ThemeFixture = {
  light: theme1Light,
  dark: theme1Dark,
  wallpaper: { name: "Akane Kurokawa" },
  appearance: { effect: "dither" },
};

const theme2: ThemeFixture = {
  light: theme2Light,
  dark: theme2Dark,
  wallpaper: { name: "Mount Fuji" },
  appearance: { effect: "dither" },
};

const theme3: ThemeFixture = {
  light: theme3Light,
  dark: theme3Dark,
  wallpaper: { name: "Kiki's Delivery Service" },
  appearance: { effect: "dither" },
};

const theme4: ThemeFixture = {
  light: theme4Light,
  dark: theme4Dark,
  wallpaper: { name: "Evernight by qianqianjie" },
  appearance: { effect: "dither" },
};

const theme5: ThemeFixture = {
  light: theme5Light,
  dark: theme5Dark,
  wallpaper: { name: "889038782731741140.jpg" },
  appearance: { effect: "grain" },
};

const theme6: ThemeFixture = {
  light: theme6Light,
  dark: theme6Dark,
  wallpaper: { name: "nge.png" },
  appearance: { effect: "dither" },
};

const theme7: ThemeFixture = {
  light: theme7Light,
  dark: theme7Dark,
  wallpaper: {
    name: "Vertical_layout_plan_for_a_169_app_theme_banner_-17932706335",
  },
  appearance: { effect: "dither" },
};

const theme8: ThemeFixture = {
  light: theme8Light,
  dark: theme8Dark,
  wallpaper: { name: "SpaceX Starship HD Wallpaper.jpeg" },
  appearance: { effect: "dither" },
};

const theme9: ThemeFixture = {
  light: theme9Light,
  dark: theme9Dark,
  wallpaper: { name: "图像-(286).jpeg" },
  appearance: { effect: "grain" },
};

const theme10: ThemeFixture = {
  light: theme10Light,
  dark: theme10Dark,
  wallpaper: { name: "1D9CE39D-CDA7-4B35-95B4-601B09586A0B.jpeg" },
  appearance: { effect: "dither" },
};

const theme11: ThemeFixture = {
  light: theme11Light,
  dark: theme11Dark,
  appearance: { effect: "dither" },
};

const theme12: ThemeFixture = {
  light: theme12Light,
  dark: theme12Dark,
  wallpaper: { name: "zenitsu-agatsuma-5120x2880-26520.jpg" },
  appearance: { effect: "dither" },
};

export type ThemeListingFixture = {
  readonly slug: string;
  readonly displayName: string;
  readonly description: string;
  readonly maker: { readonly name: string };
  readonly source: "catalog" | "user";
  readonly version: string;
  readonly adds: number | null;
  readonly featuredRank: number | null;
  /** Capy's Popular ordering, read off its live section: fuji, classic-1pdtkp, akane, kiki. */
  readonly popularRank: number | null;
  readonly theme: {
    readonly light: Readonly<Record<string, string>>;
    readonly dark: Readonly<Record<string, string>>;
    readonly wallpaper?: { readonly name: string };
    readonly appearance: { readonly effect: "dither" | "grain" };
  };
};

export const themeListings: ReadonlyArray<ThemeListingFixture> = [
  {
    slug: "holy-night",
    displayName: "Holy Night",
    description:
      "Lavender starlight on deep navy. Light and dark palettes over a wallpaper.",
    maker: { name: "Justin Sun" },
    source: "catalog",
    version: "1.0.0",
    adds: null,
    featuredRank: 1,
    popularRank: null,
    theme: theme0,
  },
  {
    slug: "akane",
    displayName: "Akane",
    description:
      "Catppuccin dimmed a shade with a violet accent, over a wallpaper.",
    maker: { name: "Justin Sun" },
    source: "catalog",
    version: "1.0.0",
    adds: null,
    featuredRank: null,
    popularRank: 3,
    theme: theme1,
  },
  {
    slug: "fuji",
    displayName: "Fuji",
    description:
      "Snow white and clear sky blue, over a photograph of Mount Fuji from Fujiyoshida.",
    maker: { name: "Justin Sun" },
    source: "catalog",
    version: "1.1.0",
    adds: null,
    featuredRank: null,
    popularRank: 1,
    theme: theme2,
  },
  {
    slug: "kiki",
    displayName: "Kiki",
    description: "True black with a bright green accent, over a wallpaper.",
    maker: { name: "Haris Mehrzad" },
    source: "user",
    version: "1.0.0",
    adds: 0,
    featuredRank: null,
    popularRank: 4,
    theme: theme3,
  },
  {
    slug: "evernight-rain",
    displayName: "Evernight Rain",
    description: "Deep crimson on near black, over a wallpaper.",
    maker: { name: "fishy" },
    source: "user",
    version: "1.0.0",
    adds: 0,
    featuredRank: null,
    popularRank: null,
    theme: theme4,
  },
  {
    slug: "classic-1pdtkp",
    displayName: "Classic",
    description:
      "Light and dark theme with the 889038782731741140.jpg wallpaper.",
    maker: { name: "andrew Huang" },
    source: "user",
    version: "1",
    adds: 24,
    featuredRank: null,
    popularRank: 2,
    theme: theme5,
  },
  {
    slug: "capy-unit-01-ke7emg",
    displayName: "Capy Unit 01",
    description: "Your favorite anime's favorite anime.",
    maker: { name: "Capy user" },
    source: "user",
    version: "1",
    adds: 16,
    featuredRank: null,
    popularRank: null,
    theme: theme6,
  },
  {
    slug: "ninetails-xb3av4",
    displayName: "Ninetails",
    description:
      "Light and dark theme with the Vertical_layout_plan_for_a_169_app_theme_banner_-17932706335 wallpaper.",
    maker: { name: "Yash" },
    source: "user",
    version: "1",
    adds: 14,
    featuredRank: null,
    popularRank: null,
    theme: theme7,
  },
  {
    slug: "capy-custom-zfs3va",
    displayName: "Capy custom",
    description: "Accelerate, anon.",
    maker: { name: "Max Kelly" },
    source: "user",
    version: "1",
    adds: 14,
    featuredRank: null,
    popularRank: null,
    theme: theme8,
  },
  {
    slug: "absolutely-custom-t7w8m5",
    displayName: "Absolutely custom",
    description: "Light and dark theme with the 图像-(286).jpeg wallpaper.",
    maker: { name: "kiodots" },
    source: "user",
    version: "1",
    adds: 8,
    featuredRank: null,
    popularRank: null,
    theme: theme9,
  },
  {
    slug: "t-pkxg2x",
    displayName: "t",
    description:
      "A true-black OLED dark theme and a crisp soft-white light theme.",
    maker: { name: "t" },
    source: "user",
    version: "1",
    adds: 5,
    featuredRank: null,
    popularRank: null,
    theme: theme10,
  },
  {
    slug: "dracula-nh6jx9",
    displayName: "Dracula",
    description:
      "A classic dark theme with vibrant accents, based on Dracula by Zeno Rocha.",
    maker: { name: "Arjun Lall" },
    source: "user",
    version: "1",
    adds: 5,
    featuredRank: null,
    popularRank: null,
    theme: theme11,
  },
  {
    slug: "red-wgnj65",
    displayName: "Zenitsu",
    description:
      "Light and dark theme with the zenitsu-agatsuma-5120x2880-26520.jpg wallpaper.",
    maker: { name: "Ethan Nicolas" },
    source: "user",
    version: "2",
    adds: 2,
    featuredRank: null,
    popularRank: null,
    theme: theme12,
  },
  {
    slug: "ember-fade",
    displayName: "Ember Fade",
    description:
      "Light and dark theme with the zenitsu-agatsuma-5120x2880-26520.jpg wallpaper.",
    maker: { name: "Nils Berg" },
    source: "user",
    version: "2",
    adds: 2,
    featuredRank: null,
    popularRank: null,
    theme: theme12,
  },
  {
    slug: "paper-lantern",
    displayName: "Paper Lantern",
    description:
      "Light and dark theme with the zenitsu-agatsuma-5120x2880-26520.jpg wallpaper.",
    maker: { name: "Mira Sato" },
    source: "user",
    version: "2",
    adds: 2,
    featuredRank: null,
    popularRank: null,
    theme: theme12,
  },
  {
    slug: "cold-porcelain",
    displayName: "Cold Porcelain",
    description:
      "Light and dark theme with the zenitsu-agatsuma-5120x2880-26520.jpg wallpaper.",
    maker: { name: "Owen Renner" },
    source: "user",
    version: "2",
    adds: 2,
    featuredRank: null,
    popularRank: null,
    theme: theme12,
  },
];
