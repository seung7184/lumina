import { describe, expect, it } from "vitest";
import {
  addSourceReferenceToCollection,
  buildGeneratedBriefSourceBinding,
  createResearchCollectionFromSource,
  getCollectionBoundaryLabel,
  setActiveCollectionSource,
} from "@/lib/future/research-collection";
import { luminaDemo } from "@/lib/mock/lumina-demo";
import type { SourceDocument } from "@/lib/types/workspace";

const webpageSource: SourceDocument = {
  id: "src-web-boundary",
  type: "webpage",
  title: { en: "Web boundary source", ko: "Web boundary source" },
  url: "https://example.com/articles/boundary",
  sourceLanguage: "en",
  thumbnailLabel: "WEB",
  providerName: "Mock Webpage",
  providerReliability: "demo",
  segmentIds: ["web-seg-1", "web-seg-2", "web-seg-3"],
};

describe("research collection boundary", () => {
  it("creates a collection from the current source", () => {
    const collection = createResearchCollectionFromSource({
      source: luminaDemo.source,
      segmentCount: luminaDemo.segments.length,
      citationCount: luminaDemo.summaries.en.citations.length,
    });

    expect(collection).toMatchObject({
      id: `collection-${luminaDemo.source.id}`,
      activeSourceId: luminaDemo.source.id,
      status: "single-source",
      sourceCount: 1,
    });
    expect(collection.sources).toEqual([
      expect.objectContaining({
        sourceId: luminaDemo.source.id,
        title: luminaDemo.source.title.en,
        segmentCount: luminaDemo.segments.length,
        citationCount: luminaDemo.summaries.en.citations.length,
        isActive: true,
      }),
    ]);
    expect(getCollectionBoundaryLabel(collection)).toBe("Single active source boundary");
  });

  it("adds source references deterministically without changing the active source", () => {
    const initial = createResearchCollectionFromSource({
      source: luminaDemo.source,
      segmentCount: 7,
      citationCount: 6,
    });
    const collection = addSourceReferenceToCollection(initial, {
      source: webpageSource,
      segmentCount: 3,
      citationCount: 3,
    });

    expect(collection.status).toBe("multi-source-boundary");
    expect(collection.sourceCount).toBe(2);
    expect(collection.activeSourceId).toBe(luminaDemo.source.id);
    expect(collection.sources.map((item) => item.sourceId)).toEqual([luminaDemo.source.id, webpageSource.id]);
    expect(collection.sources.map((item) => item.isActive)).toEqual([true, false]);
    expect(getCollectionBoundaryLabel(collection)).toBe("2 source references · active-source-only generation");
  });

  it("keeps active source explicit when switching the collection source", () => {
    const collection = addSourceReferenceToCollection(
      createResearchCollectionFromSource({
        source: luminaDemo.source,
        segmentCount: 7,
        citationCount: 6,
      }),
      {
        source: webpageSource,
        segmentCount: 3,
        citationCount: 3,
      },
    );
    const switched = setActiveCollectionSource(collection, webpageSource.id);

    expect(switched.activeSourceId).toBe(webpageSource.id);
    expect(switched.sources.map((item) => item.isActive)).toEqual([false, true]);
  });

  it("binds generated briefs to the active source only", () => {
    const collection = addSourceReferenceToCollection(
      createResearchCollectionFromSource({
        source: luminaDemo.source,
        segmentCount: 7,
        citationCount: 6,
      }),
      {
        source: webpageSource,
        segmentCount: 3,
        citationCount: 3,
      },
    );
    const binding = buildGeneratedBriefSourceBinding(collection, luminaDemo.source);

    expect(binding).toEqual({
      collectionId: collection.id,
      activeSourceId: luminaDemo.source.id,
      sourceIds: [luminaDemo.source.id],
      sourceCount: 1,
      scope: "active-source-only",
      status: "bound-to-active-source",
    });
  });
});
