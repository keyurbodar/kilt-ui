import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/user-message.css";

export interface UserMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** A MessageFooter under the bubble. */
  footer?: ReactNode;
}

export function UserMessage({ footer, className, children, ...props }: UserMessageProps) {
  return (
    <div data-slot="user-message" className={cn("sumi-user-message", className)} {...props}>
      <div className="sumi-user-message__rail">
        <div className="sumi-user-message__bb">
          <div className="sumi-user-message__md">{children}</div>
        </div>
        {footer != null && <div className="sumi-user-message__ft">{footer}</div>}
      </div>
    </div>
  );
}
