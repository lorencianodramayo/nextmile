import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from './components/layout/AppLayout';
import PageSkeleton from './components/shared/PageSkeleton';

// Lazy load all pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TrucksPage = lazy(() => import('./pages/TrucksPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'glass-card border-slate-200/90 dark:border-slate-700/90',
            title: 'text-slate-900 dark:text-slate-100',
            description: 'text-slate-600 dark:text-slate-400',
          },
        }}
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={
            <Suspense fallback={<PageSkeleton />}>
              <DashboardPage />
            </Suspense>
          } />
          <Route path="/trips" element={
            <Suspense fallback={<PageSkeleton />}>
              <TripsPage />
            </Suspense>
          } />
          <Route path="/expenses" element={
            <Suspense fallback={<PageSkeleton />}>
              <ExpensesPage />
            </Suspense>
          } />
          <Route path="/reports" element={
            <Suspense fallback={<PageSkeleton />}>
              <ReportsPage />
            </Suspense>
          } />
          <Route path="/trucks" element={
            <Suspense fallback={<PageSkeleton />}>
              <TrucksPage />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
