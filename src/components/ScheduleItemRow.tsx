'use client';

import { useRef, useEffect } from 'react';
import { ScheduleItem } from '@/types';

type ComputedScheduleItem = ScheduleItem & {
  computedStartTime: string;
  computedEndTime: string;
};

type Props = {
  item: ComputedScheduleItem;
  onUpdate: (updates: Partial<ScheduleItem>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function ScheduleItemRow({ item, onUpdate, onDelete, onMoveUp, onMoveDown }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [item.text]);

  return (
    <div className="relative group bg-surface border border-border rounded-xl shadow-sm flex items-start p-3 gap-3 transition-colors hover:border-primary/50">
      {/* Move Buttons */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <button
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className={`p-1 rounded-md transition-colors ${
            onMoveUp
              ? 'text-muted hover:text-primary hover:bg-primary/10'
              : 'text-muted/30 cursor-not-allowed'
          }`}
          title="上に移動"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className={`p-1 rounded-md transition-colors ${
            onMoveDown
              ? 'text-muted hover:text-primary hover:bg-primary/10'
              : 'text-muted/30 cursor-not-allowed'
          }`}
          title="下に移動"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <textarea
          ref={textareaRef}
          value={item.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="メニュー内容を入力..."
          className="w-full bg-transparent resize-none overflow-hidden focus:outline-none placeholder-muted/50 font-medium"
          rows={1}
        />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-muted bg-surface-hover px-2 py-0.5 rounded-md border border-border/50">
            {item.computedStartTime}〜{item.computedEndTime}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              value={item.duration || ''}
              onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
              className="w-16 bg-surface-hover border border-border rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-muted font-medium">分</span>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="mt-1 text-muted hover:text-danger p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors md:opacity-0 md:group-hover:opacity-100"
        title="削除"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
