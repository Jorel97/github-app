export type IssueDiscoverySort = "recent" | "top";
export type IssueDiscoveryOrder = "asc" | "desc";

export interface IssueDiscoveryItem {
  id: string;
  repository: string;
  issueNumber: number;
  title: string | null;
  url: string | null;
  status: string | null;
  excerpt: string | null;
  createdAt: Date;
  updatedAt: Date;
  issueCreatedAt: Date | null;
  issueUpdatedAt: Date | null;
  amount: number;
  currency: string;
}

export function normalizeIssueDiscoveryParams(params: {
  sort?: string | string[];
  order?: string | string[];
  minBounty?: string | string[];
}) {
  const sortValue = firstValue(params.sort);
  const orderValue = firstValue(params.order);
  const minBountyValue = firstValue(params.minBounty);
  const minBounty = Number(minBountyValue ?? 0);

  return {
    sort: sortValue === "top" ? "top" : ("recent" as IssueDiscoverySort),
    order: orderValue === "asc" ? "asc" : ("desc" as IssueDiscoveryOrder),
    minBounty: Number.isFinite(minBounty) && minBounty > 0 ? minBounty : 0,
  };
}

export function filterAndSortIssues(
  items: IssueDiscoveryItem[],
  params: {
    sort: IssueDiscoverySort;
    order: IssueDiscoveryOrder;
    minBounty: number;
  },
) {
  const direction = params.order === "asc" ? 1 : -1;

  return items
    .filter((item) => item.amount >= params.minBounty)
    .sort((left, right) => {
      if (params.sort === "top") {
        const amountDelta = left.amount - right.amount;
        if (amountDelta !== 0) return amountDelta * direction;
      }

      const leftDate = issueSortDate(left).getTime();
      const rightDate = issueSortDate(right).getTime();
      if (leftDate !== rightDate) return (leftDate - rightDate) * direction;

      return left.repository.localeCompare(right.repository);
    });
}

export function formatBountyAmount(amount: number, currency: string) {
  return `${trimTrailingZeros(amount)} ${currency}`;
}

export function issueSortDate(item: IssueDiscoveryItem) {
  return item.issueUpdatedAt ?? item.issueCreatedAt ?? item.updatedAt;
}

export function issueDisplayTitle(item: IssueDiscoveryItem) {
  return item.title ?? `${item.repository}#${item.issueNumber}`;
}

export function issueDisplayUrl(item: IssueDiscoveryItem) {
  return (
    item.url ??
    `https://github.com/${item.repository}/issues/${item.issueNumber}`
  );
}

export function makeIssueExcerpt(body: unknown) {
  if (typeof body !== "string") return null;
  const excerpt = body.replace(/\s+/g, " ").trim().slice(0, 220);
  return excerpt || null;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function trimTrailingZeros(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  });
}
