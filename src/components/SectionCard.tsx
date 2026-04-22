import type { PropsWithChildren, ReactNode } from "react";

interface SectionCardProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const SectionCard = ({
  eyebrow,
  title,
  description,
  actions,
  children,
}: SectionCardProps) => (
  <section className="overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper-strong)]/95 shadow-[0_24px_70px_rgba(13,43,85,0.08)] backdrop-blur">
    <div className="flex flex-col gap-5 border-b border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(13,43,85,0.05),rgba(184,134,11,0.08))] px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[color:var(--navy-soft)]">
            {eyebrow}
          </p>
          <div>
            <h2 className="section-title text-2xl font-semibold text-[color:var(--ink)]">{title}</h2>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--ink-soft)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
    <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
  </section>
);

