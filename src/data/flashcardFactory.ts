import type { Flashcard, ProvenanceMetadata } from '../types/domain';

export interface RawBilingualCard {
  id: string;
  chapter: number;
  objectiveId: string;
  frontFr: string;
  frontEn: string;
  backFr: string;
  backEn: string;
  hintFr?: string;
  hintEn?: string;
  tags: string[];
}

export interface DeckMeta {
  certificationId: string;
  versionId: string;
  provenance: ProvenanceMetadata;
  timestamp: string;
}

export function buildBilingualDeck(meta: DeckMeta, cards: RawBilingualCard[]): Flashcard[] {
  return cards.map((raw) => ({
    id: raw.id,
    certificationId: meta.certificationId,
    versionId: meta.versionId,
    chapterId: `${meta.versionId}-ch${raw.chapter}`,
    objectiveId: raw.objectiveId,
    languageScope: 'bilingual',
    front: { fr: raw.frontFr, en: raw.frontEn },
    back: { fr: raw.backFr, en: raw.backEn },
    ...(raw.hintFr && raw.hintEn ? { hint: { fr: raw.hintFr, en: raw.hintEn } } : {}),
    tags: raw.tags,
    isCustom: false,
    provenance: meta.provenance,
    createdAt: meta.timestamp,
    updatedAt: meta.timestamp,
  }));
}
