"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DialogClIcon } from "./icons";
import "./tokens.css";
import "./styles/dialog.css";
import "./styles/live.css";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export interface DialogContentProps extends Omit<ComponentProps<typeof BaseDialog.Popup>, "title"> {
  size?: "base" | "xl";
  spacing?: "default" | "compact";
  title: ReactNode;
  description?: ReactNode;
  /** Footer buttons. */
  actions?: ReactNode;
}

export function DialogContent({ size = "base", spacing = "default", title, description, actions, className, children, ...props }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="kilt-backdrop" />
      <div className="kilt-modal">
        <BaseDialog.Popup data-slot="dialog" data-size={size} data-spacing={spacing} className={cn("kilt-dialog", className)} {...props}>
          <div className="kilt-dialog__hd">
            <BaseDialog.Title className="kilt-dialog__t">{title}</BaseDialog.Title>
            <BaseDialog.Close className="kilt-dialog__cl" aria-label="Close">
              <DialogClIcon />
            </BaseDialog.Close>
            {description != null && <BaseDialog.Description className="kilt-dialog__d">{description}</BaseDialog.Description>}
          </div>
          {children != null && <div className="kilt-dialog__bd">{children}</div>}
          {actions != null && <div className="kilt-dialog__ft">{actions}</div>}
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
}
