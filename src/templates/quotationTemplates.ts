import { amountToWords, buildQuotationNameSuggestion, buildQuotationRefSuggestion, buildSubjectSuggestion, formatDateInputFallback, hydrateTextItems } from "../utils/formatters";
import type { QuotationFormValues, TemplateConfig, TemplateId } from "../types/quotation";
import { calculateAnnualValue, calculatePercentageAmount } from "../utils/calculations";

const createTerms = (municipality: string, regulationLabel: string, penaltyText: string) => [
  "Premises will be delivered in a ready-to-occupy, clean condition on the agreed commencement date.",
  "Contract commencement date shall be mutually agreed in writing prior to key handover.",
  `Both parties shall comply with all applicable UAE laws, health, safety, and municipal regulations of ${municipality}.`,
  "Security Deposit is fully refundable on expiry subject to: no damages beyond fair wear and tear, clearance of all dues, and return of all keys and access cards. Deposit cannot be adjusted against rent.",
  "Both parties must provide a minimum of sixty (60) days' written notice before expiry for renewal or non-renewal. Failure to give notice results in continuation on mutual terms.",
  "Early termination without legal cause requires a penalty equivalent to sixty (60) days' rent, payable by the terminating party. Termination must be in writing.",
  "Any dishonoured or returned cheque must be replaced immediately. Bank charges plus a penalty of AED 1,000 apply. Repeated default constitutes material breach entitling the Lessor to initiate legal proceedings.",
  `Premises shall be used strictly as labour accommodation in compliance with ${regulationLabel}. Overcrowding and illegal subletting are strictly prohibited. All related fines are the Tenant's responsibility.`,
  "No structural alterations or modifications may be made without prior written approval from the Lessor.",
  "On termination, the Tenant shall return premises clean, in good condition, with all keys/access cards surrendered and all dues settled.",
  penaltyText,
  "This quotation is valid for 15 days from the date of issuance. Miller Properties & Development L.L.C reserves the right to revise pricing after this period.",
];

export const templateConfigs: Record<TemplateId, TemplateConfig> = {
  "sharjah-excluding-utilities": {
    id: "sharjah-excluding-utilities",
    label: "Sharjah – Excluding Utilities",
    referencePrefix: "Q/SHJ-EXC",
    heroSubtitle: "Labour Accommodation — Industrial Area, Sharjah  |  Excluding Utilities",
    municipalityLabel: "Sharjah",
    location: "Industrial Area, Sharjah",
    utilitiesMode: "Excluded",
    utilitiesVariant: "excluded",
    specialOfferLabel: "Utilities",
    specialOfferValue: "Excluded — Tenant's Account (see section below)",
    registrationLabel: "MOHRE & EJARI",
    registrationValue: "Provided by Lessor",
    servicesSectionTitle: "Utilities & Services — Tenant's Responsibility",
    servicesIntro:
      "The following are NOT included in the quoted rent and shall be arranged and borne solely by the Tenant:",
    servicesItems: [
      "Electricity & Water consumption charges (billed as per meter readings / authority invoices)",
      "Sewage collection and waste disposal charges",
      "Internet / Telecommunications (if required)",
      "DEWA / SEWA / UAQ Utility connection and deposit fees",
      "Housekeeping, cleaning staff, and consumables",
      "Any services not expressly stated in this quotation",
    ],
    servicesNote:
      "Note: Rent quoted above reflects facility and accommodation cost only. Utility consumption will be metered and invoiced separately on a monthly basis.",
    terms: createTerms(
      "Sharjah",
      "Sharjah Municipality regulations",
      "Any fines or penalties imposed by SEWA, Sharjah Civil Defence, or any competent authority due to Tenant's violations or misuse shall be fully borne by the Tenant.",
    ),
  },
  "sharjah-including-utilities": {
    id: "sharjah-including-utilities",
    label: "Sharjah – Including Utilities",
    referencePrefix: "Q/SHJ-INC",
    heroSubtitle: "Labour Accommodation — Industrial Area, Sharjah  |  Inclusive of Utilities",
    municipalityLabel: "Sharjah",
    location: "Industrial Area, Sharjah",
    utilitiesMode: "Included",
    utilitiesVariant: "included",
    specialOfferLabel: "Kitchen Facilities",
    specialOfferValue: "10 Kitchens with 20 Gas Points Each",
    registrationLabel: "MOHRE & EJARI",
    registrationValue: "Provided by Lessor",
    servicesSectionTitle: "Utilities & Services Included in Rent",
    servicesItems: [
      "Electricity, Water, Sewage Collection & Waste Removal",
      "24/7 Security Surveillance, CCTV Monitoring & Access Control",
      "Air Conditioners in All Rooms",
      "Maintenance & Housekeeping of Common Areas",
      "AMC Contracts – Civil Defence, Water Tank Cleaning, Pest Control",
      "MOHRE & EJARI Registration will be provided",
      "Kitchen Facilities with Gas Points",
      "Skip / Waste Collection Service",
    ],
    terms: createTerms(
      "Sharjah",
      "Sharjah Municipality regulations",
      "Any fines or penalties imposed by SEWA, Sharjah Civil Defence, or any competent authority due to Tenant's violations or misuse shall be fully borne by the Tenant.",
    ),
  },
  "uaq-excluding-utilities": {
    id: "uaq-excluding-utilities",
    label: "UAQ – Excluding Utilities",
    referencePrefix: "Q/UAQ-EXC",
    heroSubtitle: "Labour Accommodation — Umm Al Quwain (UAQ)  |  Excluding Utilities",
    municipalityLabel: "Umm Al Quwain",
    location: "Umm Al Quwain (UAQ)",
    utilitiesMode: "Excluded",
    utilitiesVariant: "excluded",
    specialOfferLabel: "Utilities",
    specialOfferValue: "Excluded — Tenant's Account (see section below)",
    registrationLabel: "UAQ Tenancy Registration",
    registrationValue: "Provided by Lessor",
    servicesSectionTitle: "Utilities & Services — Tenant's Responsibility",
    servicesIntro:
      "The following are NOT included in the quoted rent and shall be arranged and borne solely by the Tenant:",
    servicesItems: [
      "Electricity & Water consumption charges (billed as per meter readings / authority invoices)",
      "Sewage collection and waste disposal charges",
      "Internet / Telecommunications (if required)",
      "DEWA / SEWA / UAQ Utility connection and deposit fees",
      "Housekeeping, cleaning staff, and consumables",
      "Any services not expressly stated in this quotation",
    ],
    servicesNote:
      "Note: Rent quoted above reflects facility and accommodation cost only. Utility consumption will be metered and invoiced separately on a monthly basis.",
    terms: createTerms(
      "Umm Al Quwain",
      "UAQ Municipality regulations",
      "In the event of excessive utility consumption due to overcrowding or misuse, any penalties or additional charges from the authority shall be recovered from the Tenant.",
    ),
  },
  "uaq-including-utilities": {
    id: "uaq-including-utilities",
    label: "UAQ – Including Utilities",
    referencePrefix: "Q/UAQ-INC",
    heroSubtitle: "Labour Accommodation — Umm Al Quwain (UAQ)  |  Inclusive of Utilities",
    municipalityLabel: "Umm Al Quwain",
    location: "Umm Al Quwain (UAQ)",
    utilitiesMode: "Included",
    utilitiesVariant: "included",
    specialOfferLabel: "Kitchen Facilities",
    specialOfferValue: "Common Kitchen with Cooking Points",
    registrationLabel: "UAQ Tenancy Registration",
    registrationValue: "Provided by Lessor",
    servicesSectionTitle: "Utilities & Services Included in Rent",
    servicesItems: [
      "Electricity, Water, Sewage & Waste Removal (as per UAE fair-use policy)",
      "24/7 Security Surveillance & Access Control",
      "Air Conditioners in All Rooms",
      "Maintenance & Cleaning of Common Areas",
      "AMC Contracts – Civil Defence, Water Tank Cleaning, Pest Control",
      "MOHRE Registration & EJARI / UAQ Tenancy Contract Registration",
      "Kitchen Facilities with Gas / Cooking Points",
      "Waste Skip Service",
    ],
    terms: createTerms(
      "Umm Al Quwain",
      "UAQ Municipality regulations",
      "In the event of excessive utility consumption due to overcrowding or misuse, any penalties or additional charges from the authority shall be recovered from the Tenant.",
    ),
  },
};

export const templateIdList = Object.keys(templateConfigs) as TemplateId[];

export const getTemplateById = (templateId: TemplateId) => templateConfigs[templateId];

export const createDefaultValues = (templateId: TemplateId = "sharjah-excluding-utilities"): QuotationFormValues => {
  const template = getTemplateById(templateId);
  const date = formatDateInputFallback();
  const issuingCompanyName = "Miller Properties & Development L.L.C";
  const clientCompanyName = "";
  const annualValue = calculateAnnualValue(1, 0);
  const securityDepositValue = calculatePercentageAmount(annualValue, 5);
  const agencyFeeValue = calculatePercentageAmount(annualValue, 5);
  const vatValue = calculatePercentageAmount(agencyFeeValue, 5);

  return {
    templateId,
    quotationName: buildQuotationNameSuggestion(issuingCompanyName, clientCompanyName),
    issuingCompanyName,
    clientCompanyName,
    recipientCompanyName: clientCompanyName,
    quotationRef: buildQuotationRefSuggestion(template, clientCompanyName, date),
    date,
    recipientTitle: "The Manager",
    subject: buildSubjectSuggestion(template, 1, "Studio Rooms"),
    salutation: "Dear Sir / Madam,",
    roomCount: 1,
    unitType: "Studio Rooms",
    location: template.location,
    premisesLocation: template.location,
    leaseDuration: "1 Year (Renewable)",
    unitPricePerMonth: 0,
    annualValue,
    amountInWords: amountToWords(annualValue),
    paymentSchedule: "Four Equal Payments",
    rentPaymentSchedule: "Four Equal Payments",
    securityDepositPercent: 5,
    securityDepositValue,
    agencyFeePercent: 5,
    agencyFeeValue,
    vatPercent: 5,
    vatValue,
    utilitiesMode: template.utilitiesMode,
    specialOfferLabel: template.specialOfferLabel,
    specialOfferValue: template.specialOfferValue,
    registrationLabel: template.registrationLabel,
    registrationValue: template.registrationValue,
    servicesSectionTitle: template.servicesSectionTitle,
    servicesIntro: template.servicesIntro ?? "",
    servicesNote: template.servicesNote ?? "",
    includedServices: hydrateTextItems(template.utilitiesVariant === "included" ? template.servicesItems : []),
    excludedServices: hydrateTextItems(template.utilitiesVariant === "excluded" ? template.servicesItems : []),
    paymentBeneficiary: issuingCompanyName,
    terms: hydrateTextItems(template.terms),
    authorisedSignatoryName: "",
    authorisedSignatoryTitle: "",
    authorisedSignatoryDate: "",
    clientAcceptanceName: "",
    clientAcceptanceTitle: "",
    clientAcceptanceDate: "",
  };
};

