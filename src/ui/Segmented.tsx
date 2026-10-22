import { useId } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * One segmented control for every binary or three-way choice on the page.
 * It is a radiogroup, so arrow keys move between choices and the selected
 * choice is never mistaken for a disabled button.
 */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className = ''
}: {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const id = useId();
  const move = (step: number) => {
    const i = options.findIndex((o) => o.value === value);
    const next = options[(i + step + options.length) % options.length]!;
    onChange(next.value);
    document.getElementById(`${id}-${next.value}`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`segmented ${className}`.trim()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          id={`${id}-${o.value}`}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}
