"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { ToastSiDefaultIcon, ToastSiErrorIcon, ToastSiInfoIcon, ToastSiSuccessIcon, ToastSiWarningIcon, ToastXIcon } from "./icons";
import "./tokens.css";
import "./styles/toast.css";
import "./styles/live.css";

export type ToastType = "default" | "success" | "error" | "warning" | "info";

const ICON: Record<ToastType, ComponentType<SVGProps<SVGSVGElement>>> = {
  default: ToastSiDefaultIcon,
  success: ToastSiSuccessIcon,
  error: ToastSiErrorIcon,
  warning: ToastSiWarningIcon,
  info: ToastSiInfoIcon,
};

export interface ToastData {
  /** Buttons under the description. */
  actions?: ReactNode;
}

/** Global manager: `toast.add({ title, description, type })` from anywhere. */
export const toast = BaseToast.createToastManager<ToastData>();
export const useToast = BaseToast.useToastManager<ToastData>;

function ToastList() {
  const { toasts } = BaseToast.useToastManager<ToastData>();
  return toasts.map((t) => {
    const type = (t.type ?? "default") as ToastType;
    const Icon = ICON[type] ?? ToastSiDefaultIcon;
    return (
      <BaseToast.Root key={t.id} toast={t} data-slot="toast" className="sumi-toast" swipeDirection="right">
        <div className="sumi-toast__ct">
          <div className="sumi-toast__row">
            <div className="sumi-toast__ic">
              <span className={cn("sumi-toast__si", `sumi-toast__si-${type}`)}>
                <Icon />
              </span>
            </div>
            <div className="sumi-toast__bd">
              <BaseToast.Title className="sumi-toast__t" render={<p />} />
              <BaseToast.Description className="sumi-toast__d" />
              {t.data?.actions != null && <div className="sumi-toast__ac">{t.data.actions}</div>}
            </div>
          </div>
        </div>
        <BaseToast.Close className="sumi-toast__x" aria-label="Dismiss notification">
          <ToastXIcon />
        </BaseToast.Close>
      </BaseToast.Root>
    );
  });
}

export interface ToasterProps {
  children?: ReactNode;
  limit?: number;
}

/** Mount once near the root. */
export function Toaster({ children, limit = 3 }: ToasterProps) {
  return (
    <BaseToast.Provider toastManager={toast} limit={limit}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="sumi-toast-viewport">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}
