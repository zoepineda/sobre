import BrandChip from "@/components/BrandChip";
import { SelectItem } from "@/components/ui/select";

// Envelope row for account-aware dropdowns: shows the home account's brand
// chip next to the name, so it's obvious at a glance which account each
// envelope lives in. Homeless envelopes keep an empty slot so names align.
export default function EnvelopeOption({
  id,
  name,
  home,
}: {
  id: number;
  name: string;
  home?: { name: string; type: string } | null;
}) {
  return (
    <SelectItem value={String(id)}>
      <span className="flex items-center gap-2">
        {home ? (
          <BrandChip name={home.name} type={home.type} />
        ) : (
          <span aria-hidden className="h-6 w-10 shrink-0" />
        )}
        {name}
      </span>
    </SelectItem>
  );
}
