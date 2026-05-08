"use client";

/**
 * [BYLINESHIP_BUTTON] Vendored from shadcn/ui (Button) and re-themed against
 * the Bylineship tokens. After the 2026-05-08 Apple-gallery refresh: pill
 * geometry, obsidian fill, calm hover (opacity, not colour). Source is owned
 * per the Prin7r ShadCN-first baseline (DESIGN.md §3).
 */

import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "default" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-sans font-medium leading-none rounded-full transition-opacity duration-75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-azure disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-obsidian text-snow border border-obsidian hover:opacity-88",
  ghost: "bg-transparent text-ink border border-silver-mist hover:bg-fog hover:border-graphite"
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-12 px-6 text-[16px]",
  sm: "h-10 px-5 text-[14px]",
  lg: "h-14 px-7 text-[17px]"
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
});

export type ButtonAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const ButtonAnchor = React.forwardRef<HTMLAnchorElement, ButtonAnchorProps>(function ButtonAnchor(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return (
    <a
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
});
