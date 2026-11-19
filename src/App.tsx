import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  CheckSquare,
  ClipboardCheck,
  LayoutDashboard,
  Layers,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { ensureSeeded } from './db/seed';
import { useAppSettings } from './hooks/useAppSettings';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { DashboardView } from './features/dashboard/DashboardView';
import { CertificationsView } from './features/certifications/CertificationsView';
import { SyllabusView } from './features/syllabus/SyllabusView';
import { FlashcardsView } from './features/flashcards/FlashcardsView';
import { QuizzesView } from './features/quizzes/QuizzesView';
import { ExamsView } from './features/exams/ExamsView';
import { PlannerView } from './features/planner/PlannerView';
import { GlossaryView } from './features/glossary/GlossaryView';
import { AnalyticsView } from './features/progress/AnalyticsView';
import { ToolsView } from './features/settings/ToolsView';

type NavTab =
  | 'dashboard'
  | 'certifications'
  | 'syllabus'
  | 'flashcards'
  | 'quizzes'
  | 'exams'
  | 'planner'
  | 'glossary'
  | 'analytics'
  | 'tools';

export default function App() {
  const { t } = useTranslation();
  const { settings, setLanguage, setTheme, setActiveCertification } = useAppSettings();

  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [linkedChapterId, setLinkedChapterId] = useState<string | undefined>(undefined);

  useEffect(() => {
    ensureSeeded()
      .then(() => setReady(true))
      .catch((err) => {
        setInitError(err instanceof Error ? err.message : 'Database initialization failed');
      });
  }, []);

  // Keyboard shortcut Ctrl/Cmd + K for global search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#07111E] text-slate-900 dark:text-slate-100">
        <div className="max-w-md rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 p-6 space-y-2">
          <h1 className="text-base font-bold">{t('app.errorGeneric')}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">{initError}</p>
        </div>
      </div>
    );
  }

  if (!ready || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#07111E] text-slate-600 dark:text-slate-300 text-sm">
        {t('app.loading')}
      </div>
    );
  }

  const lang = settings.language;
  const isDark = settings.theme === 'dark';

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'certifications', label: t('nav.certifications'), icon: Award },
    { id: 'syllabus', label: t('nav.syllabus'), icon: BookOpen },
    { id: 'flashcards', label: t('nav.flashcards'), icon: Layers },
    { id: 'quizzes', label: t('nav.quizzes'), icon: CheckSquare },
    { id: 'exams', label: t('nav.exams'), icon: ClipboardCheck },
    { id: 'planner', label: t('nav.planner'), icon: Calendar },
    { id: 'glossary', label: t('nav.glossary'), icon: BookMarked },
    { id: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
    { id: 'tools', label: t('nav.tools'), icon: Settings },
  ];

  const handleNavigate = (tab: string) => {
    setLinkedChapterId(undefined);
    setActiveTab(tab as NavTab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#07111E] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-[#0B192C] text-slate-100 no-print">
        <div className="px-6 py-5 border-b border-slate-800/80">
          <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
            ISTQB Academy
          </span>
        </div>

        <nav aria-label="Navigation principale" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg">
            {(['fr', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => void setLanguage(code)}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                  lang === code ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? t('app.themeLight') : t('app.themeDark')}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Clean Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-4 sm:px-8 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#07111E]/95 backdrop-blur-sm no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="lg:hidden font-display text-base font-bold text-slate-900 dark:text-white whitespace-nowrap">
              ISTQB Academy
            </span>
            <span className="hidden lg:inline text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t('common.search')}</span>
            </button>

            <div className="lg:hidden flex items-center gap-1">
              <button
                type="button"
                onClick={() => void setLanguage(lang === 'fr' ? 'en' : 'fr')}
                className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase"
              >
                {lang}
              </button>
              <button
                type="button"
                onClick={() => void setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? t('app.themeLight') : t('app.themeDark')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <PWAInstallButton />
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/60" onClick={() => setMobileMenuOpen(false)}>
            <nav
              aria-label="Mobile navigation"
              className="w-72 h-full bg-[#0B192C] text-white p-4 space-y-1 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-800">
                <span className="font-display font-bold">ISTQB Academy</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label={t('app.close')}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                      active ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
              onNavigate={handleNavigate}
            />
          )}
          {activeTab === 'certifications' && (
            <CertificationsView
              lang={lang}
              activeCertificationId={settings.activeCertificationId}
              activeVersionId={settings.activeVersionId}
              onSelectActive={setActiveCertification}
              onNavigateSyllabus={() => handleNavigate('syllabus')}
            />
          )}
          {activeTab === 'syllabus' && (
            <SyllabusView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
              onNavigateFlashcards={(chId) => {
                setLinkedChapterId(chId);
                setActiveTab('flashcards');
              }}
              onNavigateQuizzes={(chId) => {
                setLinkedChapterId(chId);
                setActiveTab('quizzes');
              }}
            />
          )}
          {activeTab === 'flashcards' && (
            <FlashcardsView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
              initialChapterId={linkedChapterId}
            />
          )}
          {activeTab === 'quizzes' && (
            <QuizzesView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
              initialChapterId={linkedChapterId}
            />
          )}
          {activeTab === 'exams' && (
            <ExamsView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
            />
          )}
          {activeTab === 'planner' && (
            <PlannerView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
            />
          )}
          {activeTab === 'glossary' && (
            <GlossaryView
              lang={lang}
              onNavigateFlashcards={() => handleNavigate('flashcards')}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsView
              lang={lang}
              certificationId={settings.activeCertificationId}
              versionId={settings.activeVersionId}
            />
          )}
          {activeTab === 'tools' && <ToolsView lang={lang} />}
        </main>
      </div>

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
        onNavigate={handleNavigate}
      />
      <OfflineIndicator />
    </div>
  );
}
