import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { QuotationDocumentData } from "../../types/quotation";

interface QuotationPdfDocumentProps {
  data: QuotationDocumentData;
}

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
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingRight: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    fontFamily: "Helvetica",
    color: colors.ink,
    fontSize: 11,
    lineHeight: 1.45,
  },
  hero: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    textAlign: "center",
  },
  heroCompany: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  heroTitle: {
    color: colors.paper,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  heroSubtitle: {
    color: "#C8D8ED",
    fontSize: 11,
  },
  metaGrid: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metaRow: {
    flexDirection: "row",
  },
  metaLabel: {
    width: "25%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  metaValue: {
    width: "25%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  sectionBanner: {
    marginTop: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
    backgroundColor: colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionBannerText: {
    color: colors.navy,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  twoColumnTable: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.navy,
    color: "#FFFFFF",
  },
  tableHeaderCell: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
  },
  leftCell: {
    width: "40%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    fontSize: 10.5,
  },
  rightCell: {
    width: "60%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 10.5,
  },
  simpleLeftCell: {
    width: "28%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    fontSize: 10.5,
  },
  simpleRightCell: {
    width: "72%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 10.5,
  },
  paragraph: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 1.55,
  },
  listItem: {
    flexDirection: "row",
    marginTop: 5,
  },
  bullet: {
    width: 12,
    fontFamily: "Helvetica-Bold",
  },
  listText: {
    flexGrow: 1,
    fontSize: 10.8,
    lineHeight: 1.5,
  },
  note: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0C97B",
    backgroundColor: "#FBF3D8",
    fontSize: 10,
    color: colors.ink,
    lineHeight: 1.45,
  },
  termsTable: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  termsRow: {
    flexDirection: "row",
  },
  termsIndex: {
    width: 38,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    fontSize: 10.2,
  },
  termsText: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 10.4,
    lineHeight: 1.5,
  },
  acceptanceTable: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  acceptanceHeaderRow: {
    flexDirection: "row",
  },
  acceptanceHeaderLeft: {
    width: "50%",
    backgroundColor: colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 9.6,
    fontFamily: "Helvetica-Bold",
  },
  acceptanceHeaderRight: {
    width: "50%",
    backgroundColor: colors.navySoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 9.6,
    fontFamily: "Helvetica-Bold",
  },
  acceptanceBodyRow: {
    flexDirection: "row",
  },
  acceptanceBodyLeft: {
    width: "50%",
    backgroundColor: colors.slate,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 10.4,
    lineHeight: 1.6,
  },
  acceptanceBodyRight: {
    width: "50%",
    backgroundColor: colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 10.4,
    lineHeight: 1.6,
  },
  blockIntro: {
    marginBottom: 8,
    fontSize: 10.6,
  },
  blockIntroStrong: {
    marginBottom: 8,
    fontSize: 10.6,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  fieldLine: {
    marginBottom: 6,
  },
  footer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.gold,
    paddingTop: 10,
    textAlign: "center",
    color: colors.grey,
    fontSize: 9.6,
    fontFamily: "Helvetica-Oblique",
  },
});

const fillForRow = (index: number) => (index % 2 === 0 ? colors.mist : "#FFFFFF");

export const QuotationPdfDocument = ({ data }: QuotationPdfDocumentProps) => (
  <Document title={data.quotationName}>
    <Page size="A4" style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.heroCompany}>{data.headerCompanyName}</Text>
        <Text style={styles.heroTitle}>{data.headerTitle}</Text>
        <Text style={styles.heroSubtitle}>{data.headerSubtitle}</Text>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { backgroundColor: colors.navy }]}>Quotation Ref.</Text>
          <Text style={[styles.metaValue, { backgroundColor: colors.mist }]}>{data.quotationReference}</Text>
          <Text style={[styles.metaLabel, { backgroundColor: colors.navy }]}>Date</Text>
          <Text style={[styles.metaValue, { backgroundColor: colors.mist }]}>{data.displayDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { backgroundColor: colors.navySoft }]}>Location</Text>
          <Text style={[styles.metaValue, { backgroundColor: colors.slate, fontFamily: "Helvetica" }]}>
            {data.location}
          </Text>
          <Text style={[styles.metaLabel, { backgroundColor: colors.navySoft }]}>Utilities</Text>
          <Text
            style={[
              styles.metaValue,
              {
                backgroundColor:
                  data.utilitiesTone === "success" ? "#E8F6EF" : "#FBEAEA",
                color: data.utilitiesTone === "success" ? colors.success : colors.danger,
              },
            ]}
          >
            {data.utilitiesMode}
          </Text>
        </View>
      </View>

      <Banner title="Addressed To" />
      <SimpleTable
        rows={[
          { label: "To", value: data.recipientTitle },
          { label: "Company", value: data.recipientCompanyName },
          { label: "Subject", value: data.subject },
        ]}
      />

      <Text style={styles.paragraph}>{data.salutation}</Text>
      <Text style={styles.paragraph}>{data.introduction}</Text>

      <Banner title="Description of Offer" />
      <WideTable rows={data.offerRows} />

      <Banner title={data.servicesSection.title} />
      {data.servicesSection.intro ? <Text style={styles.paragraph}>{data.servicesSection.intro}</Text> : null}
      <View style={{ marginTop: 8 }}>
        {data.servicesSection.items.map((item) => (
          <View key={item} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
      {data.servicesSection.note ? <Text style={styles.note}>{data.servicesSection.note}</Text> : null}

      <Banner title="Payment Terms & Financial Summary" />
      <WideTable rows={data.financialRows} />

      <Banner title="Terms & Conditions" />
      <View style={styles.termsTable}>
        {data.terms.map((term, index) => (
          <View key={`${index + 1}-${term}`} style={[styles.termsRow, { backgroundColor: fillForRow(index) }]}>
            <Text style={styles.termsIndex}>{index + 1}.</Text>
            <Text style={styles.termsText}>{term}</Text>
          </View>
        ))}
      </View>

      <Banner title="Closing & Acceptance" />
      <Text style={styles.paragraph}>{data.closingText}</Text>

      <View style={styles.acceptanceTable}>
        <View style={styles.acceptanceHeaderRow}>
          <Text style={styles.acceptanceHeaderLeft}>{data.issuerHeader}</Text>
          <Text style={styles.acceptanceHeaderRight}>{data.clientHeader}</Text>
        </View>
        <View style={styles.acceptanceBodyRow}>
          <View style={styles.acceptanceBodyLeft}>
            <Text style={styles.blockIntro}>{data.issuerBlock.intro}</Text>
            <Text style={styles.fieldLine}>Name: {data.issuerBlock.name}</Text>
            <Text style={styles.fieldLine}>Title: {data.issuerBlock.title}</Text>
            <Text style={styles.fieldLine}>Date: {data.issuerBlock.date}</Text>
            <Text style={{ marginTop: 12 }}>{data.issuerBlock.stampLabel}</Text>
          </View>
          <View style={styles.acceptanceBodyRight}>
            <Text style={styles.blockIntroStrong}>{data.clientBlock.intro}</Text>
            <Text style={styles.fieldLine}>Name: {data.clientBlock.name}</Text>
            <Text style={styles.fieldLine}>Title: {data.clientBlock.title}</Text>
            <Text style={styles.fieldLine}>Date: {data.clientBlock.date}</Text>
            <Text style={{ marginTop: 12 }}>{data.clientBlock.stampLabel}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>{data.footerText}</Text>
    </Page>
  </Document>
);

const Banner = ({ title }: { title: string }) => (
  <View style={styles.sectionBanner}>
    <Text style={styles.sectionBannerText}>{title}</Text>
  </View>
);

const SimpleTable = ({
  rows,
}: {
  rows: {
    label: string;
    value: string;
  }[];
}) => (
  <View style={styles.twoColumnTable}>
    {rows.map((row, index) => (
      <View key={row.label} style={[styles.tableRow, { backgroundColor: fillForRow(index) }]}>
        <Text style={styles.simpleLeftCell}>{row.label}</Text>
        <Text style={styles.simpleRightCell}>{row.value}</Text>
      </View>
    ))}
  </View>
);

const WideTable = ({
  rows,
}: {
  rows: {
    label: string;
    value: string;
  }[];
}) => (
  <View style={styles.twoColumnTable}>
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, { width: "40%" }]}>Particulars</Text>
      <Text style={[styles.tableHeaderCell, { width: "60%" }]}>Details</Text>
    </View>
    {rows.map((row, index) => (
      <View key={row.label} style={[styles.tableRow, { backgroundColor: fillForRow(index) }]}>
        <Text style={styles.leftCell}>{row.label}</Text>
        <Text style={styles.rightCell}>{row.value}</Text>
      </View>
    ))}
  </View>
);

