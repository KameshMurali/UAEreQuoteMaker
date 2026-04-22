import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { QuotationPdfDocument } from "../components/pdf/QuotationPdfDocument";
import type { QuotationDocumentData } from "../types/quotation";

export const generatePdf = async (data: QuotationDocumentData, fileName: string) => {
  const blob = await pdf(<QuotationPdfDocument data={data} />).toBlob();
  saveAs(blob, fileName);
};
