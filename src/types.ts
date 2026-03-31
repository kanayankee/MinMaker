export type ScheduleItem = {
  id: string;
  text: string;       // メニュー内容（改行あり）
  duration: number;   // 所要時間（分）
};

export type Project = {
  id: string;
  date: string;        // 実施日 (YYYY-MM-DD)
  title: string;       // 「通常練習」「練習試合」などの任意タイトル
  startTime: string;   // 開始時刻 "HH:mm"
  items: ScheduleItem[];
  memo?: string;       // メモ内容
  includeMemo?: boolean; // 送信文に含めるか
  updatedAt: number;   // ソート用タイムスタンプ
};

export const LS_KEY = 'minmaker_projects';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function createDefaultProject(): Project {
  return {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    title: '',
    startTime: '09:00',
    items: [
      {
        id: generateId(),
        text: '',
        duration: 10,
      },
    ],
    updatedAt: Date.now(),
  };
}

export function createScheduleItem(): ScheduleItem {
  return {
    id: generateId(),
    text: '',
    duration: 10,
  };
}
