import { motion, useReducedMotion } from "framer-motion";
import type { QuotationDocumentData } from "../types/quotation";

interface QuotationPreviewProps {
  data: QuotationDocumentData;
}

const rowFill = (index: number) => (index % 2 === 0 ? "bg-[color:var(--mist)]" : "bg-white");

export const QuotationPreview = ({ data }: QuotationPreviewProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[30px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(245,249,252,0.96))] p-3 shadow-[0_30px_90px_rgba(7,21,40,0.12)] sm:p-5"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[780px] rounded-[24px] bg-white p-4 shadow-[0_18px_45px_rgba(7,21,40,0.1)] sm:p-8"
      >
        <div className="overflow-hidden rounded-[20px] border border-[color:var(--navy)] bg-[color:var(--navy)] text-white">
          <div className={`px-6 py-5 ${data.headerLogoDataUrl ? "sm:px-7 sm:py-6" : ""}`}>
            <div className={`items-center gap-5 ${data.headerLogoDataUrl ? "sm:flex" : ""}`}>
              {data.headerLogoDataUrl ? (
                <div className="mb-4 flex h-24 w-48 shrink-0 items-center justify-center rounded-2xl bg-white/96 p-4 shadow-[0_10px_24px_rgba(7,21,40,0.18)] sm:mb-0">
                  <img
                    src={data.headerLogoDataUrl}
                    alt={`${data.headerCompanyName} logo`}
                    className="h-full w-full object-contain object-left"
                  />
                </div>
              ) : null}
              <div className={data.headerLogoDataUrl ? "text-left" : "text-center"}>
                <p className="text-lg font-extrabold tracking-[0.08em]">{data.headerCompanyName}</p>
                <p className="mt-2 text-2xl font-extrabold tracking-[0.16em] text-[color:var(--paper)]">
                  {data.headerTitle}
                </p>
                <p className="mt-3 text-sm text-[#c8d8ed]">{data.headerSubtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid overflow-hidden rounded-[18px] border border-[color:var(--line)] text-sm sm:grid-cols-4">
          <div className="bg-[color:var(--navy)] px-4 py-3 font-bold text-white">Quotation Ref.</div>
          <div className="bg-[color:var(--mist)] px-4 py-3 font-semibold text-[color:var(--ink)]">
            {data.quotationReference}
          </div>
          <div className="bg-[color:var(--navy)] px-4 py-3 font-bold text-white">Date</div>
          <div className="bg-[color:var(--mist)] px-4 py-3 font-semibold text-[color:var(--ink)]">
            {data.displayDate}
          </div>
          <div className="bg-[color:var(--navy-soft)] px-4 py-3 font-bold text-white">Location</div>
          <div className="bg-[color:var(--slate)] px-4 py-3 font-semibold text-[color:var(--ink)]">
            {data.location}
          </div>
          <div className="bg-[color:var(--navy-soft)] px-4 py-3 font-bold text-white">Utilities</div>
          <div
            className={`px-4 py-3 font-extrabold ${
              data.utilitiesTone === "success"
                ? "bg-[rgba(37,119,82,0.08)] text-[color:var(--success)]"
                : "bg-[rgba(192,57,43,0.08)] text-[color:var(--danger)]"
            }`}
          >
            {data.utilitiesMode}
          </div>
        </div>

        <SectionBanner title="Addressed To" />
        <DetailTable
          rows={[
            { label: "To", value: data.recipientTitle },
            { label: "Company", value: data.recipientCompanyName },
            { label: "Subject", value: data.subject },
          ]}
        />

        <p className="mt-6 text-[15px] text-[color:var(--ink)]">{data.salutation}</p>
        <p className="mt-4 text-[15px] leading-7 text-[color:var(--ink)]">{data.introduction}</p>

        <SectionBanner title="Description of Offer" />
        <WideTable rows={data.offerRows} />

        <SectionBanner title={data.servicesSection.title} />
        {data.servicesSection.intro ? (
          <p className="mt-4 text-[15px] leading-7 text-[color:var(--ink)]">{data.servicesSection.intro}</p>
        ) : null}
        <ul className="mt-4 space-y-2 pl-5 text-[15px] leading-7 text-[color:var(--ink)]">
          {data.servicesSection.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {data.servicesSection.note ? (
          <p className="mt-4 rounded-2xl border border-[rgba(21,184,176,0.28)] bg-[rgba(21,184,176,0.08)] px-4 py-3 text-[14px] leading-6 text-[color:var(--ink-soft)]">
            {data.servicesSection.note}
          </p>
        ) : null}

        <SectionBanner title="Payment Terms & Financial Summary" />
        <WideTable rows={data.financialRows} />

        <SectionBanner title="Terms & Conditions" />
        <div className="overflow-hidden rounded-[18px] border border-[color:var(--line)]">
          {data.terms.map((term, index) => (
            <div key={term} className={`grid grid-cols-[64px_1fr] ${rowFill(index)}`}>
              <div className="border-r border-[color:var(--line)] px-4 py-3 font-extrabold text-[color:var(--navy)]">
                {index + 1}.
              </div>
              <div className="px-4 py-3 text-[15px] leading-7 text-[color:var(--ink)]">{term}</div>
            </div>
          ))}
        </div>

        <SectionBanner title="Closing & Acceptance" />
        <p className="mt-4 text-[15px] leading-7 text-[color:var(--ink)]">{data.closingText}</p>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[color:var(--line)]">
          <div className="grid sm:grid-cols-2">
            <div className="bg-[color:var(--navy)] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white">
              {data.issuerHeader}
            </div>
            <div className="bg-[color:var(--navy-soft)] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white">
              {data.clientHeader}
            </div>
          </div>
          <div className="grid sm:grid-cols-2">
            <SignaturePanel accent="light" block={data.issuerBlock} />
            <SignaturePanel accent="mist" block={data.clientBlock} />
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--gold)] pt-5 text-center text-sm italic text-[#777]">
          {data.footerText}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SectionBanner = ({ title }: { title: string }) => (
  <div className="mt-7 rounded-r-2xl rounded-l-lg border-l-4 border-[color:var(--gold)] bg-[color:var(--mist)] px-4 py-3">
    <h3 className="section-title text-xl font-semibold text-[color:var(--navy)]">{title}</h3>
  </div>
);

const DetailTable = ({
  rows,
}: {
  rows: {
    label: string;
    value: string;
  }[];
}) => (
  <div className="mt-4 overflow-hidden rounded-[18px] border border-[color:var(--line)]">
    {rows.map((row, index) => (
      <div key={row.label} className={`grid sm:grid-cols-[220px_1fr] ${rowFill(index)}`}>
        <div className="border-r border-[color:var(--line)] bg-[color:var(--navy)] px-4 py-3 font-bold text-white sm:bg-transparent sm:text-[color:var(--navy)]">
          <span className="hidden sm:inline">{row.label}</span>
          <span className="sm:hidden">{row.label}</span>
        </div>
        <div className="px-4 py-3 text-[15px] font-semibold text-[color:var(--ink)]">{row.value}</div>
      </div>
    ))}
  </div>
);

const WideTable = ({ rows }: { rows: { label: string; value: string }[] }) => (
  <div className="mt-4 overflow-hidden rounded-[18px] border border-[color:var(--line)]">
    <div className="grid grid-cols-[1.1fr_1.4fr] bg-[color:var(--navy)] text-sm font-extrabold uppercase tracking-[0.18em] text-white">
      <div className="px-4 py-3">Particulars</div>
      <div className="px-4 py-3">Details</div>
    </div>
    {rows.map((row, index) => (
      <div key={row.label} className={`grid grid-cols-[1.1fr_1.4fr] ${rowFill(index)}`}>
        <div className="border-r border-[color:var(--line)] px-4 py-3 font-bold text-[color:var(--navy)]">
          {row.label}
        </div>
        <div className="px-4 py-3 text-[15px] text-[color:var(--ink)]">{row.value}</div>
      </div>
    ))}
  </div>
);

const SignaturePanel = ({
  block,
  accent,
}: {
  block: QuotationDocumentData["issuerBlock"];
  accent: "light" | "mist";
}) => (
  <div className={accent === "mist" ? "bg-[color:var(--mist)] px-4 py-4" : "bg-[color:var(--slate)] px-4 py-4"}>
    <p className={`text-sm ${accent === "mist" ? "font-extrabold text-[color:var(--navy)]" : "text-[color:var(--ink)]"}`}>
      {block.intro}
    </p>
    <div className="mt-5 space-y-3 text-[15px] text-[color:var(--ink)]">
      <p>Name: {block.name}</p>
      <p>Title: {block.title}</p>
      <p>Date: {block.date}</p>
      <p className="pt-4">{block.stampLabel}</p>
    </div>
  </div>
);
