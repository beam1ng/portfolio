import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../../components/admin/RequireAuth';
import { LoginPage } from './LoginPage';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProjectsPage } from './AdminProjectsPage';
import { AdminProjectFormPage } from './AdminProjectFormPage';
import { AdminTechnologiesPage } from './AdminTechnologiesPage';
import { AdminSkillsPage } from './AdminSkillsPage';
import { AdminProfilePage } from './AdminProfilePage';

/**
 * The entire admin surface, mounted under `/admin/*`. Loaded as a separate lazy
 * chunk so the public bundle stays lean — and so static (no-API) builds, which
 * never register this route, don't ship any admin/auth code.
 */
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/new" element={<AdminProjectFormPage />} />
          <Route path="projects/:id" element={<AdminProjectFormPage />} />
          <Route path="technologies" element={<AdminTechnologiesPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
