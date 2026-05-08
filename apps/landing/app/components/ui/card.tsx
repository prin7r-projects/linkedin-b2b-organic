/**
 * [UNDERLINE_CARD] Vendored from shadcn/ui (Card) and re-themed for Underline.
 * Square edges, bone surface, hairline border. The source is owned by this
 * repo per the Prin7r ShadCN-first baseline (DESIGN.md §3).
 */

import * as React from "react";
import { cn } from "@/lib/cn";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, DivProps>(function Card(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("bg-bone border border-ink/15 rounded-none p-7", className)}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(function CardHeader(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("flex flex-col gap-2 mb-3", className)} {...props} />;
});

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn(
          "font-display font-semibold text-[24px] tracking-tightest text-ink leading-tight",
          className
        )}
        {...props}
      />
    );
  }
);

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p ref={ref} className={cn("text-[15px] text-graphite leading-snug", className)} {...props} />
    );
  }
);

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(function CardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props} />;
});

export const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(function CardFooter(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("mt-4 flex items-center gap-3", className)} {...props} />;
});
