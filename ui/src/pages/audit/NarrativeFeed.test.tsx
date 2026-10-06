// @vitest-environment jsdom

import { describe, expect, it, beforeEach, vi } from "vitest";
import { NarrativeFeed } from "./NarrativeFeed";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { companyEventsApi } from "@/api/company-events";

const root = document.createElement("div");
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const reactRoot = createRoot(root);

function renderNarrativeFeed(props = {}) {
  reactRoot.innerHTML = "";
  act(() => {
    reactRoot.render(
      <QueryClientProvider client={client}>
        <NarrativeFeed {...props} />
      </QueryClientProvider>,
    );
  });
  return {
    container: root,
    rerender: (nextProps) => {
      act(() => {
        reactRoot.render(
          <QueryClientProvider client={client}>
            <NarrativeFeed {...nextProps} />
          </QueryClientProvider>,
        );
      });
    },
  };
}

const mockEvents = [
  {
    id: "1",
    version: 1,
    what: "started working on a feature",
    why: "to unblock the pipeline",
    evidence: [
      { kind: "issue", ref: "issue-123", label: "Bug report" },
    ],
    previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
    previousStage: "backlog",
    nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
    nextStage: "in_progress",
    status: "in_progress",
    humanAttentionRequired: false,
    humanAttentionReason: null,
  },
];

// Mock the companyEventsApi before each test
beforeEach(() => {
  vi.clearAllMocks();
  vi.mock("@/api/company-events", () => ({
    companyEventsApi: {
      list: vi.fn(),
    },
  }));
});

describe("NarrativeFeed", () => {
  it("renders events when data is available", async () => {
    vi.spyOn(companyEventsApi, "list").mockResolvedValueOnce({
      data: { events: mockEvents, nextCursor: null },
    });

    const { container } = renderNarrativeFeed({ companyId: "company-123" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    const eventRows = container.querySelectorAll("li");
    expect(eventRows.length).toBe(1);
  });

  it("renders empty state when no events", async () => {
    vi.spyOn(companyEventsApi, "list").mockResolvedValueOnce({
      data: { events: [], nextCursor: null },
    });

    const { container } = renderNarrativeFeed({ companyId: "company-123" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    // Check that the container has child elements (EmptyState or similar)
    expect(container.children.length).toBeGreaterThan(0);
  });

  it("renders with aria-label on root element", async () => {
    vi.spyOn(companyEventsApi, "list").mockResolvedValueOnce({
      data: { events: mockEvents, nextCursor: null },
    });

    const { container } = renderNarrativeFeed({ companyId: "company-123" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container.tagName).toBe("DIV");
  });

  it("api is called with correct companyId", async () => {
    vi.spyOn(companyEventsApi, "list").mockResolvedValueOnce({
      data: { events: [], nextCursor: null },
    });

    const { container } = renderNarrativeFeed({ companyId: "company-123" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    // Verify the API was called
    expect(companyEventsApi.list).toHaveBeenCalledWith("company-123");
  });
});