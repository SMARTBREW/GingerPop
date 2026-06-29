"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

interface ManagedAdmin {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export default function SuperAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const loadAdmins = () => {
    fetch("/api/super/admins")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/admin/dashboard");
          return;
        }
        setAdmins(data.admins ?? []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAdmins();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    const res = await fetch("/api/super/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      setForm({ name: "", email: "", password: "" });
      setMessage({ type: "success", text: "Administrator account created." });
      loadAdmins();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to create administrator." });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/super/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    loadAdmins();
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <Spinner label="Loading administrators..." />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <PageHeader
        title="Administrators"
        description="Provision and manage course administrator accounts."
        breadcrumbs={[
          { label: "Courses", href: "/admin/dashboard" },
          { label: "Administrators" },
        ]}
      />

      {message && (
        <div
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="mb-8">
        <CardHeader
          title="Create administrator"
          description="New accounts can create courses, manage content, and invite learners."
        />
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Smith"
            required
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@organization.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 6 characters"
            required
            minLength={6}
            className="sm:col-span-2 sm:max-w-sm"
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create administrator"}
            </Button>
          </div>
        </form>
      </Card>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Active accounts
        </h2>

        {admins.length === 0 ? (
          <EmptyState
            title="No administrators"
            description="Create the first administrator account to delegate course management."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={a.active ? "success" : "neutral"}>
                        {a.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={a.active ? "danger" : "secondary"}
                        size="sm"
                        onClick={() => toggleActive(a.id, a.active)}
                      >
                        {a.active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
