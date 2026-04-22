import { createDefaultValues } from "../templates/quotationTemplates";
import { amountToWords } from "../utils/formatters";
import { calculateAnnualValue, calculatePercentageAmount } from "../utils/calculations";

export const buildSampleQuotation = () => {
  const values = createDefaultValues("uaq-including-utilities");
  const annualValue = calculateAnnualValue(48, 850);
  const agencyFeeValue = calculatePercentageAmount(annualValue, 5);

  return {
    ...values,
    quotationName: "Miller Properties & Development L.L.C Quotation for Atlas Contracting LLC",
    clientCompanyName: "Atlas Contracting LLC",
    recipientCompanyName: "Atlas Contracting LLC",
    quotationRef: "Q/UAQ-INC-ACL-2026",
    date: "2026-04-22",
    roomCount: 48,
    unitType: "Studio Rooms",
    unitPricePerMonth: 850,
    annualValue,
    amountInWords: amountToWords(annualValue),
    paymentSchedule: "Four Equal Payments",
    rentPaymentSchedule: "Four Equal Payments",
    securityDepositValue: calculatePercentageAmount(annualValue, 5),
    agencyFeeValue,
    vatValue: calculatePercentageAmount(agencyFeeValue, 5),
    subject: "Quotation for Labour Accommodation – 48 Studio Rooms – UAQ (Utilities Included)",
    specialOfferValue: "Common Kitchen with Cooking Points",
    authorisedSignatoryName: "Ahmed Raza",
    authorisedSignatoryTitle: "Leasing Manager",
    authorisedSignatoryDate: "2026-04-22",
    clientAcceptanceName: "Sajid Khan",
    clientAcceptanceTitle: "Operations Director",
    clientAcceptanceDate: "",
  };
};

