import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlaceHit } from '../../data/places';

interface PlaceSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (hit: PlaceHit) => void;
  search: (query: string) => PlaceHit[];
  placeholder?: string;
  className?: string;
  inputMode?: 'text' | 'search';
}

export const PlaceSearchField: React.FC<PlaceSearchFieldProps> = ({
  value,
  onChange,
  onSelect,
  search,
  placeholder,
  className = 'w-full ui-field',
  inputMode = 'text',
}) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);

  const hits = useMemo(() => (open ? search(value) : []), [open, search, value]);

  const syncMenu = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuBox({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    setActive(0);
  }, [value, open]);

  useEffect(() => {
    if (!open) return;
    syncMenu();
    const onReposition = () => syncMenu();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, value, hits.length]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        const menu = document.getElementById(listId);
        if (menu?.contains(event.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [listId]);

  const pick = (hit: PlaceHit) => {
    onSelect(hit);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        inputMode={inputMode}
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        placeholder={placeholder}
        className={className}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!hits.length) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((index) => (index + 1) % hits.length);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => (index - 1 + hits.length) % hits.length);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            pick(hits[active]);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && hits.length > 0 && menuBox && createPortal(
        <ul
          id={listId}
          role="listbox"
          style={{ top: menuBox.top, left: menuBox.left, width: Math.max(menuBox.width, 300) }}
          className="fixed z-[80] max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {hits.map((hit, index) => (
            <li key={hit.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  index === active ? 'bg-sky-50 text-slate-900' : 'text-slate-800 hover:bg-slate-50'
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(hit)}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold leading-tight">{hit.title}</span>
                  <span className="mt-0.5 block truncate text-[12px] text-slate-500">{hit.subtitle}</span>
                </span>
                {hit.airport && (
                  <span className="shrink-0 font-mono text-[13px] font-bold tracking-wide text-sky-700">
                    {hit.airport}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
};
