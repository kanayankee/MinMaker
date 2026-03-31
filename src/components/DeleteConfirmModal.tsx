'use client';

type Props = {
  projectTitle: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({ projectTitle, onClose, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-1">プランの削除</h2>
          <p className="text-sm text-muted">
            「{projectTitle}」を削除しますか？
            <br />
            この操作は取り消せません。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-surface-hover border border-border rounded-xl text-sm font-medium hover:bg-border transition-colors"
          >
            キャンセル
          </button>
          <button
            id="confirm-delete-button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:bg-danger-hover shadow-lg shadow-danger/25 transition-all"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
