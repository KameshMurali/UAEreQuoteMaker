import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FormProvider, useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { ArrayEditor } from "./components/ArrayEditor";
import { QuotationPreview } from "./components/QuotationPreview";
import { SectionCard } from "./components/SectionCard";
import { buildSampleQuotation } from "./data/sampleQuotation";
import { mapQuotationToDocument } from "./mappers/quotationMapper";
import { quotationSchema } from "./schemas/quotationSchema";
import { createDefaultValues, getTemplateById, templateIdList, templateConfigs } from "./templates/quotationTemplates";
import type { QuotationFormValues, TemplateId } from "./types/quotation";
import { calculateAnnualValue, calculatePercentageAmount } from "./utils/calculations";
import {
  amountToWords,
  buildDownloadFileName,
  buildQuotationNameSuggestion,
  buildQuotationRefSuggestion,
  buildSubjectSuggestion,
  formatCurrency,
} from "./utils/formatters";
import { clearDraft, loadDraft, saveDraft } from "./utils/storage";

const paymentScheduleOptions = [
  "One Payment",
  "Two Equal Payments",
  "Four Equal Payments",
  "Six Equal Payments",
  "Twelve Monthly Payments",
] as const;

const inputClassName =
  "w-full rounded-2xl border border-[color:var(--line)] bg-white/92 px-4 py-3 text-sm text-[color:var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-[color:var(--ink-soft)]/60 focus:border-[color:var(--gold)] focus:ring-4 focus:ring-[rgba(21,184,176,0.16)]";

const readOnlyClassName =
  "w-full rounded-2xl border border-dashed border-[rgba(86,111,138,0.22)] bg-[linear-gradient(180deg,rgba(245,249,252,0.92),rgba(255,255,255,0.82))] px-4 py-3 text-sm font-semibold text-[color:var(--ink-soft)]";

const standardEase = [0.22, 1, 0.36, 1] as const;

type StatusTone = "neutral" | "success" | "error";

interface StatusMessage {
  tone: StatusTone;
  message: string;
}

const formatSavedTime = (value: string | null) => {
  if (!value) {
    return "No local draft saved yet";
  }

  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const App = () => {
  const previewRef = useRef<HTMLElement | null>(null);
  const lastTemplateIdRef = useRef<TemplateId>("sharjah-excluding-utilities");
  const autoSuggestionsRef = useRef({
    quotationName: "",
    quotationRef: "",
    subject: "",
    recipientCompanyName: "",
    paymentBeneficiary: "",
    rentPaymentSchedule: "",
    annualValue: 0,
    amountInWords: "",
    securityDepositValue: 0,
    agencyFeeValue: 0,
    vatValue: 0,
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema) as Resolver<QuotationFormValues>,
    defaultValues: createDefaultValues(),
    mode: "onBlur",
  });

  const {
    control,
    formState: { errors, isDirty },
    getValues,
    register,
    reset,
    setValue,
    trigger,
  } = form;

  const {
    fields: termFields,
    append: appendTerm,
    remove: removeTerm,
    replace: replaceTerms,
  } = useFieldArray({
    control,
    name: "terms",
  });

  const {
    fields: includedServiceFields,
    append: appendIncludedService,
    remove: removeIncludedService,
    replace: replaceIncludedServices,
  } = useFieldArray({
    control,
    name: "includedServices",
  });

  const {
    fields: excludedServiceFields,
    append: appendExcludedService,
    remove: removeExcludedService,
    replace: replaceExcludedServices,
  } = useFieldArray({
    control,
    name: "excludedServices",
  });

  const watchedValues = useWatch({ control }) as QuotationFormValues;
  const deferredValues = useDeferredValue(watchedValues);
  const currentTemplate = useMemo(
    () => getTemplateById((watchedValues?.templateId ?? "sharjah-excluding-utilities") as TemplateId),
    [watchedValues?.templateId],
  );

  const previewData = useMemo(
    () => mapQuotationToDocument(deferredValues ?? getValues()),
    [deferredValues, getValues],
  );

  useEffect(() => {
    const existingDraft = loadDraft();

    if (!existingDraft) {
      return;
    }

    lastTemplateIdRef.current = existingDraft.data.templateId;
    startTransition(() => reset(existingDraft.data));
    setLastSavedAt(existingDraft.savedAt);
    setStatus({
      tone: "success",
      message: "A previously saved local draft has been restored.",
    });
  }, [reset]);

  useEffect(() => {
    const selectedTemplateId = watchedValues.templateId;

    if (!selectedTemplateId || selectedTemplateId === lastTemplateIdRef.current) {
      return;
    }

    lastTemplateIdRef.current = selectedTemplateId;
    const template = getTemplateById(selectedTemplateId);

    setValue("location", template.location, { shouldDirty: true, shouldValidate: false });
    setValue("premisesLocation", template.location, { shouldDirty: true, shouldValidate: false });
    setValue("utilitiesMode", template.utilitiesMode, { shouldDirty: true, shouldValidate: false });
    setValue("specialOfferLabel", template.specialOfferLabel, { shouldDirty: true, shouldValidate: false });
    setValue("specialOfferValue", template.specialOfferValue, { shouldDirty: true, shouldValidate: false });
    setValue("registrationLabel", template.registrationLabel, { shouldDirty: true, shouldValidate: false });
    setValue("registrationValue", template.registrationValue, { shouldDirty: true, shouldValidate: false });
    setValue("servicesSectionTitle", template.servicesSectionTitle, { shouldDirty: true, shouldValidate: false });
    setValue("servicesIntro", template.servicesIntro ?? "", { shouldDirty: true, shouldValidate: false });
    setValue("servicesNote", template.servicesNote ?? "", { shouldDirty: true, shouldValidate: false });
    replaceIncludedServices(
      template.utilitiesVariant === "included"
        ? template.servicesItems.map((value) => ({ value }))
        : [],
    );
    replaceExcludedServices(
      template.utilitiesVariant === "excluded"
        ? template.servicesItems.map((value) => ({ value }))
        : [],
    );
    replaceTerms(template.terms.map((value) => ({ value })));
  }, [replaceExcludedServices, replaceIncludedServices, replaceTerms, setValue, watchedValues.templateId]);

  useEffect(() => {
    const suggestion = buildQuotationNameSuggestion(
      watchedValues.issuingCompanyName,
      watchedValues.clientCompanyName,
    );
    const currentValue = getValues("quotationName");

    if (!currentValue || currentValue === autoSuggestionsRef.current.quotationName) {
      setValue("quotationName", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.quotationName = suggestion;
  }, [getValues, setValue, watchedValues.clientCompanyName, watchedValues.issuingCompanyName]);

  useEffect(() => {
    const suggestion = buildQuotationRefSuggestion(
      currentTemplate,
      watchedValues.clientCompanyName,
      watchedValues.date,
    );
    const currentValue = getValues("quotationRef");

    if (!currentValue || currentValue === autoSuggestionsRef.current.quotationRef) {
      setValue("quotationRef", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.quotationRef = suggestion;
  }, [currentTemplate, getValues, setValue, watchedValues.clientCompanyName, watchedValues.date]);

  useEffect(() => {
    const suggestion = buildSubjectSuggestion(
      currentTemplate,
      watchedValues.roomCount,
      watchedValues.unitType,
    );
    const currentValue = getValues("subject");

    if (!currentValue || currentValue === autoSuggestionsRef.current.subject) {
      setValue("subject", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.subject = suggestion;
  }, [currentTemplate, getValues, setValue, watchedValues.roomCount, watchedValues.unitType]);

  useEffect(() => {
    const suggestion = watchedValues.clientCompanyName.trim();
    const currentValue = getValues("recipientCompanyName");

    if (!currentValue || currentValue === autoSuggestionsRef.current.recipientCompanyName) {
      setValue("recipientCompanyName", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.recipientCompanyName = suggestion;
  }, [getValues, setValue, watchedValues.clientCompanyName]);

  useEffect(() => {
    const suggestion = watchedValues.issuingCompanyName.trim();
    const currentValue = getValues("paymentBeneficiary");

    if (!currentValue || currentValue === autoSuggestionsRef.current.paymentBeneficiary) {
      setValue("paymentBeneficiary", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.paymentBeneficiary = suggestion;
  }, [getValues, setValue, watchedValues.issuingCompanyName]);

  useEffect(() => {
    const suggestion = watchedValues.paymentSchedule;
    const currentValue = getValues("rentPaymentSchedule");

    if (!currentValue || currentValue === autoSuggestionsRef.current.rentPaymentSchedule) {
      setValue("rentPaymentSchedule", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.rentPaymentSchedule = suggestion;
  }, [getValues, setValue, watchedValues.paymentSchedule]);

  useEffect(() => {
    const suggestion = calculateAnnualValue(watchedValues.roomCount, watchedValues.unitPricePerMonth);
    const currentValue = getValues("annualValue");

    if (!currentValue || Math.abs(currentValue - autoSuggestionsRef.current.annualValue) < 0.01) {
      setValue("annualValue", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.annualValue = suggestion;
  }, [getValues, setValue, watchedValues.roomCount, watchedValues.unitPricePerMonth]);

  useEffect(() => {
    const suggestion = amountToWords(watchedValues.annualValue);
    const currentValue = getValues("amountInWords");

    if (!currentValue || currentValue === autoSuggestionsRef.current.amountInWords) {
      setValue("amountInWords", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.amountInWords = suggestion;
  }, [getValues, setValue, watchedValues.annualValue]);

  useEffect(() => {
    const suggestion = calculatePercentageAmount(
      watchedValues.annualValue,
      watchedValues.securityDepositPercent,
    );
    const currentValue = getValues("securityDepositValue");

    if (!currentValue || Math.abs(currentValue - autoSuggestionsRef.current.securityDepositValue) < 0.01) {
      setValue("securityDepositValue", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.securityDepositValue = suggestion;
  }, [getValues, setValue, watchedValues.annualValue, watchedValues.securityDepositPercent]);

  useEffect(() => {
    const suggestion = calculatePercentageAmount(watchedValues.annualValue, watchedValues.agencyFeePercent);
    const currentValue = getValues("agencyFeeValue");

    if (!currentValue || Math.abs(currentValue - autoSuggestionsRef.current.agencyFeeValue) < 0.01) {
      setValue("agencyFeeValue", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.agencyFeeValue = suggestion;
  }, [getValues, setValue, watchedValues.agencyFeePercent, watchedValues.annualValue]);

  useEffect(() => {
    const suggestion = calculatePercentageAmount(watchedValues.agencyFeeValue, watchedValues.vatPercent);
    const currentValue = getValues("vatValue");

    if (!currentValue || Math.abs(currentValue - autoSuggestionsRef.current.vatValue) < 0.01) {
      setValue("vatValue", suggestion, { shouldDirty: false, shouldValidate: false });
    }

    autoSuggestionsRef.current.vatValue = suggestion;
  }, [getValues, setValue, watchedValues.agencyFeeValue, watchedValues.vatPercent]);

  const handleSaveDraft = () => {
    const savedAt = saveDraft(getValues());
    setLastSavedAt(savedAt);
    setStatus({
      tone: "success",
      message: "Draft saved locally. You can return later and continue from the same data.",
    });
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();

    if (!draft) {
      setStatus({
        tone: "error",
        message: "No saved draft was found on this browser.",
      });
      return;
    }

    lastTemplateIdRef.current = draft.data.templateId;
    startTransition(() => reset(draft.data));
    setLastSavedAt(draft.savedAt);
    setStatus({
      tone: "success",
      message: "Saved draft loaded back into the builder.",
    });
  };

  const handleReset = () => {
    const nextValues = createDefaultValues(getValues("templateId"));
    lastTemplateIdRef.current = nextValues.templateId;
    startTransition(() => reset(nextValues));
    setStatus({
      tone: "neutral",
      message: "The form has been reset to the selected template defaults.",
    });
  };

  const handleLoadSample = () => {
    const sample = buildSampleQuotation();
    lastTemplateIdRef.current = sample.templateId;
    startTransition(() => reset(sample));
    setStatus({
      tone: "success",
      message: "Sample quotation data loaded. You can edit any field before exporting.",
    });
  };

  const handleClearDraft = () => {
    clearDraft();
    setLastSavedAt(null);
    setStatus({
      tone: "neutral",
      message: "Local draft storage was cleared for this browser.",
    });
  };

  const handlePreviewScroll = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGenerate = async (format: "docx" | "pdf") => {
    const isValid = await trigger(undefined, { shouldFocus: true });

    if (!isValid) {
      setStatus({
        tone: "error",
        message: "Please complete the required fields before generating the quotation document.",
      });
      return;
    }

    const values = getValues();
    const fileName = buildDownloadFileName(values.quotationName, values.quotationRef, format);
    const documentData = mapQuotationToDocument(values);

    try {
      if (format === "docx") {
        setIsGeneratingWord(true);
        const { generateDocx } = await import("./generators/docxGenerator");
        await generateDocx(documentData, fileName);
        setStatus({
          tone: "success",
          message: `Word quotation generated as ${fileName}.`,
        });
      } else {
        setIsGeneratingPdf(true);
        const { generatePdf } = await import("./generators/pdfGenerator");
        await generatePdf(documentData, fileName);
        setStatus({
          tone: "success",
          message: `PDF quotation generated as ${fileName}.`,
        });
      }
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Document generation failed. Please try again after reviewing the form values.",
      });
    } finally {
      setIsGeneratingWord(false);
      setIsGeneratingPdf(false);
    }
  };

  const activeServices =
    currentTemplate.utilitiesVariant === "included" ? includedServiceFields : excludedServiceFields;

  return (
    <FormProvider {...form}>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <motion.header
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: standardEase }}
            className="paper-grid relative overflow-hidden rounded-[34px] border border-[rgba(7,21,40,0.08)] bg-[linear-gradient(140deg,rgba(251,253,255,0.96),rgba(236,247,252,0.94),rgba(217,239,245,0.94),rgba(204,237,235,0.88))] px-6 py-8 text-[color:var(--navy)] shadow-[0_28px_80px_rgba(7,21,40,0.12)] sm:px-10 sm:py-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(21,184,176,0.34),transparent_24%),radial-gradient(circle_at_82%_6%,rgba(255,255,255,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.9fr]">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: standardEase }}
                className="space-y-5"
              >
                <div className="inline-flex items-center rounded-full border border-[rgba(7,21,40,0.08)] bg-[rgba(255,255,255,0.34)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.28em] text-[color:var(--navy)] backdrop-blur">
                  Interactive Quotation Builder
                </div>
                <div className="space-y-4">
                  <h1 className="section-title max-w-4xl text-4xl font-semibold leading-tight text-[rgba(7,21,40,0.97)] sm:text-5xl">
                    Build labour accommodation quotations from structured inputs, then export them as polished Word and PDF documents.
                  </h1>
                  <p className="max-w-3xl text-base leading-8 text-[rgba(7,21,40,0.76)]">
                    This builder follows the Miller quotation layouts for Sharjah and UAQ, keeps the wording template-driven, and lets the team generate consistent documents without touching the raw contract body.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[rgba(7,21,40,0.8)]">
                  <Badge>{currentTemplate.label}</Badge>
                  <Badge>{currentTemplate.utilitiesMode} Utilities</Badge>
                  <Badge>{previewData.quotationReference}</Badge>
                </div>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16, ease: standardEase }}
                className="rounded-[28px] border border-[rgba(7,21,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.28))] p-5 backdrop-blur"
              >
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[color:var(--navy)]">
                  Workflow
                </p>
                <ol className="mt-4 space-y-4 text-sm leading-7 text-[rgba(7,21,40,0.78)]">
                  <li>1. Select one of the four quotation variants.</li>
                  <li>2. Fill the grouped business details and contract values.</li>
                  <li>3. Review the live preview for structure and wording.</li>
                  <li>4. Export the quotation as a `.docx` or `.pdf` with dynamic naming.</li>
                </ol>
              </motion.div>
            </div>
          </motion.header>

          {status ? (
            <div
              className={`mt-6 rounded-[24px] border px-5 py-4 text-sm shadow-[0_14px_36px_rgba(7,21,40,0.06)] ${
                status.tone === "success"
                  ? "border-[rgba(37,119,82,0.24)] bg-[rgba(37,119,82,0.08)] text-[color:var(--success)]"
                  : status.tone === "error"
                    ? "border-[rgba(224,91,73,0.22)] bg-[rgba(224,91,73,0.08)] text-[color:var(--danger)]"
                    : "border-[rgba(13,43,85,0.12)] bg-white/70 text-[color:var(--ink-soft)]"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
            <div className="space-y-6">
              <SectionCard
                eyebrow="Identity"
                title="Quotation Builder"
                description="All key quotation values are collected through structured inputs, then injected into the selected template automatically."
                actions={
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="rounded-full border border-[color:var(--gold)] bg-[rgba(21,184,176,0.08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--gold-soft)]"
                  >
                    Load Sample Data
                  </button>
                }
              >
                <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Quotation Template / Type"
                      error={errors.templateId?.message}
                      hint="Switching the template updates utilities wording, services, registration labels, and default terms."
                    >
                      <select {...register("templateId")} className={inputClassName}>
                        {templateIdList.map((templateId) => (
                          <option key={templateId} value={templateId}>
                            {templateConfigs[templateId].label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Quotation Name"
                      error={errors.quotationName?.message}
                      hint="Auto-suggested from issuing and client company names, but fully editable."
                    >
                      <input
                        {...register("quotationName")}
                        className={inputClassName}
                        placeholder="Quotation name"
                      />
                    </Field>

                    <Field label="Issuing Company Name" error={errors.issuingCompanyName?.message}>
                      <input
                        {...register("issuingCompanyName")}
                        className={inputClassName}
                        placeholder="Issuing company"
                      />
                    </Field>

                    <Field label="Client Company Name" error={errors.clientCompanyName?.message}>
                      <input
                        {...register("clientCompanyName")}
                        className={inputClassName}
                        placeholder="Client company"
                      />
                    </Field>

                    <Field label="Quotation Reference" error={errors.quotationRef?.message}>
                      <input
                        {...register("quotationRef")}
                        className={inputClassName}
                        placeholder="Q/SHJ-EXC-CLNT-2026"
                      />
                    </Field>

                    <Field label="Date" error={errors.date?.message}>
                      <input {...register("date")} className={inputClassName} type="date" />
                    </Field>
                  </div>
                </form>
              </SectionCard>

              <SectionCard
                eyebrow="Recipient"
                title="Recipient Details"
                description="Keep the recipient block structured and consistent with the original quotations."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Recipient Title" error={errors.recipientTitle?.message}>
                    <input
                      {...register("recipientTitle")}
                      className={inputClassName}
                      placeholder="The Manager"
                    />
                  </Field>

                  <Field
                    label="Recipient Company Name"
                    error={errors.recipientCompanyName?.message}
                    hint="Defaults to the client company name unless you need a different recipient entity."
                  >
                    <input
                      {...register("recipientCompanyName")}
                      className={inputClassName}
                      placeholder="Recipient company"
                    />
                  </Field>

                  <Field label="Subject" error={errors.subject?.message}>
                    <input {...register("subject")} className={inputClassName} placeholder="Subject line" />
                  </Field>

                  <Field label="Salutation" error={errors.salutation?.message}>
                    <input
                      {...register("salutation")}
                      className={inputClassName}
                      placeholder="Dear Sir / Madam,"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Offer"
                title="Offer Details"
                description="These values drive the main description of offer table and the contract calculations."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Number of Rooms / Units" error={errors.roomCount?.message}>
                    <input {...register("roomCount", { valueAsNumber: true })} className={inputClassName} type="number" min="1" />
                  </Field>

                  <Field label="Unit Type" error={errors.unitType?.message}>
                    <input {...register("unitType")} className={inputClassName} placeholder="Studio Rooms" />
                  </Field>

                  <Field label="Location" error={errors.location?.message}>
                    <input {...register("location")} className={inputClassName} placeholder="Location" />
                  </Field>

                  <Field label="Premises Location" error={errors.premisesLocation?.message}>
                    <input
                      {...register("premisesLocation")}
                      className={inputClassName}
                      placeholder="Premises location"
                    />
                  </Field>

                  <Field label="Lease Duration" error={errors.leaseDuration?.message}>
                    <input
                      {...register("leaseDuration")}
                      className={inputClassName}
                      placeholder="1 Year (Renewable)"
                    />
                  </Field>

                  <Field label="Unit Price per Room / Month" error={errors.unitPricePerMonth?.message}>
                    <input
                      {...register("unitPricePerMonth", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field
                    label="Total Annual Contract Value"
                    error={errors.annualValue?.message}
                    hint="Auto-calculated from room count × monthly unit price × 12, but editable if needed."
                  >
                    <input
                      {...register("annualValue", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="Amount in Words" error={errors.amountInWords?.message}>
                    <input
                      {...register("amountInWords")}
                      className={inputClassName}
                      placeholder="Amount in words"
                    />
                  </Field>

                  <Field label="Payment Schedule" error={errors.paymentSchedule?.message}>
                    <select {...register("paymentSchedule")} className={inputClassName}>
                      {paymentScheduleOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Security Deposit %" error={errors.securityDepositPercent?.message}>
                    <input
                      {...register("securityDepositPercent", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field
                    label="Security Deposit Amount"
                    error={errors.securityDepositValue?.message}
                    hint="Auto-derived from the annual contract value and deposit percentage."
                  >
                    <input
                      {...register("securityDepositValue", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="Utilities Mode">
                    <input value={watchedValues.utilitiesMode} readOnly className={readOnlyClassName} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Utilities"
                title="Utilities / Services"
                description="The wording and list structure change automatically with the selected quotation template, but you can still refine the details."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Template-Specific Offer Label">
                    <input value={watchedValues.specialOfferLabel} readOnly className={readOnlyClassName} />
                  </Field>

                  <Field label="Template-Specific Offer Detail" error={errors.specialOfferValue?.message}>
                    <input
                      {...register("specialOfferValue")}
                      className={inputClassName}
                      placeholder="Template-specific detail"
                    />
                  </Field>

                  <Field label="Registration Label">
                    <input value={watchedValues.registrationLabel} readOnly className={readOnlyClassName} />
                  </Field>

                  <Field label="Registration Detail" error={errors.registrationValue?.message}>
                    <input
                      {...register("registrationValue")}
                      className={inputClassName}
                      placeholder="Registration detail"
                    />
                  </Field>

                  <Field label="Services Section Title">
                    <input value={watchedValues.servicesSectionTitle} readOnly className={readOnlyClassName} />
                  </Field>

                  <Field label="Services Intro">
                    <textarea
                      {...register("servicesIntro")}
                      rows={3}
                      className={inputClassName}
                      placeholder="Introductory service text"
                    />
                  </Field>
                </div>

                <div className="mt-5">
                  <ArrayEditor
                    title={currentTemplate.utilitiesVariant === "included" ? "Included Services" : "Excluded Services"}
                    description="Edit the structured list that will be injected into the utilities/services section."
                    fields={activeServices}
                    name={
                      currentTemplate.utilitiesVariant === "included"
                        ? "includedServices"
                        : "excludedServices"
                    }
                    register={register}
                    errors={errors}
                    append={
                      currentTemplate.utilitiesVariant === "included"
                        ? appendIncludedService
                        : appendExcludedService
                    }
                    remove={
                      currentTemplate.utilitiesVariant === "included"
                        ? removeIncludedService
                        : removeExcludedService
                    }
                    addLabel="Add Item"
                  />
                </div>

                <div className="mt-5">
                  <Field label="Services Note">
                    <textarea
                      {...register("servicesNote")}
                      rows={3}
                      className={inputClassName}
                      placeholder="Optional note shown under the services list"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Financials"
                title="Financial Summary"
                description="These fields populate the payment summary table and can be overridden whenever commercial terms change."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Rent Payment Schedule" error={errors.rentPaymentSchedule?.message}>
                    <input
                      {...register("rentPaymentSchedule")}
                      className={inputClassName}
                      placeholder="Rent payment schedule"
                    />
                  </Field>

                  <Field label="Agency Fee %" error={errors.agencyFeePercent?.message}>
                    <input
                      {...register("agencyFeePercent", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="Agency Fee Amount" error={errors.agencyFeeValue?.message}>
                    <input
                      {...register("agencyFeeValue", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="VAT %" error={errors.vatPercent?.message}>
                    <input
                      {...register("vatPercent", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="VAT Amount" error={errors.vatValue?.message}>
                    <input
                      {...register("vatValue", { valueAsNumber: true })}
                      className={inputClassName}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </Field>

                  <Field label="Payment Beneficiary" error={errors.paymentBeneficiary?.message}>
                    <input
                      {...register("paymentBeneficiary")}
                      className={inputClassName}
                      placeholder="Beneficiary name"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Terms"
                title="Terms & Conditions"
                description="Default legal wording loads from the selected template. You can make limited adjustments while keeping the numbered structure intact."
              >
                <ArrayEditor
                  title="Terms List"
                  description="Each item becomes one numbered term in the exported quotation."
                  fields={termFields}
                  name="terms"
                  register={register}
                  errors={errors}
                  append={appendTerm}
                  remove={removeTerm}
                  addLabel="Add Term"
                />
              </SectionCard>

              <SectionCard
                eyebrow="Acceptance"
                title="Closing & Acceptance"
                description="Leave fields empty to preserve signature lines, or prefill known names and titles."
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--slate)]/80 p-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.24em] text-[color:var(--navy-soft)]">
                      Authorised Signatory
                    </h3>
                    <Field label="Name">
                      <input
                        {...register("authorisedSignatoryName")}
                        className={inputClassName}
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Title">
                      <input
                        {...register("authorisedSignatoryTitle")}
                        className={inputClassName}
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Date">
                      <input
                        {...register("authorisedSignatoryDate")}
                        className={inputClassName}
                        type="date"
                      />
                    </Field>
                  </div>

                  <div className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--mist)]/80 p-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.24em] text-[color:var(--navy-soft)]">
                      Client Acceptance
                    </h3>
                    <Field label="Name">
                      <input
                        {...register("clientAcceptanceName")}
                        className={inputClassName}
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Title">
                      <input
                        {...register("clientAcceptanceTitle")}
                        className={inputClassName}
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Date">
                      <input
                        {...register("clientAcceptanceDate")}
                        className={inputClassName}
                        type="date"
                      />
                    </Field>
                  </div>
                </div>
              </SectionCard>
            </div>

            <motion.aside
              initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: standardEase }}
              className="space-y-6 xl:sticky xl:top-6 xl:self-start"
            >
              <div className="overflow-hidden rounded-[30px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,251,253,0.96))] shadow-[0_24px_70px_rgba(7,21,40,0.08)]">
                <div className="border-b border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(15,94,140,0.08),rgba(21,184,176,0.12),rgba(255,255,255,0.3))] px-5 py-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[color:var(--navy-soft)]">
                    Builder Controls
                  </p>
                  <h2 className="section-title mt-3 text-2xl font-semibold text-[color:var(--ink)]">
                    Generate, preview, and save drafts
                  </h2>
                </div>

                <div className="space-y-5 px-5 py-5">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <ActionButton
                      kind="primary"
                      onClick={() => void handleGenerate("docx")}
                      disabled={isGeneratingWord}
                    >
                      {isGeneratingWord ? "Generating Word..." : "Generate Word"}
                    </ActionButton>
                    <ActionButton
                      kind="primary"
                      onClick={() => void handleGenerate("pdf")}
                      disabled={isGeneratingPdf}
                    >
                      {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
                    </ActionButton>
                    <ActionButton kind="secondary" onClick={handlePreviewScroll}>
                      Preview Quotation
                    </ActionButton>
                    <ActionButton kind="secondary" onClick={handleSaveDraft}>
                      Save Draft
                    </ActionButton>
                    <ActionButton kind="ghost" onClick={handleLoadDraft}>
                      Load Draft
                    </ActionButton>
                    <ActionButton kind="ghost" onClick={handleReset}>
                      Reset Form
                    </ActionButton>
                  </div>

                  <div className="rounded-[24px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(246,249,252,0.94))] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--navy-soft)]">
                          Local Draft
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{formatSavedTime(lastSavedAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearDraft}
                        className="rounded-full border border-[color:var(--line)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--ink-soft)] transition hover:bg-[color:var(--slate)]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <MetricCard label="Annual Value" value={`AED ${formatCurrency(watchedValues.annualValue || 0)}`} />
                    <MetricCard
                      label="Security Deposit"
                      value={`AED ${formatCurrency(watchedValues.securityDepositValue || 0)}`}
                    />
                    <MetricCard label="Agency Fee" value={`AED ${formatCurrency(watchedValues.agencyFeeValue || 0)}`} />
                    <MetricCard label="VAT" value={`AED ${formatCurrency(watchedValues.vatValue || 0)}`} />
                  </div>

                  <div className="rounded-[24px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(15,94,140,0.06),rgba(238,248,255,0.86))] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--navy-soft)]">
                      Quick Snapshot
                    </p>
                    <dl className="mt-4 space-y-3 text-sm text-[color:var(--ink)]">
                      <SnapshotItem label="Template" value={currentTemplate.label} />
                      <SnapshotItem label="Quotation Ref" value={watchedValues.quotationRef || "Pending"} />
                      <SnapshotItem label="Client" value={watchedValues.clientCompanyName || "Pending"} />
                      <SnapshotItem label="Rooms" value={`${watchedValues.roomCount || 0}`} />
                      <SnapshotItem label="Payment" value={watchedValues.paymentSchedule || "Pending"} />
                      <SnapshotItem label="Dirty State" value={isDirty ? "Unsaved changes" : "No pending edits"} />
                    </dl>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>

          <motion.section
            ref={previewRef}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.6, ease: standardEase }}
            className="mt-8"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[color:var(--navy-soft)]">
                  Preview
                </p>
                <h2 className="section-title mt-2 text-3xl font-semibold text-[color:var(--ink)]">
                  Live quotation preview
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
                This preview stays secondary to the builder flow, but it mirrors the same mapped data used by both document exports.
              </p>
            </div>
            <QuotationPreview data={previewData} />
          </motion.section>

          <motion.footer
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.45, ease: standardEase }}
            className="pb-2 pt-8 text-center"
          >
            <p className="text-sm font-semibold tracking-[0.08em] text-[rgba(7,21,40,0.62)]">
              &copy; Built by Kamzy
            </p>
          </motion.footer>
        </div>
      </div>
    </FormProvider>
  );
};

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const Field = ({ label, error, hint, children }: FieldProps) => (
  <label className="block">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--navy-soft)]">
        {label}
      </span>
      {error ? <span className="text-[11px] font-semibold text-[color:var(--danger)]">{error}</span> : null}
    </div>
    {children}
    {hint ? <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">{hint}</p> : null}
  </label>
);

const Badge = ({ children }: { children: ReactNode }) => (
  <span className="rounded-full border border-[rgba(7,21,40,0.08)] bg-[rgba(255,255,255,0.3)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgba(7,21,40,0.82)] backdrop-blur">
    {children}
  </span>
);

interface ActionButtonProps {
  children: ReactNode;
  kind: "primary" | "secondary" | "ghost";
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton = ({ children, disabled, kind, onClick }: ActionButtonProps) => {
  const className =
    kind === "primary"
      ? "rounded-2xl bg-[linear-gradient(135deg,var(--navy),var(--navy-soft))] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_rgba(7,21,40,0.18)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-60"
      : kind === "secondary"
        ? "rounded-2xl border border-[color:var(--gold)] bg-[rgba(21,184,176,0.08)] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--gold-soft)] disabled:translate-y-0 disabled:opacity-60"
        : "rounded-2xl border border-[color:var(--line)] bg-white/84 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5 hover:bg-[color:var(--slate)] disabled:translate-y-0 disabled:opacity-60";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[24px] border border-[color:var(--line)] bg-white/80 p-4">
    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--navy-soft)]">
      {label}
    </p>
    <p className="mt-3 text-lg font-semibold text-[color:var(--ink)]">{value}</p>
  </div>
);

const SnapshotItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-[rgba(13,43,85,0.08)] pb-3 last:border-b-0 last:pb-0">
    <dt className="font-semibold text-[color:var(--ink-soft)]">{label}</dt>
    <dd className="max-w-[58%] text-right font-semibold text-[color:var(--ink)]">{value}</dd>
  </div>
);

export default App;
