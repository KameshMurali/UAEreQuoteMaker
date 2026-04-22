import type { QuotationFormValues, TemplateConfig } from "../types/quotation";

const smallNumbers = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const tensNumbers = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

const numberGroupNames = ["", "thousand", "million", "billion"];

const convertHundreds = (value: number): string => {
  if (value < 20) {
    return smallNumbers[value];
  }

  if (value < 100) {
    const tens = Math.floor(value / 10);
    const remainder = value % 10;
    return remainder === 0 ? tensNumbers[tens] : `${tensNumbers[tens]}-${smallNumbers[remainder]}`;
  }

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  return remainder === 0
    ? `${smallNumbers[hundreds]} hundred`
    : `${smallNumbers[hundreds]} hundred ${convertHundreds(remainder)}`;
};

const numberToWords = (value: number): string => {
  if (value === 0) {
    return "zero";
  }

  let remaining = value;
  let groupIndex = 0;
  const parts: string[] = [];

  while (remaining > 0) {
    const groupValue = remaining % 1000;

    if (groupValue > 0) {
      const groupWords = convertHundreds(groupValue);
      const groupName = numberGroupNames[groupIndex];
      parts.unshift(groupName ? `${groupWords} ${groupName}` : groupWords);
    }

    remaining = Math.floor(remaining / 1000);
    groupIndex += 1;
  }

  return parts.join(" ").trim();
};

const toTitleCase = (value: string) =>
  value.replace(/\b\w/g, (character) => character.toUpperCase());

export const amountToWords = (amount: number) => {
  const safeAmount = Math.max(0, amount);
  const dirhams = Math.floor(safeAmount);
  const fils = Math.round((safeAmount - dirhams) * 100);
  const dirhamWords = toTitleCase(numberToWords(dirhams));

  if (fils === 0) {
    return `${dirhamWords} Dirhams Only`;
  }

  const filsWords = toTitleCase(numberToWords(fils));
  return `${dirhamWords} Dirhams and ${filsWords} Fils Only`;
};

export const formatCurrency = (amount: number) => {
  const roundedAmount = Number.isFinite(amount) ? amount : 0;
  const hasDecimals = Math.abs(roundedAmount % 1) > 0;

  return new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(roundedAmount);
};

export const formatDateForDocument = (dateValue: string) => {
  if (!dateValue) {
    return "________________";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
};

export const formatDateInputFallback = () => new Date().toISOString().slice(0, 10);

export const sanitizeFileSegment = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");

export const buildDownloadFileName = (
  quotationName: string,
  quotationRef: string,
  extension: "docx" | "pdf",
) => {
  const nameSegment = sanitizeFileSegment(quotationName) || "quotation";
  const refSegment = sanitizeFileSegment(quotationRef) || "reference";
  return `${nameSegment}_${refSegment}.${extension}`;
};

export const formatSignatureValue = (value: string) =>
  value.trim() ? value.trim() : "________________________";

export const buildQuotationNameSuggestion = (
  issuingCompanyName: string,
  clientCompanyName: string,
) => {
  const issuer = issuingCompanyName.trim() || "Issuing Company";
  const client = clientCompanyName.trim() || "Client Company";
  return `${issuer} Quotation for ${client}`;
};

export const buildSubjectSuggestion = (
  template: TemplateConfig,
  roomCount: number,
  unitType: string,
) => {
  const count = Number.isFinite(roomCount) && roomCount > 0 ? roomCount : "X";
  const type = unitType.trim() || "Studio Rooms";
  const utilitiesSuffix =
    template.utilitiesVariant === "included" ? "Utilities Included" : "Utilities Excluded";
  const cityLabel = template.id.startsWith("uaq") ? "UAQ" : "Sharjah";
  return `Quotation for Labour Accommodation – ${count} ${type} – ${cityLabel} (${utilitiesSuffix})`;
};

const buildClientCode = (clientCompanyName: string) => {
  const initials = clientCompanyName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return initials || "CLNT";
};

export const buildQuotationRefSuggestion = (
  template: TemplateConfig,
  clientCompanyName: string,
  dateValue: string,
) => {
  const year = dateValue ? new Date(`${dateValue}T00:00:00`).getFullYear() : new Date().getFullYear();
  return `${template.referencePrefix}-${buildClientCode(clientCompanyName)}-${year}`;
};

export const buildDepositSummary = (value: number, percent: number) =>
  `AED ${formatCurrency(value)} (${percent}% of Annual Rent, Refundable)`;

export const buildFinancialLabel = (value: number, percent: number, suffix?: string) => {
  const formattedPercent = Number.isInteger(percent) ? `${percent}` : `${percent}`.replace(/\.0$/, "");
  const base = `AED ${formatCurrency(value)} (${formattedPercent}% of Annual Rent)`;
  return suffix ? `${base} ${suffix}` : base;
};

export const hydrateTextItems = (values: string[]) => values.map((value) => ({ value }));

export const trimTextItems = (items: QuotationFormValues["terms"]) =>
  items.map((item) => item.value.trim()).filter(Boolean);

