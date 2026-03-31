'use client';

import { use, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { Project, ScheduleItem, createScheduleItem } from '@/types';
import { ScheduleItemRow } from '@/components/ScheduleItemRow';

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getProject, updateProject, isLoaded } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const p = getProject(resolvedParams.id);
      if (p) {
        queueMicrotask(() => setProject(p));
      } else {
        router.push('/');
      }
    }
  }, [isLoaded, resolvedParams.id, getProject, router]);

  const handleUpdateProject = useCallback(
    (updates: Partial<Project>) => {
      if (!project) return;
      const newProject = { ...project, ...updates };
      setProject(newProject);
      updateProject(newProject);
    },
    [project, updateProject]
  );

  const handleUpdateItem = useCallback(
    (id: string, updates: Partial<ScheduleItem>) => {
      if (!project) return;
      const newItems = project.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      handleUpdateProject({ items: newItems });
    },
    [project, handleUpdateProject]
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      if (!project) return;
      handleUpdateProject({
        items: project.items.filter((item) => item.id !== id),
      });
    },
    [project, handleUpdateProject]
  );

  const handleAddItem = useCallback(() => {
    if (!project) return;
    handleUpdateProject({
      items: [...project.items, createScheduleItem()],
    });
  }, [project, handleUpdateProject]);

  const handleMoveItem = useCallback(
    (index: number, direction: number) => {
      if (!project) return;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= project.items.length) return;
      
      const newItems = [...project.items];
      const [movedItem] = newItems.splice(index, 1);
      newItems.splice(newIndex, 0, movedItem);
      
      handleUpdateProject({ items: newItems });
    },
    [project, handleUpdateProject]
  );

  const calculatedItems = useMemo(() => {
    if (!project) return [];
    let currentTime = project.startTime;
    return project.items.map((item) => {
      const itemStartTime = currentTime;
      currentTime = calculateEndTime(currentTime, item.duration);
      return {
        ...item,
        computedStartTime: itemStartTime,
        computedEndTime: currentTime,
      };
    });
  }, [project]);

  const exportText = useMemo(() => {
    if (!project) return '';

    const d = new Date(project.date);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const titleHeader = project.title ? ` ${project.title}` : '';
    let text = `${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})${titleHeader}`;

    if (project.includeMemo && project.memo) {
      text += `\n${project.memo}`;
    }

    const scheduleText = calculatedItems
      .map((item) => {
        let allWrapLines: string[] = [];
        const manualLines = item.text.split('\n');
        for (const mLine of manualLines) {
          if (mLine.length === 0) {
            allWrapLines.push('');
            continue;
          }
          const width = project.wrapWidth || 10;
          for (let i = 0; i < mLine.length; i += width) {
            allWrapLines.push(mLine.slice(i, i + width));
          }
        }
        if (allWrapLines.length === 0) allWrapLines = [''];
        
        const firstLine = `${item.computedStartTime} ${allWrapLines[0] || ''}`;
        const restLines = allWrapLines.slice(1).map((line) => `　　　 ${line}`);
        return [firstLine, ...restLines].join('\n');
      })
      .join('\n');
      
    text += `\n${scheduleText}`;
    return text;
  }, [project, calculatedItems]);

  const handleCopy = useCallback(() => {
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      textArea.remove();
    };

    const successAction = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(exportText).then(successAction).catch(() => {
        fallbackCopy(exportText);
        successAction();
      });
    } else {
      fallbackCopy(exportText);
      successAction();
    }
  }, [exportText]);

  if (!isLoaded || !project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-[50dvh] md:h-dvh md:overflow-y-auto border-r border-border">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={project.title}
                onChange={(e) => handleUpdateProject({ title: e.target.value })}
                className="w-full bg-transparent font-bold text-lg focus:outline-none placeholder-muted"
                placeholder="タイトルを入力"
              />
            </div>
            <div className="text-sm font-medium text-muted">
              <input
                type="date"
                value={project.date}
                onChange={(e) => handleUpdateProject({ date: e.target.value })}
                className="bg-surface-hover border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-muted whitespace-nowrap">開始時刻</label>
            <input
              type="time"
              value={project.startTime}
              onChange={(e) => handleUpdateProject({ startTime: e.target.value })}
              className="bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </header>

        {/* Schedule Items */}
        <div className="flex-1 p-4 lg:p-6 pb-24">
          <div className="mb-6 bg-surface border border-border rounded-xl p-3 shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-muted flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                メモ
              </label>
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.includeMemo || false}
                  onChange={(e) => handleUpdateProject({ includeMemo: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                />
                送信文に含める
              </label>
            </div>
            <textarea
              value={project.memo || ''}
              onChange={(e) => {
                handleUpdateProject({ memo: e.target.value });
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="メモや注意事項を入力..."
              className="w-full bg-transparent resize-none overflow-hidden focus:outline-none placeholder-muted/50 text-sm font-medium"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-3">
            {calculatedItems.map((item, index) => (
              <ScheduleItemRow
                key={item.id}
                item={item}
                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                onDelete={() => handleDeleteItem(item.id)}
                onMoveUp={index > 0 ? () => handleMoveItem(index, -1) : undefined}
                onMoveDown={index < calculatedItems.length - 1 ? () => handleMoveItem(index, 1) : undefined}
              />
            ))}
          </div>

          <button
            onClick={handleAddItem}
            className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl text-muted font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            追加
          </button>
        </div>
      </div>

      {/* Export Preview Area */}
      <div className="w-full md:w-80 lg:w-96 bg-surface border-t md:border-t-0 md:border-l border-border h-[50dvh] md:h-dvh flex flex-col">
        <div className="p-4 border-b border-border flex flex-col gap-3 sticky top-0 bg-surface z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              プレビュー
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-accent/10 border border-accent/20 text-accent'
                    : 'bg-primary border border-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    コピー完了
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </>
                )}
              </button>
              <a
                href={`https://line.me/R/msg/text/?${encodeURIComponent(exportText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-[#06C755] border border-[#06C755] text-white hover:bg-[#05b84d] shadow-md shadow-[#06C755]/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
                LINE
              </a>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-surface-hover rounded-xl p-2 px-3 border border-border">
            <span className="text-sm font-bold text-muted">自動改行の文字数</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUpdateProject({ wrapWidth: Math.max(5, (project.wrapWidth || 10) - 1) })}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-primary/30 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <span className="w-6 text-center font-bold text-foreground">
                {project.wrapWidth ?? 10}
              </span>
              <button
                onClick={() => handleUpdateProject({ wrapWidth: Math.min(40, (project.wrapWidth || 10) + 1) })}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-primary/30 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-[#1e1e1e] m-4 rounded-xl shadow-inner border border-gray-800">
          <pre className="font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
            {exportText || <span className="text-gray-600 italic">内容がありません</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
