import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export type FilterGroup = {
  title: string;
  options: string[];
};

export function FilterSidebar({
  groups,
  rangeLabel,
  rangeMax = 100,
  rangePrefix = "$",
}: {
  groups: FilterGroup[];
  rangeLabel: string;
  rangeMax?: number;
  rangePrefix?: string;
}) {
  const [range, setRange] = useState<[number, number]>([0, rangeMax]);
  return (
    <aside className="sticky top-24 hidden h-fit w-64 shrink-0 rounded-2xl border bg-card p-5 lg:block">
      <h3 className="text-sm font-semibold">Filters</h3>
      <div className="mt-5 space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </div>
            <ul className="space-y-2">
              {g.options.map((o) => (
                <li key={o} className="flex items-center gap-2">
                  <Checkbox id={`${g.title}-${o}`} />
                  <label htmlFor={`${g.title}-${o}`} className="text-sm">
                    {o}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {rangeLabel}
          </div>
          <Slider
            value={range}
            onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
            max={rangeMax}
            step={1}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{rangePrefix}{range[0]}</span>
            <span>{rangePrefix}{range[1]}{range[1] === rangeMax ? "+" : ""}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
