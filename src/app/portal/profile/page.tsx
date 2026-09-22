import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/portal-forms";
import { Panel, PortalHeading } from "@/components/portal-ui";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/billing";

export default async function PortalProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { createdAt: true },
  });

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Profile"
        description="Your account and billing contact details."
      />

      <Panel title="Account Details">
        <ProfileForm
          defaults={{
            name: user.name,
            company: user.company ?? "",
            phone: user.phone ?? "",
            address: user.address ?? "",
            city: user.city ?? "",
          }}
          email={user.email}
        />
      </Panel>

      <Panel title="Account Information">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Client ID
            </dt>
            <dd className="font-display mt-1.5 text-lg font-bold">
              {user.clientRef}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Client since
            </dt>
            <dd className="font-display mt-1.5 text-lg font-bold">
              {record ? formatDate(record.createdAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Account status
            </dt>
            <dd className="font-display mt-1.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Active
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
