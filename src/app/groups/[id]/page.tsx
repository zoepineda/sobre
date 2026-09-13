import Link from "next/link";
import { getCategories, getGroupById, getGroupOutflows } from "@/lib/queries";
import { peso, prettyDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GroupDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroupById(Number(id));

  if (!group) {
    return (
      <main className="p-5 pt-14 text-center text-muted-foreground">
        Group not found.{" "}
        <Link href="/" className="text-primary underline">
          Back home
        </Link>
      </main>
    );
  }

  const envelopes = (await getCategories()).filter((c) => c.group_id === group.id);
  const total = envelopes.reduce((s, c) => s + c.balance, 0);
  const outflows = await getGroupOutflows(group.id, 100);

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-2xl space-y-4">
      <header className="pt-3">
        <Link href="/" className="text-xs text-primary">
          ← Home
        </Link>
        <h1 className="text-xl font-bold">{group.name}</h1>
      </header>

      <section className="rounded-2xl bg-pine p-5 text-white shadow-sm">
        <p className="text-xs text-white/70">Group balance</p>
        <p className="text-3xl font-bold">{peso(total)}</p>
        <div className="mt-3 space-y-1">
          {envelopes.map((c) => (
            <div key={c.id} className="flex justify-between text-xs text-white/80">
              <span>{c.name}</span>
              <span>{peso(c.balance)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Withdrawal history
        </h2>
        {outflows.length === 0 ? (
          <p className="rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground shadow-sm">
            Nothing has left this group yet.
          </p>
        ) : (
          <div className="rounded-2xl bg-card shadow-sm divide-y divide-border/60">
            {outflows.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{t.note || t.category_names}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {prettyDate(t.date)} ·{" "}
                    {t.type !== "expense" && t.type !== "income"
                      ? `${t.type.replace("_", " ")} · `
                      : ""}
                    {t.category_names}
                  </p>
                </div>
                <p className="ml-3 shrink-0 text-sm font-semibold text-destructive">{peso(t.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
