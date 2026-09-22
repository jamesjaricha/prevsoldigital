import { redirect } from "next/navigation";
import { DocumentIcon, DownloadIcon } from "@/components/icons";
import { Panel, PortalHeading } from "@/components/portal-ui";
import { Button } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

/**
 * Placeholder document list.
 *
 * There is no `Document` model in the schema yet, so these entries are still
 * static. Once document storage lands, replace this array with a query scoped
 * to `userId` in the same shape.
 */
const documents = [
  {
    name: "Master Services Agreement",
    type: "Contract",
    date: "14 March 2024",
    size: "248 KB",
  },
  {
    name: "Data Processing Agreement",
    type: "Compliance",
    date: "10 January 2026",
    size: "196 KB",
  },
  {
    name: "Website Development Scope — Interactive Package",
    type: "Project",
    date: "2 April 2024",
    size: "412 KB",
  },
  {
    name: "Data Protection Gap Analysis Report",
    type: "Compliance",
    date: "24 July 2026",
    size: "1.2 MB",
  },
  {
    name: "Prioritised Remediation Roadmap",
    type: "Compliance",
    date: "24 July 2026",
    size: "684 KB",
  },
  {
    name: "Hosting Service Level Agreement",
    type: "Contract",
    date: "14 March 2024",
    size: "156 KB",
  },
];

export default async function PortalDocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Documents"
        description="Contracts, reports and compliance documentation for your account."
      />

      <Panel padded={false}>
        <ul className="divide-y divide-line">
          {documents.map((doc) => (
            <li
              key={doc.name}
              className="flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-navy-600 dark:text-navy-300">
                  <DocumentIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {doc.type} · {doc.date} · {doc.size}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="size-4" />
                Download
              </Button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Document Retention">
        <p className="text-sm text-muted">
          Contracts and compliance reports are retained for the life of your
          account plus seven years, in line with our records retention schedule.
          Copies can be re-issued at any time through a support ticket.
        </p>
      </Panel>
    </div>
  );
}
