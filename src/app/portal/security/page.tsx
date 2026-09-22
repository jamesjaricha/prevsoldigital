import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { ChangePasswordForm } from "@/components/portal-forms";
import { Panel, PortalHeading } from "@/components/portal-ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/billing";

export default async function PortalSecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Real sessions, so the client can see where their account is signed in.
  const sessions = await db.session.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, userAgent: true, ip: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Security"
        description="Protect your account and review recent activity."
      />

      <Panel title="Change Password">
        <ChangePasswordForm />
      </Panel>

      <Panel title="Active Sessions" padded={false}>
        {sessions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No active sessions recorded.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {sessions.map((session, i) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="font-semibold">
                    {describeAgent(session.userAgent)}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Most recent
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {session.ip ?? "Unknown address"} ·{" "}
                    {formatDate(session.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="border-t border-line px-5 py-4 text-xs text-muted">
          Changing your password signs out every other device automatically.
        </p>
      </Panel>

      <Panel title="Security Recommendations">
        <ul className="space-y-3 text-sm">
          {[
            "Use a unique password for this portal — not one reused elsewhere.",
            "Review the sessions above and change your password if you see anything you do not recognise.",
            "Keep your billing contact email current, since it receives security alerts.",
            "Never share your password with anyone, including our staff. We will never ask for it.",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              {tip}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">
          Worried your account is compromised?{" "}
          <Link
            href="/support/new?department=technical"
            className="font-semibold text-signal-600 hover:underline"
          >
            Tell us immediately
          </Link>
          .
        </p>
      </Panel>
    </div>
  );
}

/** Turns a user-agent string into something a person can recognise. */
function describeAgent(agent: string | null) {
  if (!agent) return "Unknown device";
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /Chrome\//.test(agent)
      ? "Chrome"
      : /Safari\//.test(agent)
        ? "Safari"
        : /Firefox\//.test(agent)
          ? "Firefox"
          : "Browser";
  const os = /Windows/.test(agent)
    ? "Windows"
    : /Android/.test(agent)
      ? "Android"
      : /iPhone|iPad/.test(agent)
        ? "iOS"
        : /Mac OS/.test(agent)
          ? "macOS"
          : /Linux/.test(agent)
            ? "Linux"
            : "unknown OS";
  return `${browser} on ${os}`;
}
