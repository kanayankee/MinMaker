'use client';

import { useState } from 'react';

type Props = {
  onClose: () => void;
  onCreate: (date: string, title: string) => void;
};

export function CreateProjectModal({ onClose, onCreate }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title.trim()) return;
    onCreate(date, title.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">新規プロジェクト</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="project-date" className="block text-sm font-medium mb-1.5">
              日付
            </label>
            <input
              id="project-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="project-title" className="block text-sm font-medium mb-1.5">
              タイトル
            </label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 通常練習、練習試合..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-surface-hover border border-border rounded-xl text-sm font-medium hover:bg-border transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              id="create-project-submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
