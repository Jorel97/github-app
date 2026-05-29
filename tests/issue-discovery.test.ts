import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterAndSortIssues,
  makeIssueExcerpt,
  normalizeIssueDiscoveryParams,
  type IssueDiscoveryItem,
} from "../src/lib/issues/discovery.ts";

const now = new Date("2026-05-29T12:00:00.000Z");

function issue(
  id: string,
  amount: number,
  issueUpdatedAt: string,
): IssueDiscoveryItem {
  return {
    id,
    repository: `owner/${id}`,
    issueNumber: 1,
    title: id,
    url: `https://github.com/owner/${id}/issues/1`,
    status: "open",
    excerpt: null,
    createdAt: now,
    updatedAt: now,
    issueCreatedAt: new Date("2026-05-01T00:00:00.000Z"),
    issueUpdatedAt: new Date(issueUpdatedAt),
    amount,
    currency: "USDC",
  };
}

describe("normalizeIssueDiscoveryParams", () => {
  it("keeps only supported sort, order, and bounty filters", () => {
    assert.deepEqual(
      normalizeIssueDiscoveryParams({
        sort: "top",
        order: "asc",
        minBounty: "10.5",
      }),
      { sort: "top", order: "asc", minBounty: 10.5 },
    );
    assert.deepEqual(
      normalizeIssueDiscoveryParams({
        sort: "unknown",
        order: "sideways",
        minBounty: "-2",
      }),
      { sort: "recent", order: "desc", minBounty: 0 },
    );
  });
});

describe("filterAndSortIssues", () => {
  it("sorts by recent activity descending", () => {
    const sorted = filterAndSortIssues(
      [
        issue("older", 25, "2026-05-10T00:00:00.000Z"),
        issue("newer", 5, "2026-05-20T00:00:00.000Z"),
      ],
      { sort: "recent", order: "desc", minBounty: 0 },
    );

    assert.deepEqual(
      sorted.map((item) => item.id),
      ["newer", "older"],
    );
  });

  it("filters by minimum bounty and sorts top payouts first", () => {
    const sorted = filterAndSortIssues(
      [
        issue("small", 5, "2026-05-20T00:00:00.000Z"),
        issue("medium", 25, "2026-05-10T00:00:00.000Z"),
        issue("large", 50, "2026-05-01T00:00:00.000Z"),
      ],
      { sort: "top", order: "desc", minBounty: 10 },
    );

    assert.deepEqual(
      sorted.map((item) => item.id),
      ["large", "medium"],
    );
  });
});

describe("makeIssueExcerpt", () => {
  it("normalizes body whitespace and caps length", () => {
    const excerpt = makeIssueExcerpt("A\n\nbody   with\tspace".repeat(20));
    assert.equal(typeof excerpt, "string");
    assert.ok(excerpt!.length <= 220);
    assert.doesNotMatch(excerpt!, /\s{2,}/);
  });
});
