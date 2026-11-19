"use client";

import { type FormEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { ComposerIb2Icon, ComposerIbIcon, ComposerMcIcon, ComposerMiIcon, ComposerSndIcon } from "./icons";
import "./tokens.css";
import "./styles/composer.css";
import "./styles/live.css";

export interface ComposerProps extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Muted tail after the placeholder. */
  hint?: string;
  model?: ReactNode;
  effort?: ReactNode;
  onModelClick?: () => void;
  /** Replaces the default attach / mention icon buttons. */
  tools?: ReactNode;
}

export function Composer({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder = "Ask anything",
  hint = ", / for commands, @ for context",
  model = "Claude Opus 5.5",
  effort = "Medium",
  onModelClick,
  tools,
  className,
  ...props
}: ComposerProps) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const id = useId();
  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSubmit?.(text);
    set("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <form data-slot="composer" className={cn("kilt-composer", className)} onSubmit={submit} {...props}>
      <span className="kilt-composer__edge" />
      <div className="kilt-composer__fld">
        <textarea
          id={id}
          aria-label={placeholder}
          className="kilt-field-reset"
          value={text}
          onChange={(e) => set(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {text === "" && (
          <span className="kilt-composer__ph" aria-hidden>
            <span>{placeholder}</span>
            <span className="kilt-composer__ph2">{hint}</span>
          </span>
        )}
      </div>
      <div className="kilt-composer__tb">
        <div className="kilt-composer__lft">
          {tools ?? (
            <>
              <button type="button" aria-label="Attach" className="kilt-button-reset kilt-composer__ib">
                <ComposerIbIcon />
              </button>
              <button type="button" aria-label="Add context" className="kilt-button-reset kilt-composer__ib">
                <ComposerIb2Icon />
              </button>
            </>
          )}
          <button type="button" className="kilt-button-reset kilt-composer__mp" onClick={onModelClick}>
            <span className="kilt-composer__mi">
              <ComposerMiIcon />
            </span>
            <span>{model}</span>
            <span className="kilt-composer__ef">{effort}</span>
            <span className="kilt-composer__mc">
              <ComposerMcIcon />
            </span>
          </button>
        </div>
        <button type="submit" aria-label="Send" className="kilt-button-reset kilt-composer__snd">
          <ComposerSndIcon />
        </button>
      </div>
    </form>
  );
}
