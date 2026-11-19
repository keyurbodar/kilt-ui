// Vendored from Kiki (primitives/button/button.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { motion } from "@/registry/kilt/app/lib/motion";
import { DotGridIcon } from "@/registry/kilt/app/primitives/dot-grid-icon";
import { buttonIntentVariants } from "@/registry/kilt/app/primitives/intent";

const iconMargins =
  "[&_svg:first-of-type]:-ml-0.5 [&_svg:last-of-type]:-mr-0.5";

export const buttonVariants = cva(
  [
    "cursor-pointer relative inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded [text-box-trim:trim-both] text-nowrap",
    "border-hairline font-medium",
    motion.hover,
    motion.focusRing,
    "select-none",
    "desktop-no-drag",
    motion.touchTarget,
    motion.disabled,
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "data-[selected]:bg-secondary data-[selected]:text-foreground",
    "group/button",
  ],
  {
    variants: {
      variant: {
        solid:
          "bg-[var(--intent-bg,var(--button))] border-[var(--intent-border-solid,var(--intent-border,var(--border-2)))] text-[var(--intent-text-on-bg,var(--fg))] [--focus-ring:var(--intent-text-on-bg,var(--ring))] shadow-[inset_0_calc(var(--spacing-hairline)*2)_var(--intent-highlight,var(--highlight-top)),var(--sh-plate)] hover:bg-[var(--intent-bg-solid-hover,var(--button-hover))] active:shadow-none active:brightness-97",
        soft: "border-transparent bg-[var(--intent-bg-soft,var(--secondary))] text-[var(--intent-text,var(--fg))] hover:bg-[var(--intent-bg-soft-hover,var(--secondary-hover))] active:brightness-97",
        ghost:
          "border-transparent bg-transparent text-[var(--intent-text,var(--muted-foreground-1))] hover:text-[var(--intent-text-hover,var(--fg))] hover:bg-[var(--intent-bg-hover,var(--secondary))] data-[popup-open]:text-[var(--intent-text-hover,var(--fg))] active:brightness-97 data-[selected]:data-[unfocused]:bg-secondary/50 data-[selected]:data-[unfocused]:text-muted-foreground-1 data-[selected]:data-[unfocused]:hover:bg-secondary data-[selected]:data-[unfocused]:hover:text-foreground",
        outline:
          "bg-transparent border-[var(--intent-border,var(--border-2))] text-[var(--intent-text,var(--fg))] hover:bg-[var(--intent-bg-hover,var(--secondary))] active:brightness-97",
        link: "border-transparent bg-transparent text-[var(--intent-text,var(--text-link))] hover:underline underline-offset-2 disabled:opacity-40",
        bare: "border-transparent bg-transparent text-[var(--intent-text,var(--muted-foreground-1))] hover:text-[var(--intent-text-hover,var(--fg))] data-[popup-open]:text-[var(--intent-text-hover,var(--fg))] data-[selected]:bg-transparent data-[selected]:text-[var(--intent-text-hover,var(--fg))] active:brightness-97 disabled:opacity-40",
        inverse:
          "border-transparent bg-[var(--intent-bg,var(--inverse))] text-[var(--intent-text-on-bg,var(--inverse-text))] hover:bg-[var(--intent-bg-solid-hover,var(--inverse-hover))] active:brightness-95 disabled:opacity-50 data-[selected]:bg-[var(--intent-bg,var(--inverse))] data-[selected]:text-[var(--intent-text-on-bg,var(--inverse-text))]",
        segmented:
          "border-transparent bg-transparent text-[var(--intent-text,var(--segmented-foreground))] hover:text-[var(--intent-text-hover,var(--fg))] active:brightness-97 data-[selected]:bg-[var(--intent-bg,var(--card))] data-[selected]:text-[var(--intent-text-hover,var(--fg))] data-[selected]:shadow-card",
      },
      intent: buttonIntentVariants,
      size: {
        auto: "h-auto gap-1",
        "auto-sm": "h-auto gap-1 text-sm",
        "auto-xs": "h-auto gap-1 text-xs",
        xs: `h-(--h-control-xs) px-2 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-(--icon-xs) ${iconMargins}`,
        sm: `h-(--h-control-sm) px-2.5 md:px-2 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-(--icon-sm) ${iconMargins}`,
        base: `h-(--h-control-base) px-3 md:px-2.5 text-sm gap-2 [&_svg:not([class*='size-'])]:size-(--icon-base) ${iconMargins}`,
        lg: `h-(--h-control-lg) px-4 text-sm gap-2 [&_svg:not([class*='size-'])]:size-(--icon-base) ${iconMargins}`,
        "icon-xs":
          "size-(--h-control-xs) [&_svg:not([class*='size-'])]:size-(--icon-xs)",
        "icon-sm":
          "size-(--h-control-sm) [&_svg:not([class*='size-'])]:size-(--icon-sm)",
        "icon-sm-narrow":
          "h-(--h-control-sm) px-1 [&_svg:not([class*='size-'])]:size-(--icon-sm)",
        "icon-base":
          "size-(--h-control-base) [&_svg:not([class*='size-'])]:size-(--icon-base)",
        "icon-shrink":
          "inline-flex [&_svg:not([class*='size-'])]:size-(--icon-sm)",
      },
      shape: {
        default: "",
        "segment-start": "rounded-r-none border-r-0 shadow-none",
        "segment-end": "rounded-l-none shadow-none",
      },
    },
    defaultVariants: {
      variant: "solid",
      intent: "neutral",
      size: "sm",
      shape: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = useRender.ComponentProps<"button"> &
  ButtonVariants & {
    loading?: boolean;
    loadingLabel?: ReactNode;
  };

function buttonChildren(children: ReactNode, loading: boolean): ReactNode {
  const spinner = <DotGridIcon size="inherit" aria-hidden />;
  const items = Children.toArray(children);
  const first = items[0];
  if (!isValidElement<ButtonIconProps>(first) || first.type !== ButtonIcon) {
    return loading ? [spinner, ...items] : children;
  }
  return [
    cloneElement(first, {
      loading: loading || undefined,
      side: first.props.side ?? (items.length === 1 ? "only" : "leading"),
    }),
    ...items.slice(1),
  ];
}

export function Button({
  render,
  className,
  variant,
  intent,
  size,
  shape,
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const content = render
    ? children
    : loading && loadingLabel != null
      ? [<DotGridIcon key="spinner" size="inherit" aria-hidden />, loadingLabel]
      : buttonChildren(children, loading);
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        "data-slot": "button",
        className: buttonVariants({ variant, intent, size, shape, className }),
        disabled: disabled || loading,
        "aria-busy": loading || undefined,
        children: content,
      } as ComponentProps<"button">,
      props,
    ),
  });
}

export type ButtonIconProps = ComponentProps<"span"> & {
  side?: "leading" | "trailing" | "only";
  loading?: boolean;
};

const sideMargins = {
  only: "-mx-0.5",
  leading: "-ml-0.5",
  trailing: "-mr-0.5",
} as const;

export function ButtonIcon({
  children,
  className,
  side = "leading",
  loading = false,
  style,
  ...props
}: ButtonIconProps) {
  const child = isValidElement<{ className?: string; style?: object }>(children)
    ? (children as ReactElement<{ className?: string; style?: object }>)
    : null;
  const childClassName =
    [child?.props.className, className].filter(Boolean).join(" ") || undefined;
  const childStyle = { ...child?.props.style, margin: 0 };
  return (
    <span
      data-slot="button-icon"
      className={[
        "inline-flex shrink-0 items-center justify-center",
        sideMargins[side],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {loading ? (
        <DotGridIcon
          size="inherit"
          aria-hidden
          className={childClassName}
          style={childStyle}
        />
      ) : child ? (
        cloneElement(child, { className: childClassName, style: childStyle })
      ) : (
        children
      )}
    </span>
  );
}
