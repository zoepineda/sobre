import PageReveal from "@/components/motion/PageReveal";
import Link from "next/link";
import { getAccounts, getBills, getCategories, getGroups } from "@/lib/queries";
import {
  signOut,
  archiveBill,
  archiveGroup,
  createBill,
  createGroup,
  unarchive,
} from "@/lib/actions";
import AddAccountForm from "@/components/AddAccountForm";
import AddDialog from "@/components/AddDialog";
import AddEnvelopeForm from "@/components/AddEnvelopeForm";
import ArchiveDelete from "@/components/ArchiveDelete";
import BrandChip from "@/components/BrandChip";
import ConfettiPref from "@/components/ConfettiPref";
import EnvelopeOption from "@/components/EnvelopeOption";
import EnvelopeList from "@/components/EnvelopeList";
import SetupAccountList from "@/components/SetupAccountList";
import SetupTour from "@/components/SetupTour";
import TutorialVideo from "@/components/TutorialVideo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { peso, todayISO } from "@/lib/format";
import { getSessionUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [user, accounts, categories, groups, bills, allAccounts, allCategories] =
    await Promise.all([
      getSessionUser(),
      getAccounts(),
      getCategories(),
      getGroups(),
      getBills(todayISO().slice(0, 7)),
      getAccounts(true),
      getCategories(true),
    ]);
  const archived = [
    ...allAccounts
      .filter((a) => a.archived)
      .map((a) => ({ kind: "account", id: a.id, name: a.name, balance: a.balance })),
    ...allCategories
      .filter((c) => c.archived)
      .map((c) => ({ kind: "envelope", id: c.id, name: c.name, balance: c.balance })),
  ];
  const holdsMoney = archived.some((h) => h.balance !== 0);

  // pr-3 lines the + button's center up with the trash icons in the rows below
  const sectionHeader = (label: string, dialog: React.ReactNode) => (
    <div className="flex items-center justify-between pr-[7px]">
      <h2 className="text-sm font-semibold text-muted-foreground">{label}</h2>
      {dialog}
    </div>
  );

  return (
    <main className="p-4 lg:p-8">
      <PageReveal className="space-y-5">
      <div className="pt-3 lg:pt-0 flex items-center gap-2">
        <h1 className="text-xl font-bold">Setup</h1>
        <SetupTour userId={user?.id} />
        <TutorialVideo />
      </div>

      {error === "account-in-use" ? (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          Envelopes or bills still use that account as their payday home.
          Point them somewhere else (tap the envelope to edit) before
          archiving it.
        </p>
      ) : error ? (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          That {error} still holds money. Move its balance elsewhere (or pay
          off the card) before archiving, so nothing disappears from your
          totals.
        </p>
      ) : null}

      {archived.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-xs font-semibold text-muted-foreground">
            <span className="mr-1 inline-block transition-transform group-open:rotate-90">
              ›
            </span>
            Archived ({archived.length})
            {holdsMoney && (
              <span className="ml-2 font-normal text-destructive">
                some still hold money
              </span>
            )}
          </summary>
          <Card className="mt-2 gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {archived.map((h) => (
              <div
                key={`${h.kind}-${h.id}`}
                className="flex items-center justify-between px-4 py-2"
              >
                <p className="text-sm">
                  {h.name}
                  <Badge variant="outline" className="ml-1.5 text-[10px]">
                    {h.kind}
                  </Badge>
                  {h.balance !== 0 && (
                    <span className="ml-2 text-xs font-semibold text-destructive">
                      holds {peso(h.balance)}
                    </span>
                  )}
                </p>
                <form action={unarchive}>
                  <input type="hidden" name="kind" value={h.kind} />
                  <input type="hidden" name="id" value={h.id} />
                  <Button variant="secondary" size="xs">
                    Unarchive
                  </Button>
                </form>
              </div>
            ))}
          </Card>
        </details>
      )}

      <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
      <section data-tour="accounts" className="space-y-2">
        {sectionHeader(
          "Accounts",
          <AddDialog title="Add account" trigger="Account">
            <AddAccountForm />
          </AddDialog>
        )}
        {accounts.length > 0 && (
          <SetupAccountList
            accounts={accounts.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              balance: a.balance,
            }))}
          />
        )}
      </section>

      <section data-tour="groups" className="space-y-2">
        {sectionHeader(
          "Envelope groups",
          <AddDialog title="Add envelope group" trigger="Group">
            <form action={createGroup} className="space-y-3">
              <Input
                name="name"
                placeholder="e.g. Savings, Wants, Needs"
                required
              />
              <Button type="submit" className="w-full">
                Add group
              </Button>
            </form>
          </AddDialog>
        )}
        {groups.length > 0 && (
          <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {groups.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <p className="text-sm font-medium">
                  {g.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {peso(g.balance)}
                  </span>
                </p>
                <ArchiveDelete action={archiveGroup} id={g.id} />
              </div>
            ))}
          </Card>
        )}
      </section>

      <section data-tour="envelopes" className="space-y-2">
        {sectionHeader(
          "Envelopes",
          <AddDialog title="Add envelope" trigger="Envelope">
            <AddEnvelopeForm
              groups={groups.map((g) => ({ id: g.id, name: g.name }))}
              accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
            />
          </AddDialog>
        )}
        <EnvelopeList
          envelopes={categories.map((c) => ({
            id: c.id,
            name: c.name,
            is_system: c.is_system,
            group_id: c.group_id,
            payday_target: c.payday_target,
            payday_account_id: c.payday_account_id,
            payday_account_name: c.payday_account_name,
            balance: c.balance,
          }))}
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        />
        <Link
          href="/starting-balances"
          className="block text-center text-xs font-medium text-primary"
        >
          Set starting balances →
        </Link>
      </section>

      <section data-tour="bills" className="space-y-2">
        {sectionHeader(
          "Recurring bills",
          accounts.length === 0 ||
          categories.filter((c) => !c.is_system).length === 0 ? (
            <AddDialog title="Add recurring bill" trigger="Bill">
              <p className="text-sm text-muted-foreground">
                Bills need a home. Add at least one account and one envelope
                first, then come back here.
              </p>
            </AddDialog>
          ) : (
          <AddDialog title="Add recurring bill" trigger="Bill">
            <form action={createBill} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  name="name"
                  placeholder="e.g. Meralco"
                  required
                  className="flex-[2]"
                />
                <Input
                  name="amount"
                  inputMode="decimal"
                  placeholder="₱ / month"
                  required
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Select name="account_id" defaultValue={String(accounts[0]?.id)}>
                  <SelectTrigger aria-label="Paid from account" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        <span className="flex items-center gap-2">
                          <BrandChip name={a.name} type={a.type} />
                          {a.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  name="category_id"
                  defaultValue={String(
                    categories.filter((c) => !c.is_system)[0]?.id
                  )}
                >
                  <SelectTrigger aria-label="Envelope" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => !c.is_system)
                      .map((c) => {
                        const home = accounts.find(
                          (a) => a.id === c.payday_account_id
                        );
                        return (
                          <EnvelopeOption
                            key={c.id}
                            id={c.id}
                            name={c.name}
                            home={
                              home
                                ? { name: home.name, type: home.type }
                                : null
                            }
                          />
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Shows as a monthly checklist on Home. Ticking logs the expense
                from the chosen account &amp; envelope.
              </p>
              <Button type="submit" className="w-full">
                Add bill
              </Button>
            </form>
          </AddDialog>
          )
        )}
        {bills.length > 0 ? (
          <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {bills.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">
                    {b.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {peso(b.expected_amount)}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {b.account_name} · {b.category_name}
                  </p>
                </div>
                <ArchiveDelete action={archiveBill} id={b.id} />
              </div>
            ))}
          </Card>
        ) : (
          <Card className="py-5 shadow-sm">
            <p className="px-4 text-center text-sm text-muted-foreground">
              No recurring bills yet. Add one to get a monthly tick-off
              checklist on Home.
            </p>
          </Card>
        )}
      </section>

      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Preferences
        </h2>
        <Card className="py-3 shadow-sm">
          <CardContent className="px-4">
            <ConfettiPref userId={user?.id} />
          </CardContent>
        </Card>
      </section>

      {user && (
        <Card className="py-3 shadow-sm">
          <CardContent className="flex items-center gap-3 px-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 flex-1">
              {user.name && (
                <span className="block truncate text-sm font-semibold">
                  {user.name}
                </span>
              )}
              <span className="block truncate text-[11px] text-muted-foreground">
                {user.email}
              </span>
            </span>
            <form action={signOut}>
              <Button variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </PageReveal>
    </main>
  );
}
