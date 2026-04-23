import { jsPDF } from "jspdf";
import autoTable, { type UserOptions } from "jspdf-autotable";
import type { QuotationDocumentData } from "../types/quotation";
import { getContainDimensions, getImageDimensions } from "../utils/images";

const colors = {
  navy: "#0D2B55",
  navySoft: "#1B4F8A",
  paper: "#FDF3DC",
  ink: "#1A1A2E",
  mist: "#EBF2FA",
  slate: "#F7F8FA",
  gold: "#B8860B",
  success: "#257752",
  danger: "#C0392B",
  grey: "#888888",
  line: "#D0D5DE",
  noteFill: "#FBF3D8",
  noteBorder: "#E0C97B",
};

type AutoTableDoc = jsPDF & {
  lastAutoTable?: {
    finalY?: number;
  };
};

type RgbColor = [number, number, number];

const page = {
  width: 595.28,
  height: 841.89,
  margin: 36,
};

const sectionPadding = {
  x: 12,
  y: 8,
};

const lineHeight = 15;

const asRgb = (hex: string): RgbColor => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  const numeric = Number.parseInt(value, 16);
  return [(numeric >> 16) & 255, (numeric >> 8) & 255, numeric & 255];
};

const applyTextColor = (doc: jsPDF, hex: string) => {
  const [r, g, b] = asRgb(hex);
  doc.setTextColor(r, g, b);
};

const applyFillColor = (doc: jsPDF, hex: string) => {
  const [r, g, b] = asRgb(hex);
  doc.setFillColor(r, g, b);
};

const applyDrawColor = (doc: jsPDF, hex: string) => {
  const [r, g, b] = asRgb(hex);
  doc.setDrawColor(r, g, b);
};

const getFinalY = (doc: AutoTableDoc, fallback: number) => doc.lastAutoTable?.finalY ?? fallback;

const ensurePageSpace = (doc: jsPDF, y: number, requiredHeight: number) => {
  if (y + requiredHeight <= page.height - page.margin) {
    return y;
  }

  doc.addPage();
  return page.margin;
};

const drawCenteredText = (doc: jsPDF, text: string, y: number, fontSize: number, color: string, fontStyle: "normal" | "bold" = "normal") => {
  doc.setFont("helvetica", fontStyle);
  doc.setFontSize(fontSize);
  applyTextColor(doc, color);
  doc.text(text, page.width / 2, y, {
    align: "center",
  });
};

const drawSectionBanner = (doc: jsPDF, y: number, title: string) => {
  const nextY = ensurePageSpace(doc, y, 30);
  applyFillColor(doc, colors.mist);
  doc.setDrawColor(255, 255, 255);
  doc.roundedRect(page.margin, nextY, page.width - page.margin * 2, 28, 8, 8, "F");

  applyFillColor(doc, colors.gold);
  doc.rect(page.margin, nextY, 4, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  applyTextColor(doc, colors.navy);
  doc.text(title, page.margin + 14, nextY + 18);

  return nextY + 28 + 8;
};

const drawParagraph = (doc: jsPDF, y: number, text: string, options?: { italic?: boolean; fontSize?: number }) => {
  const fontSize = options?.fontSize ?? 11;
  const lines = doc.splitTextToSize(text, page.width - page.margin * 2) as string[];
  const height = lines.length * (fontSize + 3);
  const nextY = ensurePageSpace(doc, y, height);

  doc.setFont("helvetica", options?.italic ? "italic" : "normal");
  doc.setFontSize(fontSize);
  applyTextColor(doc, colors.ink);
  doc.text(lines, page.margin, nextY + fontSize);
  return nextY + height;
};

const drawBulletList = (doc: jsPDF, y: number, items: string[]) => {
  let currentY = y;

  items.forEach((item) => {
    const lines = doc.splitTextToSize(item, page.width - page.margin * 2 - 18) as string[];
    const requiredHeight = Math.max(16, lines.length * 13 + 2);
    currentY = ensurePageSpace(doc, currentY, requiredHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    applyTextColor(doc, colors.ink);
    doc.text("•", page.margin + 4, currentY + 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.8);
    doc.text(lines, page.margin + 16, currentY + 11);
    currentY += requiredHeight;
  });

  return currentY;
};

const drawNote = (doc: jsPDF, y: number, note: string) => {
  const lines = doc.splitTextToSize(note, page.width - page.margin * 2 - 20) as string[];
  const height = lines.length * 12 + 16;
  const nextY = ensurePageSpace(doc, y, height);

  applyFillColor(doc, colors.noteFill);
  applyDrawColor(doc, colors.noteBorder);
  doc.roundedRect(page.margin, nextY, page.width - page.margin * 2, height, 8, 8, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  applyTextColor(doc, colors.ink);
  doc.text(lines, page.margin + 10, nextY + 12);

  return nextY + height + 4;
};

const baseTableOptions: Partial<UserOptions> = {
  margin: {
    left: page.margin,
    right: page.margin,
  },
  styles: {
    font: "helvetica",
    fontSize: 10.5,
    textColor: asRgb(colors.ink),
    lineColor: asRgb(colors.line),
    lineWidth: 0.7,
    cellPadding: {
      top: 7,
      right: 10,
      bottom: 7,
      left: 10,
    },
    overflow: "linebreak",
    valign: "middle",
  },
  tableLineColor: asRgb(colors.line),
  tableLineWidth: 0.7,
};

const drawHero = async (doc: jsPDF, data: QuotationDocumentData) => {
  const hasLogo = Boolean(data.headerLogoDataUrl);
  const heroHeight = hasLogo ? 126 : 82;
  applyFillColor(doc, colors.navy);
  applyDrawColor(doc, colors.navy);
  doc.roundedRect(page.margin, page.margin, page.width - page.margin * 2, heroHeight, 6, 6, "FD");

  let companyNameY = page.margin + 20;

  if (data.headerLogoDataUrl) {
    const sourceSize = await getImageDimensions(data.headerLogoDataUrl);
    const fittedSize = getContainDimensions(sourceSize.width, sourceSize.height, 108, 42);
    const logoX = page.width / 2 - fittedSize.width / 2;
    const logoY = page.margin + 12;

    doc.addImage(data.headerLogoDataUrl, "PNG", logoX, logoY, fittedSize.width, fittedSize.height);
    companyNameY = logoY + fittedSize.height + 18;
  }

  drawCenteredText(doc, data.headerCompanyName, companyNameY, 14, "#FFFFFF", "bold");
  drawCenteredText(doc, data.headerTitle, companyNameY + 22, 18, colors.paper, "bold");
  drawCenteredText(doc, data.headerSubtitle, companyNameY + 42, 11, "#C8D8ED");

  return page.margin + heroHeight + 16;
};

const drawMetaTable = (doc: AutoTableDoc, y: number, data: QuotationDocumentData) => {
  autoTable(doc, {
    ...baseTableOptions,
    startY: y,
    theme: "grid",
    body: [
      ["Quotation Ref.", data.quotationReference, "Date", data.displayDate],
      ["Location", data.location, "Utilities", data.utilitiesMode],
    ],
    columnStyles: {
      0: {
        fillColor: asRgb(colors.navy),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        cellWidth: 131,
      },
      1: {
        fillColor: asRgb(colors.mist),
        fontStyle: "bold",
        cellWidth: 131,
      },
      2: {
        fillColor: asRgb(colors.navySoft),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        cellWidth: 131,
      },
      3: {
        fillColor: asRgb(colors.slate),
        textColor: asRgb(data.utilitiesTone === "success" ? colors.success : colors.danger),
        fontStyle: "bold",
        cellWidth: 131,
      },
    },
  });

  return getFinalY(doc, y) + 12;
};

const drawDetailTable = (
  doc: AutoTableDoc,
  y: number,
  rows: Array<{ label: string; value: string }>,
) => {
  autoTable(doc, {
    ...baseTableOptions,
    startY: y,
    theme: "grid",
    body: rows.map((row) => [row.label, row.value]),
    columnStyles: {
      0: {
        fillColor: asRgb(colors.navy),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        cellWidth: 160,
      },
      1: {
        cellWidth: 363,
      },
    },
    alternateRowStyles: {
      fillColor: asRgb(colors.slate),
    },
  });

  return getFinalY(doc, y) + 10;
};

const drawWideTable = (
  doc: AutoTableDoc,
  y: number,
  rows: Array<{ label: string; value: string }>,
) => {
  autoTable(doc, {
    ...baseTableOptions,
    startY: y,
    theme: "grid",
    head: [["PARTICULARS", "DETAILS"]],
    body: rows.map((row) => [row.label, row.value]),
    headStyles: {
      fillColor: asRgb(colors.navy),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        textColor: asRgb(colors.navy),
        cellWidth: 210,
      },
      1: {
        cellWidth: 313,
      },
    },
    alternateRowStyles: {
      fillColor: asRgb(colors.slate),
    },
  });

  return getFinalY(doc, y) + 10;
};

const drawTermsTable = (doc: AutoTableDoc, y: number, terms: string[]) => {
  autoTable(doc, {
    ...baseTableOptions,
    startY: y,
    theme: "grid",
    body: terms.map((term, index) => [`${index + 1}.`, term]),
    columnStyles: {
      0: {
        fontStyle: "bold",
        textColor: asRgb(colors.navy),
        cellWidth: 36,
        halign: "left",
      },
      1: {
        cellWidth: 487,
      },
    },
    alternateRowStyles: {
      fillColor: asRgb(colors.slate),
    },
    styles: {
      ...baseTableOptions.styles,
      valign: "top",
      fontSize: 10.2,
    },
  });

  return getFinalY(doc, y) + 10;
};

const drawAcceptanceTable = (doc: AutoTableDoc, y: number, data: QuotationDocumentData) => {
  const leftBlock = [
    data.issuerBlock.intro,
    `Name:  ${data.issuerBlock.name}`,
    `Title:    ${data.issuerBlock.title}`,
    `Date:   ${data.issuerBlock.date}`,
    "",
    data.issuerBlock.stampLabel,
  ].join("\n");

  const rightBlock = [
    data.clientBlock.intro,
    `Name:  ${data.clientBlock.name}`,
    `Title:    ${data.clientBlock.title}`,
    `Date:   ${data.clientBlock.date}`,
    "",
    data.clientBlock.stampLabel,
  ].join("\n");

  autoTable(doc, {
    ...baseTableOptions,
    startY: y,
    theme: "grid",
    head: [[data.issuerHeader, data.clientHeader]],
    body: [[leftBlock, rightBlock]],
    headStyles: {
      fontStyle: "bold",
      textColor: [255, 255, 255],
      fontSize: 9.6,
      fillColor: asRgb(colors.navy),
    },
    didParseCell: (hookData) => {
      if (hookData.section === "head" && hookData.column.index === 1) {
        hookData.cell.styles.fillColor = asRgb(colors.navySoft);
      }

      if (hookData.section === "body") {
        hookData.cell.styles.minCellHeight = 128;
        hookData.cell.styles.valign = "top";
        hookData.cell.styles.fontSize = 10.2;

        if (hookData.column.index === 0) {
          hookData.cell.styles.fillColor = asRgb(colors.slate);
        } else {
          hookData.cell.styles.fillColor = asRgb(colors.mist);
        }
      }
    },
    columnStyles: {
      0: {
        cellWidth: 256,
      },
      1: {
        cellWidth: 267,
      },
    },
  });

  return getFinalY(doc, y) + 12;
};

const drawFooter = (doc: jsPDF, data: QuotationDocumentData) => {
  const y = page.height - 20;
  applyDrawColor(doc, colors.gold);
  doc.setLineWidth(0.8);
  doc.line(page.margin, y - 12, page.width - page.margin, y - 12);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.6);
  applyTextColor(doc, colors.grey);
  doc.text(data.footerText, page.width / 2, y, {
    align: "center",
  });
};

export const generatePdf = async (data: QuotationDocumentData, fileName: string) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  }) as AutoTableDoc;

  doc.setProperties({
    title: data.quotationName,
    subject: data.subject,
    author: data.headerCompanyName,
    creator: "UAE reQuote Maker",
  });

  let y = await drawHero(doc, data);
  y = drawMetaTable(doc, y, data);

  y = drawSectionBanner(doc, y, "Addressed To");
  y = drawDetailTable(doc, y, [
    { label: "To", value: data.recipientTitle },
    { label: "Company", value: data.recipientCompanyName },
    { label: "Subject", value: data.subject },
  ]);

  y = drawParagraph(doc, y + 2, data.salutation);
  y = drawParagraph(doc, y + 3, data.introduction);

  y = drawSectionBanner(doc, y + 4, "Description of Offer");
  y = drawWideTable(doc, y, data.offerRows);

  y = drawSectionBanner(doc, y + 4, data.servicesSection.title);
  if (data.servicesSection.intro) {
    y = drawParagraph(doc, y + 2, data.servicesSection.intro, { fontSize: 11 });
  }
  y = drawBulletList(doc, y + 2, data.servicesSection.items);
  if (data.servicesSection.note) {
    y = drawNote(doc, y + 2, data.servicesSection.note);
  }

  y = drawSectionBanner(doc, y + 4, "Payment Terms & Financial Summary");
  y = drawWideTable(doc, y, data.financialRows);

  y = drawSectionBanner(doc, y + 4, "Terms & Conditions");
  y = drawTermsTable(doc, y, data.terms);

  y = drawSectionBanner(doc, y + 4, "Closing & Acceptance");
  y = drawParagraph(doc, y + 2, data.closingText);
  y = drawAcceptanceTable(doc, y + 6, data);

  drawFooter(doc, data);
  doc.save(fileName);
};
