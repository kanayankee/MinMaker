'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Project } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { projects, isLoaded, createProject, deleteProject, duplicateProject } =
    useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const handleCreate = (date: string, title: string) => {
    const newProject = createProject(date, title);
    setShowCreateModal(false);
    router.push(`/editor/${newProject.id}`);
  };

  const handleEdit = (project: Project) => {
    router.push(`/editor/${project.id}`);
  };

  const handleDuplicate = (project: Project) => {
    const dup = duplicateProject(project);
    router.push(`/editor/${dup.id}`);
  };

  const handleDeleteConfirm = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">MinMaker</h1>
              <p className="text-xs text-muted -mt-0.5">タイムスケジュール作成</p>
            </div>
          </div>
          <button
            id="create-project-button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新規作成
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-primary/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">プランがありません</h2>
            <p className="text-muted text-sm mb-6 text-center">
              「新規作成」ボタンからタイムスケジュールを
              <br />
              作成してみましょう
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              プランを作成
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {deletingProject && (
        <DeleteConfirmModal
          projectTitle={`${deletingProject.date} ${deletingProject.title}`}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </main>
  );
}
