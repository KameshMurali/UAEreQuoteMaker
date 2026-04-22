import { motion, useReducedMotion } from "framer-motion";
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
}: SectionCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,251,253,0.96))] shadow-[0_24px_70px_rgba(7,21,40,0.08)] backdrop-blur"
    >
      <div className="flex flex-col gap-5 border-b border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(15,94,140,0.06),rgba(21,184,176,0.12),rgba(255,255,255,0.3))] px-5 py-5 sm:px-7">
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
    </motion.section>
  );
};
