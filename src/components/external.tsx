import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-teal underline decoration-line underline-offset-4 hover:decoration-teal"
    >
      {children}
      <ArrowUpRight className="size-4 shrink-0" aria-hidden />
    </a>
  );
}
