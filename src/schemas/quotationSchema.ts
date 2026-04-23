import { z } from "zod";
import { templateIdList } from "../templates/quotationTemplates";

const textListItemSchema = z.object({
  value: z.string().trim().min(1, "This item cannot be empty."),
});

export const quotationSchema = z.object({
  templateId: z.enum(templateIdList, {
    message: "Please select a quotation template.",
  }),
  quotationName: z.string().trim().min(1, "Quotation name is required."),
  issuingCompanyName: z.string().trim().min(1, "Issuing company name is required."),
  companyLogoDataUrl: z.string(),
  companyLogoFileName: z.string(),
  clientCompanyName: z.string().trim().min(1, "Client company name is required."),
  recipientCompanyName: z.string().trim().min(1, "Recipient company name is required."),
  quotationRef: z.string().trim().min(1, "Quotation reference is required."),
  date: z.string().trim().min(1, "Date is required."),
  recipientTitle: z.string().trim().min(1, "Recipient title is required."),
  subject: z.string().trim().min(1, "Subject is required."),
  salutation: z.string().trim().min(1, "Salutation is required."),
  roomCount: z.coerce.number().positive("Room count must be greater than zero."),
  unitType: z.string().trim().min(1, "Unit type is required."),
  location: z.string().trim().min(1, "Location is required."),
  premisesLocation: z.string().trim().min(1, "Premises location is required."),
  leaseDuration: z.string().trim().min(1, "Lease duration is required."),
  unitPricePerMonth: z.coerce.number().positive("Unit price must be greater than zero."),
  annualValue: z.coerce.number().positive("Annual contract value must be valid."),
  amountInWords: z.string().trim().min(1, "Amount in words is required."),
  paymentSchedule: z.string().trim().min(1, "Payment schedule is required."),
  rentPaymentSchedule: z.string().trim().min(1, "Rent payment schedule is required."),
  securityDepositPercent: z.coerce.number().min(0, "Security deposit percentage must be valid."),
  securityDepositValue: z.coerce.number().min(0, "Security deposit amount must be valid."),
  agencyFeePercent: z.coerce.number().min(0, "Agency fee percentage must be valid."),
  agencyFeeValue: z.coerce.number().min(0, "Agency fee amount must be valid."),
  vatPercent: z.coerce.number().min(0, "VAT percentage must be valid."),
  vatValue: z.coerce.number().min(0, "VAT amount must be valid."),
  utilitiesMode: z.string().trim().min(1),
  specialOfferLabel: z.string().trim().min(1),
  specialOfferValue: z.string().trim().min(1, "Template-specific offer detail is required."),
  registrationLabel: z.string().trim().min(1),
  registrationValue: z.string().trim().min(1, "Registration detail is required."),
  servicesSectionTitle: z.string().trim().min(1),
  servicesIntro: z.string(),
  servicesNote: z.string(),
  includedServices: z.array(textListItemSchema),
  excludedServices: z.array(textListItemSchema),
  paymentBeneficiary: z.string().trim().min(1, "Payment beneficiary is required."),
  terms: z.array(textListItemSchema).min(1, "At least one term is required."),
  authorisedSignatoryName: z.string(),
  authorisedSignatoryTitle: z.string(),
  authorisedSignatoryDate: z.string(),
  clientAcceptanceName: z.string(),
  clientAcceptanceTitle: z.string(),
  clientAcceptanceDate: z.string(),
});

export type QuotationSchema = z.infer<typeof quotationSchema>;
