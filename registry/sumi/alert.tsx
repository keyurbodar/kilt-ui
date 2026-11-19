import type { ComponentType, HTMLAttributes, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { AlertSiAccentIcon, AlertSiDefaultIcon, AlertSiErrorIcon, AlertSiInfoIcon, AlertSiSuccessIcon, AlertSiWarningIcon } from "./icons";
import "./tokens.css";
import "./styles/alert.css";

export type AlertColor = "neutral" | "accent" | "danger" | "warning" | "success" | "info";

const ICON: Record<AlertColor, [string, ComponentType<SVGProps<SVGSVGElement>>]> = {
  success: ["si-success", AlertSiSuccessIcon],
  danger: ["si-error", AlertSiErrorIcon],
  warning: ["si-warning", AlertSiWarningIcon],
  info: ["si-info", AlertSiInfoIcon],
  accent: ["si-accent", AlertSiAccentIcon],
  neutral: ["si-default", AlertSiDefaultIcon],
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  color?: AlertColor;
  title: ReactNode;
  description?: ReactNode;
  /** Trailing action, usually a Button. */
  action?: ReactNode;
}

export function Alert({ color = "warning", title, description, action, className, ...props }: AlertProps) {
  const [iconClass, Icon] = ICON[color];
  return (
    <div data-slot="alert" role="status" data-color={color} className={cn("sumi-alert", className)} {...props}>
      <span className={`sumi-alert__si sumi-alert__${iconClass}`}>
        <Icon />
      </span>
      <div className="sumi-alert__tx">
        <h5 className="sumi-alert__t">{title}</h5>
        {description != null && <div className="sumi-alert__d">{description}</div>}
      </div>
      {action != null && <div className="sumi-alert__ac">{action}</div>}
    </div>
  );
}
