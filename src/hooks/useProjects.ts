'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project, LS_KEY, createDefaultProject, generateId } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // LS から読み込み
  useEffect(() => {
    try {
      const data = localStorage.getItem(LS_KEY);
      if (data) {
        queueMicrotask(() => setProjects(JSON.parse(data)));
      }
    } catch {
      console.error('Failed to load projects from LocalStorage');
    }
    queueMicrotask(() => setIsLoaded(true));
  }, []);

  // LS へ保存
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(projects));
    } catch {
      console.error('Failed to save projects to LocalStorage');
    }
  }, [projects, isLoaded]);

  // 新規作成
  const createProject = useCallback((date: string, title: string) => {
    const newProject = createDefaultProject();
    newProject.date = date;
    newProject.title = title;
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  // 更新
  const updateProject = useCallback((updated: Project) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === updated.id
          ? { ...updated, updatedAt: Date.now() }
          : p
      )
    );
  }, []);

  // 削除
  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 複製
  const duplicateProject = useCallback((source: Project) => {
    const newProject: Project = {
      ...source,
      id: generateId(),
      title: `${source.title}（コピー）`,
      date: new Date().toISOString().split('T')[0],
      items: source.items.map((item) => ({
        ...item,
        id: generateId(),
      })),
      updatedAt: Date.now(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  // プロジェクト取得
  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id) ?? null,
    [projects]
  );

  // updatedAt 降順ソート
  const sortedProjects = [...projects].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return {
    projects: sortedProjects,
    isLoaded,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    getProject,
  };
}
