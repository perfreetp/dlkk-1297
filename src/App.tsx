import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { RevenuePage } from './pages/Revenue/RevenuePage';
import { ExperimentsPage } from './pages/Experiments/ExperimentsPage';
import { ReviewsPage } from './pages/Reviews/ReviewsPage';
import { GroupsPage } from './pages/Groups/GroupsPage';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/reviews/:id" element={<ReviewsPage />} />
          <Route path="/reviews/new" element={<ReviewsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupsPage />} />
        </Routes>
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
