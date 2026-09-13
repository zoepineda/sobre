import { getAccounts, getBills, getCategories, getGroups } from "@/lib/queries";
import {
  signOut,
  archiveBill,
  archiveCategory,
  archiveGroup,
  createAccount,
  createBill,
  createCategory,
  createGroup,
  unarchive,
} from "@/lib/actions";
import AddAccountForm from "@/components/AddAccountForm";
import AddDialog from "@/components/AddDialog";
import ArchiveDelete from "@/components/ArchiveDelete";
import SetupAccountList from "@/components/SetupAccountList";
import SetupTour from "@/components/SetupTour";
import ShaderPicker from "@/components/ShaderPicker";
import GroupAssign from "@/components/GroupAssign";
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

export const dynamic = "force-dynamic";

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const accounts = await getAccounts();
  const categories = await getCategories();
  const groups = await getGroups();
  const bills = await getBills(todayISO().slice(0, 7));
  const hiddenMoney = [
    ...(await getAccounts(true))
      .filter((a) => a.archived && a.balance !== 0)
      .map((a) => ({ kind: "account", id: a.id, name: a.name, balance: a.balance })),
    ...(await getCategories(true))
      .filter((c) => c.archived && c.balance !== 0)
      .map((c) => ({ kind: "envelope", id: c.id, name: c.name, balance: c.balance })),
  ];

  // pr-3 lines the + button's center up with the trash icons in the rows below
  const sectionHeader = (label: string, dialog: React.ReactNode) => (
    <div className="flex items-center justify-between pr-[7px]">
      <h2 className="text-sm font-semibold text-muted-foreground">{label}</h2>
      {dialog}
    </div>
  );

  return (
    <main className="p-4 lg:p-8 space-y-5">
      <div className="pt-3 lg:pt-0 flex items-center gap-2">
        <h1 className="text-xl font-bold">Setup</h1>
        <SetupTour />
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          That {error} still holds money — move its balance elsewhere (or pay
          off the card) before archiving, so nothing disappears from your
          totals.
        </p>
      )}

      {hiddenMoney.length > 0 && (
        <Card className="border-destructive/40 py-4 shadow-sm">
          <CardContent className="space-y-2 px-4">
            <p className="text-sm font-semibold text-destructive">
              Archived but still holding money
            </p>
            <p className="text-[11px] text-muted-foreground">
              These were archived while they still had a balance, so that money
              is hidden from your totals. Unarchive them, then move the money
              out before archiving again.
            </p>
            {hiddenMoney.map((h) => (
              <div
                key={`${h.kind}-${h.id}`}
                className="flex items-center justify-between"
              >
                <p className="text-sm">
                  {h.name}
                  <Badge variant="outline" className="ml-1.5 text-[11px]">
                    {h.kind}
                  </Badge>
                  <span className="ml-2 text-xs font-semibold">
                    {peso(h.balance)}
                  </span>
                </p>
                <form action={unarchive}>
                  <input type="hidden" name="kind" value={h.kind} />
                  <input type="hidden" name="id" value={h.id} />
                  <Button variant="link" size="sm" className="h-7 text-xs">
                    unarchive
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
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
                placeholder="e.g. Emergency Fund, Wants"
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
            <form action={createCategory} className="space-y-3">
              <Input
                name="name"
                placeholder="e.g. Travel fund, Friends"
                required
              />
              <Button type="submit" className="w-full">
                Add envelope
              </Button>
            </form>
          </AddDialog>
        )}
        {categories.length > 0 && (
          <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.name}
                    {c.is_system ? (
                      <Badge variant="outline" className="ml-1.5 text-[11px]">
                        built-in
                      </Badge>
                    ) : null}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {peso(c.balance)}
                    </span>
                  </p>
                  {c.payday_target > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {peso(c.payday_target)} /cutoff → {c.payday_account_name}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!c.is_system && (
                    <GroupAssign
                      categoryId={c.id}
                      groupId={c.group_id}
                      groups={groups.map((g) => ({ id: g.id, name: g.name }))}
                    />
                  )}
                  {!c.is_system && (
                    <ArchiveDelete action={archiveCategory} id={c.id} />
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section data-tour="bills" className="space-y-2">
        {sectionHeader(
          "Recurring bills",
          accounts.length === 0 ||
          categories.filter((c) => !c.is_system).length === 0 ? (
            <AddDialog title="Add recurring bill" trigger="Bill">
              <p className="text-sm text-muted-foreground">
                Bills need a home — add at least one account and one envelope
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
                        {a.name}
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
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Shows as a monthly checklist on Home — ticking logs the expense
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
              No recurring bills yet — add one to get a monthly tick-off
              checklist on Home.
            </p>
          </Card>
        )}
      </section>

      <section data-tour="appearance" className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Appearance
        </h2>
        <Card className="py-4 shadow-sm">
          <CardContent className="space-y-2 px-4">
            <p className="text-sm font-semibold">Card background</p>
            <ShaderPicker />
            <p className="text-[11px] text-muted-foreground">
              Animated backdrop for the total-cash card and your bank cards.
              Pick Plain to turn shaders off (easier on the battery).
            </p>
          </CardContent>
        </Card>
      </section>
      </div>

      <form action={signOut} className="pt-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Sign out
        </Button>
      </form>
    </main>
  );
}
