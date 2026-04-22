# UAE reQuote Maker

Interactive quotation generator for commercial real estate and labour accommodation proposals. The app is built around structured data entry, template-driven wording, and document export rather than freeform editing.

## What It Does

- Collects quotation details through a React form-based builder
- Supports 4 Miller quotation variants:
  - Sharjah – Excluding Utilities
  - Sharjah – Including Utilities
  - UAQ – Excluding Utilities
  - UAQ – Including Utilities
- Auto-calculates:
  - annual contract value
  - security deposit
  - agency fee
  - VAT on agency fee
  - amount in words
- Generates:
  - Word `.docx`
  - PDF `.pdf`
- Uses dynamic file naming:
  - `[QuotationName]_[QuotationRef].docx`
  - `[QuotationName]_[QuotationRef].pdf`
- Saves and restores drafts locally from the browser
- Includes sample dummy data for quick testing
- Includes a live preview that mirrors the mapped export content

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- `docx`
- `jspdf`
- `jspdf-autotable`

## Getting Started

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

To create a production build:

```bash
npm run build
```

## GitHub Pages Deployment

The repository includes a GitHub Pages workflow at `.github/workflows/deploy-pages.yml`.
It deploys the app from the `develop` branch and is set up for the custom domain:

`comrequote.tothebeginning.com`

To finish the custom domain setup in GitHub Pages:

1. Set the Pages source to `GitHub Actions`
2. Set the custom domain to `comrequote.tothebeginning.com`
3. Add a DNS `CNAME` record for `comrequote` pointing to `kameshmurali.github.io`

The `public/CNAME` file ensures the deployed artifact includes the expected domain value.

## Main User Flow

1. Select the quotation template
2. Fill the grouped quotation details
3. Review the live preview
4. Save a draft locally if needed
5. Export to Word or PDF

## Project Structure

```text
src/
  components/
    pdf/
  data/
  generators/
  mappers/
  schemas/
  templates/
  types/
  utils/
```

## Architecture Notes

- `schemas/`
  - Zod schema and validation rules
- `templates/`
  - Template config for the 4 quotation modes
- `mappers/`
  - Converts form state into a single shared quotation document model
- `generators/`
  - Exports the shared model as DOCX or PDF
- `components/`
  - Builder UI and quotation preview
- `utils/storage.ts`
  - Local draft save/load helpers

## Template Fidelity

The wording, section order, financial tables, utilities/services blocks, numbered terms, and acceptance layout were modeled from the four Miller quotation source documents supplied for this project.

## Notes

- The export libraries are loaded on demand so the main builder loads faster.
- Local draft support uses browser `localStorage`.
- If a signature field is left blank, the generated document keeps an underline-style placeholder.
