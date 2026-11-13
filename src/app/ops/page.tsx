import Link from "next/link";
import { Suspense } from "react";
import { KINDS, isKind, isOverdue, isStatus, labelFor, pageCount, parsePage, PAGE_SIZE, type Kind } from "@/lib/records";
import { PACKAGING_TYPES } from "@/lib/schemas";
import { listRecords, type ListRow } from "@/lib/server/ops";
import { Loading, OpsHeader, OverdueTag, StatusTag, formatDate, formatDateTime } from "./shared";

// The list: quote requests and manufacturer applications in two tabs, newest first.
export default function Ops({ searchParams }: PageProps<"/ops">) {
  return (
    // Nothing about the console, not even its top bar, is sent until the owner check passes.
    <Suspense fallback={<Loading what="records" />}>
      <List searchParams={searchParams} />
    </Suspense>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** The address for a tab, filter and page. Defaults are left out to keep it short. */
function href(kind: Kind, status: string | null, page = 1) {
  const query = new URLSearchParams();
  if (kind !== "rfq") query.set("tab", kind);
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `/ops?${text}` : "/ops";
}

const tabClass = (on: boolean) =>
  `border-b-2 px-1 pb-2 font-medium ${on ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`;
const chipClass = (on: boolean) =>
  `rounded-sm border px-2 py-1 text-sm ${on ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"}`;
const cell = "px-3 py-2 align-top";

async function List({ searchParams }: Pick<PageProps<"/ops">, "searchParams">) {
  const query = await searchParams;
  const tab = one(query.tab);
  const kind: Kind = isKind(tab) ? tab : "rfq";
  const wanted = one(query.status);
  const status = isStatus(kind, wanted) ? wanted : null;
  const page = parsePage(one(query.page));

  // listRecords checks the owner before it reads anything.
  const { rows, total } = await listRecords(kind, status, page);
  const pages = pageCount(total);
  const first = (page - 1) * PAGE_SIZE + 1;

  return (
    <>
      <OpsHeader />
      <nav aria-label="Record type" className="flex gap-6 border-b border-line">
        {(Object.keys(KINDS) as Kind[]).map((k) => (
          <Link key={k} href={href(k, null)} aria-current={k === kind ? "page" : undefined} className={tabClass(k === kind)}>
            {KINDS[k].label}
          </Link>
        ))}
      </nav>

      <nav aria-label="Status filter" className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Status:</span>
        <Link href={href(kind, null)} aria-current={!status ? "true" : undefined} className={chipClass(!status)}>
          All
        </Link>
        {KINDS[kind].statuses.map((s) => (
          <Link key={s} href={href(kind, s)} aria-current={s === status ? "true" : undefined} className={chipClass(s === status)}>
            {s}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-sm border border-line bg-surface p-5 text-muted">
          {page > 1
            ? "There is nothing on this page."
            : status
              ? `No ${KINDS[kind].label.toLowerCase()} with the status “${status}”.`
              : `No ${KINDS[kind].label.toLowerCase()} yet. New ones appear here as soon as a form is sent.`}{" "}
          {(page > 1 || status) && (
            <Link href={href(kind, null)} className="text-action underline underline-offset-4">
              Show all
            </Link>
          )}
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            Showing {first}–{first + rows.length - 1} of {total}
          </p>
          {/* On a narrow screen the table scrolls sideways rather than squashing. */}
          <div
            role="region"
            aria-label={`${KINDS[kind].label} table`}
            tabIndex={0}
            className="mt-2 overflow-x-auto rounded-sm border border-line bg-surface"
          >
            <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th scope="col" className={cell}>Reference</th>
                  <th scope="col" className={cell}>Received</th>
                  <th scope="col" className={cell}>Name / company</th>
                  <th scope="col" className={cell}>{kind === "rfq" ? "Packaging, quantity" : "Products"}</th>
                  <th scope="col" className={cell}>Status</th>
                  <th scope="col" className={cell}>Next action</th>
                  <th scope="col" className={cell}>Due</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Row key={row.id} kind={kind} row={row} />
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center gap-4 text-sm">
              {page > 1 ? (
                <Link href={href(kind, status, page - 1)} className="text-action underline underline-offset-4">
                  Newer
                </Link>
              ) : (
                <span className="text-muted">Newer</span>
              )}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={href(kind, status, page + 1)} className="text-action underline underline-offset-4">
                  Older
                </Link>
              ) : (
                <span className="text-muted">Older</span>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}

function Row({ kind, row }: { kind: Kind; row: ListRow }) {
  const overdue = isOverdue(kind, row.status, row.next_action_due);
  const company = kind === "rfq" ? row.company : row.company_name;
  return (
    <tr className={`border-b border-line last:border-b-0 ${overdue ? "bg-error/5" : ""}`}>
      <td className={`${cell} whitespace-nowrap`}>
        <Link href={`/ops/${kind}/${row.id}`} className="font-medium text-action underline underline-offset-4">
          {row.reference}
        </Link>
        {!row.notified_at && <div className="mt-1 text-xs font-medium text-error">Alert not sent</div>}
        {/* On a phone the status and due columns are off to the right, so repeat them here. */}
        <div className="mt-1 flex flex-wrap gap-1 md:hidden">
          <StatusTag status={row.status} />
          {overdue && <OverdueTag />}
        </div>
      </td>
      <td className={`${cell} whitespace-nowrap`}>{formatDateTime(row.created_at)}</td>
      <td className={cell}>
        {row.contact_name}
        {company && <div className="text-muted">{company}</div>}
      </td>
      <td className={cell}>
        {kind === "rfq" ? (
          <>
            {labelFor(PACKAGING_TYPES, row.packaging_type ?? "")}
            <div className="text-muted">{row.quantity?.toLocaleString("en-IN")} pieces</div>
          </>
        ) : (
          (row.products ?? []).map((p) => labelFor(PACKAGING_TYPES, p)).join(", ")
        )}
      </td>
      <td className={cell}>
        <StatusTag status={row.status} />
      </td>
      <td className={cell}>{row.next_action || <span className="text-muted">None</span>}</td>
      <td className={`${cell} whitespace-nowrap`}>
        {row.next_action_due ? formatDate(row.next_action_due) : <span className="text-muted">None</span>}
        {overdue && (
          <div className="mt-1">
            <OverdueTag />
          </div>
        )}
      </td>
    </tr>
  );
}
