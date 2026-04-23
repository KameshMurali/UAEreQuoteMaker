import { getTemplateById } from "../templates/quotationTemplates";
import type { QuotationDocumentData, QuotationFormValues } from "../types/quotation";
import {
  buildDepositSummary,
  buildFinancialLabel,
  formatCurrency,
  formatDateForDocument,
  formatSignatureValue,
  trimTextItems,
} from "../utils/formatters";

const defaultIntroduction =
  "We are pleased to submit our Quotation and Proposal for the lease of Labour Accommodation at our facility as detailed below. This proposal is prepared in accordance with your requirements and reflects our commitment to providing quality housing solutions.";

export const mapQuotationToDocument = (values: QuotationFormValues): QuotationDocumentData => {
  const template = getTemplateById(values.templateId);
  const activeServices =
    template.utilitiesVariant === "included" ? values.includedServices : values.excludedServices;

  return {
    quotationName: values.quotationName,
    headerCompanyName: values.issuingCompanyName,
    headerLogoDataUrl: values.companyLogoDataUrl.trim() || undefined,
    headerTitle: "QUOTATION & PROPOSAL",
    headerSubtitle: template.heroSubtitle,
    quotationReference: values.quotationRef,
    displayDate: formatDateForDocument(values.date),
    location: values.location,
    utilitiesMode: values.utilitiesMode,
    utilitiesTone: template.utilitiesVariant === "included" ? "success" : "danger",
    recipientTitle: values.recipientTitle,
    recipientCompanyName: values.recipientCompanyName,
    subject: values.subject,
    salutation: values.salutation,
    introduction: defaultIntroduction,
    offerRows: [
      {
        label: "Number of Rooms / Units",
        value: `${values.roomCount} ${values.unitType}`,
      },
      {
        label: "Premises Location",
        value: values.premisesLocation,
      },
      {
        label: "Lease Duration",
        value: values.leaseDuration,
      },
      {
        label: "Unit Price per Room / Month",
        value: `AED ${formatCurrency(values.unitPricePerMonth)} per Room / Month`,
      },
      {
        label: "Total Annual Contract Value",
        value: `AED ${formatCurrency(values.annualValue)} /-`,
      },
      {
        label: "Amount in Words",
        value: values.amountInWords,
      },
      {
        label: "Payment Schedule",
        value: values.paymentSchedule,
      },
      {
        label: "Security Deposit",
        value: buildDepositSummary(values.securityDepositValue, values.securityDepositPercent),
      },
      {
        label: values.specialOfferLabel,
        value: values.specialOfferValue,
      },
      {
        label: values.registrationLabel,
        value: values.registrationValue,
      },
    ],
    servicesSection: {
      title: values.servicesSectionTitle,
      intro: values.servicesIntro.trim() || undefined,
      items: activeServices.map((item) => item.value.trim()).filter(Boolean),
      note: values.servicesNote.trim() || undefined,
      variant: template.utilitiesVariant,
    },
    financialRows: [
      {
        label: "Rent Payment Schedule",
        value: values.rentPaymentSchedule,
      },
      {
        label: "Security Deposit",
        value: `${buildDepositSummary(values.securityDepositValue, values.securityDepositPercent)} — see T&C`,
      },
      {
        label: "Agency Fee",
        value: buildFinancialLabel(values.agencyFeeValue, values.agencyFeePercent),
      },
      {
        label: "VAT on Agency Fee",
        value: `AED ${formatCurrency(values.vatValue)} (${values.vatPercent}% applied on Agency Fee only)`,
      },
      {
        label: "Payment Beneficiary",
        value: values.paymentBeneficiary,
      },
    ],
    terms: trimTextItems(values.terms),
    closingText: `We trust this proposal meets your requirements. Should you wish to proceed, kindly sign and return the Acceptance section below or contact us directly. ${values.issuingCompanyName} looks forward to a successful partnership with ${values.recipientCompanyName}.`,
    issuerHeader: `FOR & ON BEHALF OF ${values.issuingCompanyName.toUpperCase()}`,
    clientHeader: "CLIENT ACCEPTANCE",
    issuerBlock: {
      intro: "Authorised Signatory",
      name: formatSignatureValue(values.authorisedSignatoryName),
      title: formatSignatureValue(values.authorisedSignatoryTitle),
      date: formatSignatureValue(formatDateForDocument(values.authorisedSignatoryDate)),
      stampLabel: "Stamp / Seal:",
    },
    clientBlock: {
      intro: "I / We accept this Quotation & Proposal",
      name: formatSignatureValue(values.clientAcceptanceName),
      title: formatSignatureValue(values.clientAcceptanceTitle),
      date: formatSignatureValue(formatDateForDocument(values.clientAcceptanceDate)),
      stampLabel: "Stamp / Seal:",
    },
    footerText: `${values.issuingCompanyName}  —  Labour Accommodation Division`,
  };
};
