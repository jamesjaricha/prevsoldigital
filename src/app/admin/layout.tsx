import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Container } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Staff admin area.
 *
 * Guarded on the server by role. A CLIENT hitting any /admin route is sent to
 * their own portal rather than shown an error, so the area's existence is not
 * advertised to ordinary users.
 */

const tabs = [
  { label: "Overview", href: "/admin" },
  { label: "Enquiries", href: "/admin/enquiries" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Invoices", href: "/admin/invoices" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Services", href: "/admin/services" },
  { label: "Domains", href: "/admin/domains" },
  { label: "Tickets", href: "/admin/tickets" },
];

/**
 * These pages are per-user and must never be prerendered: they depend on the
 * session cookie, and at build time there is no request and no database.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "STAFF") redirect("/portal");

  const [newEnquiries, openTickets, pendingDomains] = await Promise.all([
    db.enquiry.count({ where: { handledAt: null } }),
    db.ticket.count({ where: { status: { notIn: ["CLOSED", "RESOLVED"] } } }),
    db.domain.count({ where: { status: "PENDING" } }),
  ]);

  const badges: Record<string, number> = {
    "/admin/enquiries": newEnquiries,
    "/admin/tickets": openTickets,
    "/admin/domains": pendingDomains,
  };

  return (
    <div className="min-h-full bg-surface">
      <div className="border-b border-line bg-navy-950 text-white">
        <Container className="py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-400">
                Staff area
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold uppercase tracking-tight">
                Administration
              </h1>
            </div>
            <p className="text-sm text-navy-300">
              Signed in as {user.name} · {user.role}
            </p>
          </div>

          <nav aria-label="Admin" className="mt-5">
            <ul className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-navy-200 transition hover:bg-white/10 hover:text-white"
                  >
                    {tab.label}
                    {badges[tab.href] > 0 && (
                      <span className="rounded-full bg-signal-600 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                        {badges[tab.href]}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <Container className="py-8">{children}</Container>
    </div>
  );
}
