"use client";

/**
 * Interactive shell around the portal: sidebar, mobile drawer and the
 * notification bell. The session itself is resolved on the server and passed
 * in, so this component holds no authority — only presentation.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import {
  BellIcon,
  CardIcon,
  CartIcon,
  CloseIcon,
  DocumentIcon,
  GlobeIcon,
  GridIcon,
  LayoutIcon,
  LockIcon,
  LogoutIcon,
  MenuIcon,
  ReceiptIcon,
  ServerIcon,
  TicketIcon,
  UserIcon,
} from "./icons";
import { Container, cx } from "./ui";

const sidebar = [
  { label: "Dashboard", href: "/portal", icon: GridIcon },
  { label: "My Services", href: "/portal/services", icon: LayoutIcon },
  { label: "My Domains", href: "/portal/domains", icon: GlobeIcon },
  { label: "My Hosting", href: "/portal/hosting", icon: ServerIcon },
  { label: "Orders", href: "/portal/orders", icon: CartIcon },
  { label: "Invoices", href: "/portal/invoices", icon: ReceiptIcon },
  { label: "Payments", href: "/portal/payments", icon: CardIcon },
  { label: "Support Tickets", href: "/portal/tickets", icon: TicketIcon },
  { label: "Notifications", href: "/portal/notifications", icon: BellIcon },
  { label: "Documents", href: "/portal/documents", icon: DocumentIcon },
  { label: "Profile", href: "/portal/profile", icon: UserIcon },
  { label: "Security", href: "/portal/security", icon: LockIcon },
];

export function PortalChrome({
  user,
  unread,
  children,
}: {
  user: { name: string; company: string | null; clientRef: string };
  unread: number;
  children: ReactNode;
}) {
  const pathname = usePathname();

  // The drawer records the route it was opened on, so navigating closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const mobileOpen = openedOn === pathname;

  return (
    <div className="bg-surface">
      <Container className="py-6 lg:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Client Portal
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold uppercase tracking-tight">
              {user.company || user.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal/notifications"
              className="relative rounded-lg border border-line bg-background p-2.5 transition hover:border-navy-300"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            >
              <BellIcon className="size-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-signal-600 text-[0.65rem] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpenedOn(pathname)}
              className="rounded-lg border border-line bg-background p-2.5 lg:hidden"
              aria-label="Open portal menu"
            >
              <MenuIcon className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block xl:col-span-2">
            <PortalNav pathname={pathname} />
          </aside>

          <div className="lg:col-span-9 xl:col-span-10">{children}</div>
        </div>
      </Container>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setOpenedOn(null)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-background p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-bold uppercase">Portal Menu</p>
              <button
                type="button"
                onClick={() => setOpenedOn(null)}
                className="rounded-lg p-2 hover:bg-surface"
                aria-label="Close menu"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <PortalNav pathname={pathname} />
          </div>
        </div>
      )}
    </div>
  );
}

function PortalNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Portal"
      className="rounded-2xl border border-line bg-background p-2"
    >
      <ul className="space-y-0.5">
        {sidebar.map((item) => {
          const active =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-navy-950 text-white" : "hover:bg-surface",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="pt-1">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-signal-600 transition hover:bg-signal-50 dark:hover:bg-signal-500/10"
            >
              <LogoutIcon className="size-4 shrink-0" />
              Logout
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
