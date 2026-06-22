import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { isStatic } from './lib/apiClient';

// Markdown-rendering pages are code-split so react-markdown stays out of the
// landing bundle; they load on demand behind RootLayout's Suspense boundary.
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
);
const ResumePage = lazy(() => import('./pages/ResumePage').then((m) => ({ default: m.ResumePage })));

// Admin is a separate lazy chunk. In static builds `isStatic` is a compile-time
// constant, so this branch folds away and the admin chunk is never emitted.
const AdminApp = isStatic ? null : lazy(() => import('./pages/admin/AdminApp'));

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {AdminApp && (
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
      )}
    </Routes>
  );
}
