"use client";

/**
 * CardSelectWithOther
 *
 * A single-select card grid where choosing the "other" option
 * reveals a free-text input below the grid.
 *
 * Usage:
 *   <CardSelectWithOther
 *     options={LEGAL_STRUCTURES}
 *     value={form.legal_structure}
 *     onChange={v => update("legal_structure", v)}
 *     otherValue={legalStructureOther}
 *     onOtherChange={setLegalStructureOther}
 *     otherPlaceholder="Ex : SAS, LLC, GIE..."
 *   />
 */

export interface CardOption {
  /** Stored value */
  v: string;
  /** Display label */
  l: string;
  /** Optional sub-description shown below the label */
  desc?: string;
}

interface CardSelectWithOtherProps {
  options: CardOption[];
  value: string;
  onChange: (value: string) => void;
  /** Current text in the "other" free-text input */
  otherValue: string;
  onOtherChange: (value: string) => void;
  /** Value that triggers the free-text input (default "other") */
  otherTrigger?: string;
  otherPlaceholder?: string;
  /** Tailwind grid class, e.g. "grid-cols-1 sm:grid-cols-2" */
  gridClass?: string;
}

export default function CardSelectWithOther({
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
  otherTrigger = "other",
  otherPlaceholder = "Précisez...",
  gridClass = "grid-cols-1 sm:grid-cols-2",
}: CardSelectWithOtherProps) {
  return (
    <div>
      <div className={`grid ${gridClass} gap-2.5`}>
        {options.map(opt => {
          const selected = value === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 w-full ${
                selected
                  ? "border-[#BC5A34] bg-[#BC5A34]/8 text-[#22201B]"
                  : "border-[#DADEE4] bg-white text-[#575249] hover:border-[#BC5A34]/40 hover:text-[#22201B]"
              }`}
            >
              <div className={`font-semibold text-sm mb-0.5 ${selected ? "text-[#22201B]" : ""}`}>
                {opt.l}
              </div>
              {opt.desc && (
                <div className="text-xs opacity-55 leading-snug">{opt.desc}</div>
              )}
            </button>
          );
        })}
      </div>

      {value === otherTrigger && (
        <input
          type="text"
          value={otherValue}
          onChange={e => onOtherChange(e.target.value)}
          className="form-input mt-3"
          placeholder={otherPlaceholder}
        />
      )}
    </div>
  );
}
