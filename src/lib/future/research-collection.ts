import type {
  CollectionSourceItem,
  GeneratedBriefSourceBinding,
  ResearchCollection,
  SourceDocument,
} from "@/lib/types/workspace";

export interface SourceReferenceInput {
  source: SourceDocument;
  segmentCount: number;
  citationCount: number;
}

export function createResearchCollectionFromSource(input: SourceReferenceInput): ResearchCollection {
  const sourceItem = buildCollectionSourceItem(input, 1, true);

  return {
    id: `collection-${input.source.id}`,
    activeSourceId: input.source.id,
    status: "single-source",
    sourceCount: 1,
    sources: [sourceItem],
  };
}

export function addSourceReferenceToCollection(
  collection: ResearchCollection,
  input: SourceReferenceInput,
): ResearchCollection {
  const existingIndex = collection.sources.findIndex((item) => item.sourceId === input.source.id);
  const nextSources =
    existingIndex >= 0
      ? collection.sources.map((item, index) =>
          index === existingIndex
            ? buildCollectionSourceItem(input, item.addedOrder, input.source.id === collection.activeSourceId)
            : { ...item, isActive: item.sourceId === collection.activeSourceId },
        )
      : [
          ...collection.sources.map((item) => ({ ...item, isActive: item.sourceId === collection.activeSourceId })),
          buildCollectionSourceItem(input, collection.sources.length + 1, input.source.id === collection.activeSourceId),
        ];

  return normalizeCollection({
    ...collection,
    sources: nextSources,
  });
}

export function setActiveCollectionSource(collection: ResearchCollection, activeSourceId: string): ResearchCollection {
  const hasSource = collection.sources.some((item) => item.sourceId === activeSourceId);
  const nextActiveSourceId = hasSource ? activeSourceId : collection.activeSourceId;

  return normalizeCollection({
    ...collection,
    activeSourceId: nextActiveSourceId,
    sources: collection.sources.map((item) => ({
      ...item,
      isActive: item.sourceId === nextActiveSourceId,
    })),
  });
}

export function buildGeneratedBriefSourceBinding(
  collection: ResearchCollection,
  activeSource: SourceDocument,
): GeneratedBriefSourceBinding {
  return {
    collectionId: collection.id,
    activeSourceId: activeSource.id,
    sourceIds: [activeSource.id],
    sourceCount: 1,
    scope: "active-source-only",
    status: "bound-to-active-source",
  };
}

export function getCollectionBoundaryLabel(collection: ResearchCollection) {
  return collection.sourceCount === 1
    ? "Single active source boundary"
    : `${collection.sourceCount} source references · active-source-only generation`;
}

function buildCollectionSourceItem(
  input: SourceReferenceInput,
  addedOrder: number,
  isActive: boolean,
): CollectionSourceItem {
  return {
    id: `collection-source-${input.source.id}`,
    sourceId: input.source.id,
    title: input.source.title.en || input.source.title.ko,
    type: input.source.type,
    providerName: input.source.providerName,
    providerReliability: input.source.providerReliability,
    segmentCount: input.segmentCount,
    citationCount: input.citationCount,
    addedOrder,
    isActive,
  };
}

function normalizeCollection(collection: ResearchCollection): ResearchCollection {
  const sortedSources = [...collection.sources].sort((left, right) => left.addedOrder - right.addedOrder);

  return {
    ...collection,
    sourceCount: sortedSources.length,
    status: sortedSources.length > 1 ? "multi-source-boundary" : "single-source",
    sources: sortedSources,
  };
}
