import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQSchema, FAQSchemaItem } from '../seo/FAQSchema';
import { FAQ_ITEMS } from '../FAQ';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  items?: FAQItem[];
  includeSchema?: boolean;
  defaultOpenIndex?: number | null;
  className?: string;
}

export const DEFAULT_UI_FAQ_ITEMS: FAQItem[] = FAQ_ITEMS.map((item) => ({
  question: item.question,
  answer: item.answer,
  category: item.categoryLabel,
}));

export function FAQ({
  items = DEFAULT_UI_FAQ_ITEMS,
  includeSchema = true,
  defaultOpenIndex = 0,
  className = '',
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const schemaItems = useMemo<FAQSchemaItem[]>(
    () =>
      items.map((item, idx) => ({
        id: `faq-item-${idx + 1}`,
        category: item.category,
        question: item.question,
        answer: item.answer,
      })),
    [items]
  );

  return (
    <div className={`space-y-3.5 ${className}`}>
      {includeSchema && <FAQSchema items={schemaItems} />}
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `ui-faq-panel-${index}`;
        const triggerId = `ui-faq-trigger-${index}`;

        return (
          <div
            key={index}
            className={`border rounded-xl overflow-hidden transition-all duration-200 ${
              isOpen
                ? 'border-amber-500/40 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center gap-4 p-5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
              >
                <div>
                  {item.category && (
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                      {item.category}
                    </span>
                  )}
                  <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-snug">
                    {item.question}
                  </span>
                </div>
                <span
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'rotate-180 border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
            </h3>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="overflow-hidden transition-all duration-200"
              >
                <div className="p-5 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FAQ;
