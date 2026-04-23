import type { QuotationFormValues } from "../types/quotation";

const draftStorageKey = "uae-requote-maker:draft:v1";

interface DraftPayload {
  savedAt: string;
  data: QuotationFormValues;
}

export const saveDraft = (values: QuotationFormValues) => {
  const payload: DraftPayload = {
    savedAt: new Date().toISOString(),
    data: values,
  };

  try {
    localStorage.setItem(draftStorageKey, JSON.stringify(payload));
  } catch {
    throw new Error(
      "Draft could not be saved locally. If you added a large logo image, try a smaller file or clear old browser storage.",
    );
  }

  return payload.savedAt;
};

export const loadDraft = () => {
  const rawDraft = localStorage.getItem(draftStorageKey);

  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft) as DraftPayload;
  } catch {
    localStorage.removeItem(draftStorageKey);
    return null;
  }
};

export const clearDraft = () => {
  localStorage.removeItem(draftStorageKey);
};
