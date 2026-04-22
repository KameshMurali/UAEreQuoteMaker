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

  localStorage.setItem(draftStorageKey, JSON.stringify(payload));
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

