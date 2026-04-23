export type TemplateId =
  | "sharjah-excluding-utilities"
  | "sharjah-including-utilities"
  | "uaq-excluding-utilities"
  | "uaq-including-utilities";

export type UtilitiesVariant = "included" | "excluded";

export interface TextListItem {
  value: string;
}

export interface TemplateConfig {
  id: TemplateId;
  label: string;
  referencePrefix: string;
  heroSubtitle: string;
  municipalityLabel: string;
  location: string;
  utilitiesMode: "Included" | "Excluded";
  utilitiesVariant: UtilitiesVariant;
  specialOfferLabel: string;
  specialOfferValue: string;
  registrationLabel: string;
  registrationValue: string;
  servicesSectionTitle: string;
  servicesIntro?: string;
  servicesItems: string[];
  servicesNote?: string;
  terms: string[];
}

export interface QuotationFormValues {
  templateId: TemplateId;
  quotationName: string;
  issuingCompanyName: string;
  companyLogoDataUrl: string;
  companyLogoFileName: string;
  clientCompanyName: string;
  recipientCompanyName: string;
  quotationRef: string;
  date: string;
  recipientTitle: string;
  subject: string;
  salutation: string;
  roomCount: number;
  unitType: string;
  location: string;
  premisesLocation: string;
  leaseDuration: string;
  unitPricePerMonth: number;
  annualValue: number;
  amountInWords: string;
  paymentSchedule: string;
  rentPaymentSchedule: string;
  securityDepositPercent: number;
  securityDepositValue: number;
  agencyFeePercent: number;
  agencyFeeValue: number;
  vatPercent: number;
  vatValue: number;
  utilitiesMode: string;
  specialOfferLabel: string;
  specialOfferValue: string;
  registrationLabel: string;
  registrationValue: string;
  servicesSectionTitle: string;
  servicesIntro: string;
  servicesNote: string;
  includedServices: TextListItem[];
  excludedServices: TextListItem[];
  paymentBeneficiary: string;
  terms: TextListItem[];
  authorisedSignatoryName: string;
  authorisedSignatoryTitle: string;
  authorisedSignatoryDate: string;
  clientAcceptanceName: string;
  clientAcceptanceTitle: string;
  clientAcceptanceDate: string;
}

export interface LabeledValueRow {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}

export interface ServicesSectionData {
  title: string;
  intro?: string;
  items: string[];
  note?: string;
  variant: UtilitiesVariant;
}

export interface SignatureBlock {
  intro: string;
  name: string;
  title: string;
  date: string;
  stampLabel: string;
}

export interface QuotationDocumentData {
  quotationName: string;
  headerCompanyName: string;
  headerLogoDataUrl?: string;
  headerTitle: string;
  headerSubtitle: string;
  quotationReference: string;
  displayDate: string;
  location: string;
  utilitiesMode: string;
  utilitiesTone: "success" | "danger";
  recipientTitle: string;
  recipientCompanyName: string;
  subject: string;
  salutation: string;
  introduction: string;
  offerRows: LabeledValueRow[];
  servicesSection: ServicesSectionData;
  financialRows: LabeledValueRow[];
  terms: string[];
  closingText: string;
  issuerHeader: string;
  clientHeader: string;
  issuerBlock: SignatureBlock;
  clientBlock: SignatureBlock;
  footerText: string;
}
