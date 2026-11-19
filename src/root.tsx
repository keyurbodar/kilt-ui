import { Outlet } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { type CSSProperties, Suspense, useEffect, useState } from "react";
import { GitHubStarsProvider } from "@/app/components/right-panel";
import { SidebarLayout } from "@/app/components/sidebar-layout";
import { accentCss } from "@/lib/accent";
import { BaseProvider } from "@/lib/base-context";
import { latestMarks, recentNew } from "@/lib/changelog/load";
import { AccentProvider, AccentShortcut } from "@/lib/docs/accent";
import googleFonts from "@/lib/docs/google-fonts.json";
import { customHeadingVars, googleFontWeights, type GoogleFont } from "@/lib/docs/google-fonts";
import { HeadingFontProvider, HeadingFontShortcut } from "@/lib/docs/heading-font";
import { HoverModeProvider, HoverModeShortcut } from "@/lib/docs/hover-mode";
import { IconPlaygroundProvider } from "@/lib/docs/icon-playground";
import { SettingsPersistence } from "@/lib/docs/settings-persistence";
import { SettingsToast } from "@/lib/docs/settings-toast";
import { ShapeShortcut } from "@/lib/docs/shape-shortcut";
import { SizeAttribute } from "@/lib/docs/size-attribute";
import { SizeShortcut } from "@/lib/docs/size-shortcut";
import { readCustomAccent, readHeadingFont, readHoverMode, readMacPlatform, readSettings } from "@/lib/docs/site-settings";
import { CommandMenuPlatform } from "@/registry/default/command-menu";
import { ShapeProvider } from "@/registry/default/lib/shape-context";
import { SizeProvider } from "@/registry/default/lib/size-context";
import { ThemeProvider } from "@/registry/default/lib/theme-context";

function cookie(name: string): string | undefined {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match === undefined ? undefined : decodeURIComponent(match.slice(name.length + 1));
}

/** The site settings saved in cookies by SettingsPersistence, read once at boot. */
function readBoot() {
  const settings = readSettings(cookie);
  const customAccent = readCustomAccent(cookie);
  const saved = readHeadingFont(cookie);
  const customFont = saved.customFamily ? ((googleFonts as GoogleFont[]).find((f) => f.n === saved.customFamily) ?? null) : null;
  const customWeight =
    customFont && saved.customWeight !== null && googleFontWeights(customFont).includes(saved.customWeight) ? saved.customWeight : null;
  return {
    settings,
    customAccent,
    customFont,
    customWeight,
    headingFont: saved.font === "custom" && !customFont ? "inter" : saved.font,
    hoverMode: readHoverMode(cookie),
    sidebarOpen: cookie("sidebar_state") !== "false",
    mac: readMacPlatform((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? null, navigator.userAgent),
  };
}

const boot = readBoot();
const marks = { ...latestMarks(), recent: recentNew() };

/** Set <html>'s theme class, size, heading font and accent before the first paint. */
export function applyRootAttributes() {
  const root = document.documentElement;
  if (boot.settings.theme !== "system") root.classList.add(boot.settings.theme);
  root.dataset.size = boot.settings.size;
  root.dataset.font = boot.headingFont;
  const vars: Record<string, string> = {
    "--fluid-accent": accentCss(boot.settings.accent, boot.customAccent),
    ...(boot.customFont ? customHeadingVars(boot.customFont, boot.customWeight) : {}),
  };
  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
}

function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/stars")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { stars?: number | null } | null) => setStars(data?.stars ?? null))
      .catch(() => setStars(null));
  }, []);
  return stars;
}

export function Root() {
  const stars = useGitHubStars();
  const { settings } = boot;
  return (
    <MotionConfig reducedMotion="user">
      <ShapeProvider defaultShape={settings.shape}>
        <ShapeShortcut />
        <SizeProvider defaultSize={settings.size}>
          <SizeShortcut />
          <SizeAttribute />
          <ThemeProvider defaultTheme={settings.theme}>
            <IconPlaygroundProvider defaultLibrary={settings.icons}>
              <BaseProvider defaultBase={settings.base}>
                <AccentProvider defaultPreset={settings.accent} defaultCustom={boot.customAccent}>
                  <AccentShortcut />
                  <HeadingFontProvider defaultFont={boot.headingFont} defaultCustom={boot.customFont} defaultWeight={boot.customWeight}>
                    <HeadingFontShortcut />
                    <HoverModeProvider defaultMode={boot.hoverMode}>
                      <HoverModeShortcut />
                      <SettingsPersistence />
                      <GitHubStarsProvider stars={stars}>
                        <CommandMenuPlatform mac={boot.mac}>
                          <SidebarLayout defaultOpen={boot.sidebarOpen} marks={marks}>
                            <Suspense fallback={<div style={{ minHeight: "100vh" } as CSSProperties} />}>
                              <Outlet />
                            </Suspense>
                          </SidebarLayout>
                        </CommandMenuPlatform>
                      </GitHubStarsProvider>
                      <SettingsToast />
                    </HoverModeProvider>
                  </HeadingFontProvider>
                </AccentProvider>
              </BaseProvider>
            </IconPlaygroundProvider>
          </ThemeProvider>
        </SizeProvider>
      </ShapeProvider>
    </MotionConfig>
  );
}
