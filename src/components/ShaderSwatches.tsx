"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ColorPicker from "@/components/ColorPicker";
import {
  PLAIN,
  SHADER_DEFS,
  recolor,
  setCashColor,
  setShaderChoice,
  useCashColor,
  useCashPalette,
  useShaderChoice,
} from "@/lib/paperShaders";

const FILL = { position: "absolute" as const, inset: 0, width: "100%", height: "100%" };

// Palette button on the cash card → popover of live mini-previews.
// Shares the global shader store, so Setup's picker stays in sync.
export default function ShaderSwatches() {
  const choice = useShaderChoice();
  const color = useCashColor();
  const palette = useCashPalette();
  const [open, setOpen] = useState(false);

  const swatch = (
    name: string,
    body: React.ReactNode
  ) => (
    <button
      key={name}
      type="button"
      onClick={() => setShaderChoice(name)}
      className="group flex flex-col items-center gap-1"
    >
      <span
        className={`relative block h-10 w-16 overflow-hidden rounded-md ${
          choice === name
            ? "ring-2 ring-primary ring-offset-2"
            : "opacity-80 group-hover:opacity-100"
        }`}
        style={{ background: palette[1] }}
      >
        {body}
      </span>
      <span
        className={`text-[10px] ${
          choice === name ? "font-semibold text-foreground" : "text-muted-foreground"
        }`}
      >
        {name === PLAIN ? "Plain" : name.replace(" Gradient", "")}
      </span>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-hint="palette"
          aria-label="Change card background"
          className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-md bg-black/25 text-white/70 backdrop-blur-sm transition-colors hover:text-white"
        >
          <i className="lni lni-colour-palette-3 text-sm" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-3">
        <div className="flex gap-3">
          {/* live minis render only while the popover is open */}
          {open &&
            SHADER_DEFS.map((d) =>
              swatch(
                d.name,
                <d.Comp style={FILL} {...recolor(d.params, palette)} />
              )
            )}
          {open && swatch(PLAIN, null)}
        </div>
        <div className="mt-3 border-t pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">
              Card color
            </p>
            {color !== null && (
              <button
                type="button"
                onClick={() => setCashColor(null)}
                className="text-[10px] font-medium text-primary"
              >
                Reset to Pine
              </button>
            )}
          </div>
          <div className="flex items-start gap-4">
            <ColorPicker color={color} onChange={setCashColor} />
            <div className="space-y-1.5 pt-1">
              <span
                className="block h-10 w-14 rounded-md shadow-sm"
                style={{ background: palette[1] }}
              />
              <p className="text-center text-[10px] text-muted-foreground">
                {color === null ? "Pine" : palette[1]}
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
