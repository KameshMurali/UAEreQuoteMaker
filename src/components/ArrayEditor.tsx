import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FieldArrayWithId, FieldErrors, UseFormRegister } from "react-hook-form";
import type { QuotationFormValues } from "../types/quotation";

interface ArrayEditorProps {
  title: string;
  description: string;
  fields: FieldArrayWithId<QuotationFormValues, "includedServices" | "excludedServices" | "terms", "id">[];
  name: "includedServices" | "excludedServices" | "terms";
  register: UseFormRegister<QuotationFormValues>;
  errors: FieldErrors<QuotationFormValues>;
  append: (value: { value: string }) => void;
  remove: (index: number) => void;
  addLabel: string;
}

export const ArrayEditor = ({
  title,
  description,
  fields,
  name,
  register,
  errors,
  append,
  remove,
  addLabel,
}: ArrayEditorProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,249,252,0.96))] p-4 shadow-[0_12px_30px_rgba(7,21,40,0.05)]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-[0.24em] text-[color:var(--navy-soft)]">
            {title}
          </h3>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="rounded-full border border-[color:var(--gold)] bg-[rgba(21,184,176,0.08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--gold-soft)]"
        >
          {addLabel}
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {fields.map((field, index) => {
            const errorMessage = (
              errors[name] as
                | {
                    value?: {
                      message?: string;
                    };
                  }[]
                | undefined
            )?.[index]?.value?.message;

            return (
              <motion.div
                key={field.id}
                layout={!prefersReducedMotion}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.985 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(245,249,252,0.86),rgba(255,255,255,0.92))] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--navy-soft)]">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--danger)] transition hover:bg-[rgba(224,91,73,0.08)]"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <textarea
                  rows={2}
                  {...register(`${name}.${index}.value`)}
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/92 px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--gold)] focus:ring-4 focus:ring-[rgba(21,184,176,0.16)]"
                  placeholder="Enter text..."
                />
                {errorMessage ? (
                  <p className="mt-2 text-xs font-semibold text-[color:var(--danger)]">{errorMessage}</p>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
