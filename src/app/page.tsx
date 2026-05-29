import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db/prisma";
import {
  filterAndSortIssues,
  formatBountyAmount,
  issueDisplayTitle,
  issueDisplayUrl,
  issueSortDate,
  normalizeIssueDiscoveryParams,
  type IssueDiscoveryItem,
} from "@/lib/issues/discovery";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = normalizeIssueDiscoveryParams(await searchParams);
  const bounties = await prisma.bounty.findMany({
    include: { repository: true },
    orderBy: { updatedAt: "desc" },
  });
  const issues = filterAndSortIssues(
    bounties.map((bounty): IssueDiscoveryItem => {
      const amount = Number(bounty.amount);
      return {
        id: bounty.id,
        repository: `${bounty.repository.owner}/${bounty.repository.repo}`,
        issueNumber: bounty.issueNumber,
        title: bounty.issueTitle,
        url: bounty.issueUrl,
        status: bounty.issueState ?? bounty.status,
        excerpt: bounty.issueExcerpt,
        createdAt: bounty.createdAt,
        updatedAt: bounty.updatedAt,
        issueCreatedAt: bounty.issueCreatedAt,
        issueUpdatedAt: bounty.issueUpdatedAt,
        amount,
        currency: bounty.currency,
      };
    }),
    params,
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Pvium Issue Discovery</p>
          <h1 style={styles.title}>Find bounties across connected repos.</h1>
          <p style={styles.lede}>
            Browse active Pvium issue rewards by recent activity or highest
            payout, then open the GitHub issue to start work.
          </p>
        </div>
        <Link href="/deploy" style={styles.deployLink}>
          Deploy setup
        </Link>
      </header>

      <form style={styles.controls}>
        <label style={styles.controlLabel}>
          Sort
          <select name="sort" defaultValue={params.sort} style={styles.input}>
            <option value="recent">Recent issues</option>
            <option value="top">Top issues</option>
          </select>
        </label>
        <label style={styles.controlLabel}>
          Order
          <select name="order" defaultValue={params.order} style={styles.input}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <label style={styles.controlLabel}>
          Minimum bounty
          <input
            name="minBounty"
            type="number"
            min="0"
            step="0.01"
            defaultValue={params.minBounty || ""}
            placeholder="0"
            style={styles.input}
          />
        </label>
        <button type="submit" style={styles.button}>
          Apply
        </button>
      </form>

      <section style={styles.summary}>
        <strong>{issues.length}</strong> issue{issues.length === 1 ? "" : "s"}{" "}
        found
      </section>

      <section style={styles.issueList}>
        {issues.length ? (
          issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
        ) : (
          <div style={styles.emptyState}>
            No bounty issues match the current filters.
          </div>
        )}
      </section>
    </main>
  );
}

function IssueRow({ issue }: { issue: IssueDiscoveryItem }) {
  return (
    <a href={issueDisplayUrl(issue)} target="_blank" style={styles.issueCard}>
      <div style={styles.issueMain}>
        <div style={styles.issueTitle}>{issueDisplayTitle(issue)}</div>
        <div style={styles.issueMeta}>
          {issue.repository}#{issue.issueNumber} · {issue.status ?? "unknown"} ·{" "}
          Updated {issueSortDate(issue).toLocaleDateString("en-US")}
        </div>
        {issue.excerpt ? <p style={styles.excerpt}>{issue.excerpt}</p> : null}
      </div>
      <div style={styles.amount}>
        {formatBountyAmount(issue.amount, issue.currency)}
      </div>
    </a>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "42px 20px",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    maxWidth: 1080,
    margin: "0 auto 24px",
  },
  eyebrow: {
    margin: "0 0 10px",
    color: "#52627a",
    fontSize: 13,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 12px",
    fontSize: 42,
    lineHeight: 1.08,
    letterSpacing: 0,
  },
  lede: {
    maxWidth: 700,
    margin: 0,
    color: "#4e5d75",
    fontSize: 17,
    lineHeight: 1.55,
  },
  deployLink: {
    alignSelf: "flex-start",
    padding: "10px 14px",
    border: "1px solid #c8d0df",
    borderRadius: 8,
    background: "#ffffff",
    color: "#172033",
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(160px, 1fr)) auto",
    gap: 12,
    maxWidth: 1080,
    margin: "0 auto 16px",
    padding: 16,
    border: "1px solid #d8deea",
    borderRadius: 8,
    background: "#ffffff",
  },
  controlLabel: {
    display: "grid",
    gap: 6,
    color: "#46556e",
    fontSize: 13,
    fontWeight: 700,
  },
  input: {
    height: 40,
    padding: "0 10px",
    border: "1px solid #c8d0df",
    borderRadius: 6,
    background: "#ffffff",
    color: "#172033",
    fontSize: 14,
  },
  button: {
    alignSelf: "end",
    height: 40,
    padding: "0 16px",
    border: 0,
    borderRadius: 6,
    background: "#172033",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 800,
  },
  summary: {
    maxWidth: 1080,
    margin: "0 auto 12px",
    color: "#46556e",
    fontSize: 14,
  },
  issueList: {
    display: "grid",
    gap: 10,
    maxWidth: 1080,
    margin: "0 auto",
  },
  issueCard: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 18,
    padding: 18,
    border: "1px solid #d8deea",
    borderRadius: 8,
    background: "#ffffff",
    color: "#172033",
    textDecoration: "none",
  },
  issueMain: {
    minWidth: 0,
  },
  issueTitle: {
    marginBottom: 6,
    fontSize: 18,
    fontWeight: 800,
  },
  issueMeta: {
    color: "#66748a",
    fontSize: 13,
    fontWeight: 700,
  },
  excerpt: {
    margin: "10px 0 0",
    color: "#4e5d75",
    fontSize: 14,
    lineHeight: 1.5,
  },
  amount: {
    alignSelf: "start",
    minWidth: 96,
    padding: "8px 10px",
    borderRadius: 8,
    background: "#e9f8ef",
    color: "#166534",
    fontSize: 15,
    fontWeight: 900,
    textAlign: "center",
  },
  emptyState: {
    padding: 24,
    border: "1px solid #d8deea",
    borderRadius: 8,
    background: "#ffffff",
    color: "#66748a",
  },
};
