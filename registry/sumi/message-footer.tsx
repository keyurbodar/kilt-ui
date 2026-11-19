import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MessageFooterIbIcon, MessageFooterIb2Icon, MessageFooterIb3Icon } from "./icons";
import "./tokens.css";
import "./styles/message-footer.css";

export interface MessageFooterProps extends HTMLAttributes<HTMLDivElement> {
  time: ReactNode;
  /** Replaces the default copy / retry / more icon buttons. */
  actions?: ReactNode;
}

export function MessageFooter({ time, actions, className, ...props }: MessageFooterProps) {
  return (
    <div data-slot="message-footer" className={cn("sumi-message-footer", className)} {...props}>
      <span className="sumi-message-footer__tm">{time}</span>
      {actions ?? (
        <>
          <span className="sumi-message-footer__ib"><MessageFooterIbIcon /></span>
          <span className="sumi-message-footer__ib"><MessageFooterIb2Icon /></span>
          <span className="sumi-message-footer__ib"><MessageFooterIb3Icon /></span>
        </>
      )}
    </div>
  );
}
