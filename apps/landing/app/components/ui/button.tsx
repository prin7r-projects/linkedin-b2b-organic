"use client";

/**
 * [UNDERLINE_BUTTON] Vendored from shadcn/ui (Button) and re-themed against
 * the Underline tokens. Square edges, ink fill, olive on hover. The source
 * is owned by this repo per the Prin7r ShadCN-first baseline (DESIGN.md §3).
 */

import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "default" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-sans font-medium leading-none transition-colors duration-75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-olive disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-ink text-manuscript border border-ink hover:bg-olive hover:border-olive",
  ghost: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-manuscript"
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-12 px-5 text-[15px]",
  sm: "h-10 px-4 text-sm",
  lg: "h-14 px-6 text-[17px]"
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
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], "rounded-none", className)}
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
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], "rounded-none", className)}
      {...props}
    />
  );
});
