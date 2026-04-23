import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  type IParagraphOptions,
  type IRunOptions,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import type { QuotationDocumentData, SignatureBlock } from "../types/quotation";
import { dataUrlToUint8Array, getContainDimensions, getImageDimensions } from "../utils/images";

const colors = {
  navy: "0D2B55",
  navySoft: "1B4F8A",
  paper: "FDF3DC",
  ink: "1A1A2E",
  mist: "EBF2FA",
  slate: "F7F8FA",
  gold: "B8860B",
  success: "257752",
  danger: "C0392B",
  line: "D0D5DE",
  footer: "888888",
};

const textRun = (text: string, options?: Partial<IRunOptions>) =>
  new TextRun({
    text,
    font: "Arial",
    size: 22,
    color: colors.ink,
    ...(options ?? {}),
  });

const paragraph = (text: string, options?: Partial<IParagraphOptions>) =>
  new Paragraph({
    children: [textRun(text)],
    ...(options ?? {}),
  });

const filledCell = ({
  text,
  fill,
  color,
  width,
  bold = true,
  size = 20,
  margins,
}: {
  text: string;
  fill: string;
  color: string;
  width: number;
  bold?: boolean;
  size?: number;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: {
      fill,
    },
    margins:
      margins ?? {
        top: 100,
        bottom: 100,
        left: 160,
        right: 160,
      },
    borders: {
      top: { style: BorderStyle.SINGLE, color: fill === "FFFFFF" ? colors.line : "FFFFFF", size: 4 },
      bottom: { style: BorderStyle.SINGLE, color: fill === "FFFFFF" ? colors.line : "FFFFFF", size: 4 },
      left: { style: BorderStyle.SINGLE, color: fill === "FFFFFF" ? colors.line : "FFFFFF", size: 4 },
      right: { style: BorderStyle.SINGLE, color: fill === "FFFFFF" ? colors.line : "FFFFFF", size: 4 },
    },
    children: [
      new Paragraph({
        children: [
          textRun(text, {
            bold,
            color,
            size,
          }),
        ],
      }),
    ],
  });

const sectionBanner = (text: string) =>
  new Paragraph({
    children: [
      textRun(text, {
        bold: true,
        color: colors.navy,
        size: 24,
      }),
    ],
    shading: {
      fill: colors.mist,
    },
    border: {
      left: {
        style: BorderStyle.SINGLE,
        color: colors.gold,
        size: 16,
        space: 8,
      },
    },
    indent: {
      left: 160,
    },
    spacing: {
      before: 240,
      after: 100,
    },
  });

const createDetailTable = (rows: { label: string; value: string }[]) =>
  new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: rows.map(
      (row, index) =>
        new TableRow({
          children: [
            filledCell({
              text: row.label,
              fill: colors.navy,
              color: "FFFFFF",
              width: 2200,
            }),
            filledCell({
              text: row.value,
              fill: index % 2 === 0 ? colors.slate : "FFFFFF",
              color: colors.ink,
              width: 7160,
              bold: false,
              size: 21,
            }),
          ],
        }),
    ),
  });

const createWideTable = (rows: { label: string; value: string }[]) =>
  new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          filledCell({
            text: "PARTICULARS",
            fill: colors.navy,
            color: "FFFFFF",
            width: 3800,
          }),
          filledCell({
            text: "DETAILS",
            fill: colors.navy,
            color: "FFFFFF",
            width: 5560,
          }),
        ],
      }),
      ...rows.map(
        (row, index) =>
          new TableRow({
            children: [
              filledCell({
                text: row.label,
                fill: index % 2 === 0 ? colors.mist : "FFFFFF",
                color: colors.navy,
                width: 3800,
              }),
              filledCell({
                text: row.value,
                fill: index % 2 === 0 ? colors.slate : "FFFFFF",
                color: colors.ink,
                width: 5560,
                bold: false,
                size: 21,
              }),
            ],
          }),
      ),
    ],
  });

const createTermsTable = (terms: string[]) =>
  new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: terms.map(
      (term, index) =>
        new TableRow({
          children: [
            filledCell({
              text: `${index + 1}.`,
              fill: index % 2 === 0 ? colors.mist : "FFFFFF",
              color: colors.navy,
              width: 560,
              margins: {
                top: 80,
                bottom: 80,
                left: 100,
                right: 60,
              },
            }),
            filledCell({
              text: term,
              fill: index % 2 === 0 ? colors.slate : "FFFFFF",
              color: colors.ink,
              width: 8800,
              bold: false,
              size: 20,
              margins: {
                top: 80,
                bottom: 80,
                left: 120,
                right: 120,
              },
            }),
          ],
        }),
    ),
  });

const buildSignatureParagraphs = (block: SignatureBlock, emphasizeIntro = false) => [
  new Paragraph({
    spacing: {
      after: 80,
    },
    children: [
      textRun(block.intro, {
        bold: emphasizeIntro,
        color: emphasizeIntro ? colors.navy : colors.ink,
        size: 20,
      }),
    ],
  }),
  paragraph(`Name:  ${block.name}`, {
    spacing: { after: 80 },
  }),
  paragraph(`Title:    ${block.title}`, {
    spacing: { after: 80 },
  }),
  paragraph(`Date:   ${block.date}`, {
    spacing: { after: 80 },
  }),
  paragraph(block.stampLabel, {
    spacing: { before: 40 },
  }),
];

const createAcceptanceTable = (data: QuotationDocumentData) =>
  new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          filledCell({
            text: data.issuerHeader,
            fill: colors.navy,
            color: "FFFFFF",
            width: 4560,
          }),
          filledCell({
            text: data.clientHeader,
            fill: colors.navySoft,
            color: "FFFFFF",
            width: 4800,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 4560, type: WidthType.DXA },
            shading: { fill: colors.slate },
            borders: {
              top: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
              bottom: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
              left: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
              right: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
            },
            margins: {
              top: 160,
              bottom: 160,
              left: 160,
              right: 160,
            },
            children: buildSignatureParagraphs(data.issuerBlock),
          }),
          new TableCell({
            width: { size: 4800, type: WidthType.DXA },
            shading: { fill: colors.mist },
            borders: {
              top: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
              bottom: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
              left: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
              right: { style: BorderStyle.SINGLE, color: colors.line, size: 4 },
            },
            margins: {
              top: 160,
              bottom: 160,
              left: 160,
              right: 160,
            },
            children: buildSignatureParagraphs(data.clientBlock, true),
          }),
        ],
      }),
    ],
  });

export const generateDocx = async (data: QuotationDocumentData, fileName: string) => {
  const headerLogoDataUrl = data.headerLogoDataUrl;
  const headerLogo = headerLogoDataUrl
    ? await (async () => {
        const sourceSize = await getImageDimensions(headerLogoDataUrl);
        const fittedSize = getContainDimensions(sourceSize.width, sourceSize.height, 160, 64);

        return new ImageRun({
          type: "png",
          data: dataUrlToUint8Array(headerLogoDataUrl),
          transformation: fittedSize,
        });
      })()
    : null;
  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900,
            },
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
          },
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 9360, type: WidthType.DXA },
                    shading: { fill: colors.navy },
                    borders: {
                      top: { style: BorderStyle.SINGLE, color: colors.navy, size: 4 },
                      bottom: { style: BorderStyle.SINGLE, color: colors.navy, size: 4 },
                      left: { style: BorderStyle.SINGLE, color: colors.navy, size: 4 },
                      right: { style: BorderStyle.SINGLE, color: colors.navy, size: 4 },
                    },
                    margins: { top: 240, bottom: 240, left: 360, right: 360 },
                    children: [
                      ...(headerLogo
                        ? [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              spacing: { after: 120 },
                              children: [headerLogo],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 60 },
                        children: [
                          textRun(data.headerCompanyName, {
                            bold: true,
                            color: "FFFFFF",
                            size: 28,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 60 },
                        children: [
                          textRun(data.headerTitle, {
                            bold: true,
                            color: colors.paper,
                            size: 36,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          textRun(data.headerSubtitle, {
                            color: "C8D8ED",
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 60, before: 120 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  filledCell({
                    text: "Quotation Ref.",
                    fill: colors.navy,
                    color: "FFFFFF",
                    width: 2340,
                  }),
                  filledCell({
                    text: data.quotationReference,
                    fill: colors.mist,
                    color: colors.ink,
                    width: 2340,
                    size: 21,
                  }),
                  filledCell({
                    text: "Date",
                    fill: colors.navy,
                    color: "FFFFFF",
                    width: 2340,
                  }),
                  filledCell({
                    text: data.displayDate,
                    fill: colors.mist,
                    color: colors.ink,
                    width: 2340,
                    size: 21,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  filledCell({
                    text: "Location",
                    fill: colors.navySoft,
                    color: "FFFFFF",
                    width: 2340,
                  }),
                  filledCell({
                    text: data.location,
                    fill: colors.slate,
                    color: colors.ink,
                    width: 2340,
                    bold: false,
                    size: 21,
                  }),
                  filledCell({
                    text: "Utilities",
                    fill: colors.navySoft,
                    color: "FFFFFF",
                    width: 2340,
                  }),
                  filledCell({
                    text: data.utilitiesMode,
                    fill: colors.slate,
                    color: data.utilitiesTone === "success" ? colors.success : colors.danger,
                    width: 2340,
                    size: 21,
                  }),
                ],
              }),
            ],
          }),
          sectionBanner("Addressed To"),
          createDetailTable([
            { label: "To", value: data.recipientTitle },
            { label: "Company", value: data.recipientCompanyName },
            { label: "Subject", value: data.subject },
          ]),
          new Paragraph({ spacing: { after: 60, before: 80 } }),
          paragraph(data.salutation, {
            spacing: { after: 60, before: 60 },
          }),
          paragraph(data.introduction, {
            spacing: { after: 60, before: 60 },
          }),
          sectionBanner("Description of Offer"),
          createWideTable(data.offerRows),
          sectionBanner(data.servicesSection.title),
          ...(data.servicesSection.intro
            ? [
                paragraph(data.servicesSection.intro, {
                  spacing: { after: 60, before: 60 },
                }),
              ]
            : []),
          ...data.servicesSection.items.map(
            (item) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 50 },
                children: [
                  textRun(item, {
                    size: 21,
                  }),
                ],
              }),
          ),
          ...(data.servicesSection.note
            ? [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  shading: { fill: "FBF3D8" },
                  border: {
                    top: { style: BorderStyle.SINGLE, color: "E0C97B", size: 4 },
                    bottom: { style: BorderStyle.SINGLE, color: "E0C97B", size: 4 },
                    left: { style: BorderStyle.SINGLE, color: "E0C97B", size: 4 },
                    right: { style: BorderStyle.SINGLE, color: "E0C97B", size: 4 },
                  },
                  indent: {
                    left: 120,
                    right: 120,
                  },
                  children: [
                    textRun(data.servicesSection.note, {
                      size: 20,
                    }),
                  ],
                }),
              ]
            : []),
          sectionBanner("Payment Terms & Financial Summary"),
          createWideTable(data.financialRows),
          sectionBanner("Terms & Conditions"),
          createTermsTable(data.terms),
          sectionBanner("Closing & Acceptance"),
          paragraph(data.closingText, {
            spacing: { after: 60, before: 60 },
          }),
          createAcceptanceTable(data),
          new Paragraph({
            spacing: { before: 120, after: 120 },
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                color: colors.gold,
                size: 6,
                space: 2,
              },
            },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80 },
            children: [
              textRun(data.footerText, {
                italics: true,
                color: colors.footer,
                size: 18,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, fileName);
};
