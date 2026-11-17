import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQSchema, FAQSchemaItem } from '../seo/FAQSchema';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  includeSchema?: boolean;
}

export function FAQ({ items, includeSchema = true }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schemaItems = useMemo<FAQSchemaItem[]>(
    () =>
      items.map((item, idx) => ({
        id: `faq-item-${idx + 1}`,
        question: item.question,
        answer: item.answer,
      })),
    [items]
  );

  return (
    <div className="space-y-4">
      {includeSchema && <FAQSchema items={schemaItems} />}
      {items.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex justify-between items-center p-5 bg-white hover:bg-slate-50 text-left transition-colors"
          >
            <span className="font-semibold text-slate-900">{item.question}</span>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-blue-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <div className="p-5 bg-slate-50 border-t border-slate-200 text-slate-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
