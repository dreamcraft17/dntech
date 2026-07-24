'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import type { ProductFaqItem } from '@/types';

interface FaqEditorProps {
  items: ProductFaqItem[];
  onChange: (items: ProductFaqItem[]) => void;
}

export function FaqEditor({ items, onChange }: FaqEditorProps) {
  function update(index: number, patch: Partial<ProductFaqItem>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  }

  function add() {
    onChange([...items, { question: '', answer: '' }]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">FAQ {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            label="Pertanyaan"
            value={item.question}
            onChange={(e) => update(i, { question: e.target.value })}
            placeholder="Apakah ada trial gratis?"
          />
          <Textarea
            label="Jawaban"
            rows={3}
            value={item.answer}
            onChange={(e) => update(i, { answer: e.target.value })}
            placeholder="Ya, tersedia trial 14 hari tanpa kartu kredit."
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-900 hover:text-blue-900"
      >
        <Plus className="h-4 w-4" /> Tambah FAQ
      </button>
    </div>
  );
}
