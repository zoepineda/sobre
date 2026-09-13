import { SelectItem } from "@/components/ui/select";
import { brandTint } from "@/lib/brandLogos";

// Envelope row for account-aware dropdowns: the background carries a faded
// wash of the home account's brand color, so it's obvious at a glance which
// account each envelope lives in. Highlight state still wins on hover.
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
    <SelectItem
      value={String(id)}
      style={home ? { background: brandTint(home.name, home.type) } : undefined}
      className="data-[highlighted]:!bg-accent"
    >
      {name}
    </SelectItem>
  );
}
