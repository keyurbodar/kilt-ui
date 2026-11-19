import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/agent-message.css";

export interface AgentMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** First section (markdown-styled). */
  lead: ReactNode;
  /** A MessageFooter under the lead section. */
  footer?: ReactNode;
}

/** Agent turn: a lead section, then any further sections as children. */
export function AgentMessage({ lead, footer, className, children, ...props }: AgentMessageProps) {
  return (
    <div data-slot="agent-message" className={cn("sumi-agent-message", className)} {...props}>
      <div className="sumi-agent-message__sec">
        <div className="sumi-agent-message__md">{lead}</div>
        {footer != null && <div className="sumi-agent-message__ft">{footer}</div>}
      </div>
      {children != null && (
        <div className="sumi-agent-message__sec">
          <div className="sumi-agent-message__md">{children}</div>
        </div>
      )}
    </div>
  );
}
