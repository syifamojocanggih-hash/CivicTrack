import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatStrip } from './components/StatStrip';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CategoriesSection } from './components/CategoriesSection';
import { RecentProjectsSection } from './components/RecentProjectsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AIRouteModal } from './components/AIRouteModal';
import { OpenDataModal } from './components/OpenDataModal';
import { DashboardMain } from './components/dashboard/DashboardMain';
import { NearbyMapModal } from './components/NearbyMapModal';
import { PublicMapExplorer } from './components/PublicMapExplorer';
import { apiService } from './services/api';

import {
  STATS_DATA,
  INITIAL_PROJECTS,
  CATEGORIES_DATA,
  FEATURES_DATA,
  HOW_IT_WORKS_DATA,
} from './data/mockData';
import type { ProyekItem, ProyekKategori, UserProfile, UserRole, StatSummary, CurrentView } from './types';

export function App() {
  // Helper to determine initial view based on browser path/hash
  const getInitialView = (): CurrentView => {
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/login' || hash === '#login' || hash === '#/login') return 'login';
    if (path === '/register' || hash === '#register' || hash === '#/register') return 'register';
    if (path === '/dashboard' || hash === '#dashboard' || hash === '#/dashboard') return 'dashboard';
    if (path === '/map' || path === '/peta' || hash === '#map' || hash === '#/map') return 'map-explorer';
    return 'landing';
  };

  // State
  const [projects, setProjects] = useState<ProyekItem[]>(INITIAL_PROJECTS);
  const [stats, setStats] = useState<StatSummary>(STATS_DATA);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | null>(null);
  const [activeNav, setActiveNav] = useState<string>('peta');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>(getInitialView);
  const [authNotice, setAuthNotice] = useState<string>('');
  const [postLoginRedirect, setPostLoginRedirect] = useState<'dashboard' | 'map-explorer' | null>(null);

  // Sync projects and stats from backend on mount, plus restore database user session
  useEffect(() => {
    // 0. Check real authenticated user session from database
    const token = localStorage.getItem('civictrack_token');
    if (token) {
      apiService.getCurrentUser().then((user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          localStorage.removeItem('civictrack_token');
        }
      }).catch(() => {
        localStorage.removeItem('civictrack_token');
      });
    }

    // 1. Fetch live projects from backend
    apiService.getProjects().then((res) => {
      if (res.isFromBackend && res.projects.length > 0) {
        const existingIds = new Set(res.projects.map((p) => p.id));
        const merged = [...res.projects, ...INITIAL_PROJECTS.filter((p) => !existingIds.has(p.id))];
        setProjects(merged);
      }
    });

    // 2. Fetch live stats from backend
    apiService.getStats().then((resStats) => {
      setStats(resStats);
    });
  }, []);

  // Modal States
  const [selectedProject, setSelectedProject] = useState<ProyekItem | null>(null);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState<boolean>(false);
  const [aiRouteModal, setAIRouteModal] = useState<{
    isOpen: boolean;
    projectName: string;
    project?: ProyekItem | null;
  }>({
    isOpen: false,
    projectName: '',
    project: null,
  });
  const [isOpenDataModalOpen, setIsOpenDataModalOpen] = useState<boolean>(false);

  const handleOpenAIRoute = (name: string, proj?: ProyekItem | null) => {
    const matchedProject = proj || projects.find((p) => p.nama_proyek === name) || null;
    setAIRouteModal({
      isOpen: true,
      projectName: name,
      project: matchedProject,
    });
  };

  // Real-time synchronization callbacks for created/updated projects
  const handleProjectCreated = (newProject: ProyekItem) => {
    setProjects((prev) => {
      if (prev.some((p) => p.id === newProject.id)) return prev;
      return [newProject, ...prev];
    });
    apiService.getStats().then((resStats) => setStats(resStats)).catch(() => {});
  };

  const handleProjectUpdated = (updatedProject: ProyekItem) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? { ...p, ...updatedProject } : p))
    );
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject((prev) => (prev ? { ...prev, ...updatedProject } : null));
    }
    apiService.getStats().then((resStats) => setStats(resStats)).catch(() => {});
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category filter
      if (selectedCategory && p.kategori !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.nama_proyek.toLowerCase().includes(q);
        const matchDesc = p.deskripsi.toLowerCase().includes(q);
        const matchLoc = (p.nama_wilayah || '').toLowerCase().includes(q);
        const matchCategory = p.kategori.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLoc && !matchCategory) {
          return false;
        }
      }
      return true;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Handlers
  const handleSearchSubmit = (q: string) => {
    setSearchQuery(q);
    const recentElem = document.querySelector('#recent-projects');
    if (recentElem) {
      recentElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectChip = (chip: string) => {
    let catMatch: ProyekKategori | null = null;
    if (chip.toLowerCase().includes('jalan') || chip.toLowerCase().includes('jembatan')) {
      catMatch = 'jalan';
    } else if (chip.toLowerCase().includes('taman')) {
      catMatch = 'taman';
    } else if (chip.toLowerCase().includes('drainase')) {
      catMatch = 'drainase';
    } else if (chip.toLowerCase().includes('fasilitas')) {
      catMatch = 'fasilitas';
    }

    if (catMatch) {
      setSelectedCategory(catMatch);
    }
    setSearchQuery(chip);
    const recentElem = document.querySelector('#recent-projects');
    if (recentElem) {
      recentElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToView = (view: CurrentView) => {
    setCurrentView(view);
    const pathMap: Record<CurrentView, string> = {
      landing: '/',
      dashboard: '/dashboard',
      'map-explorer': '/map',
      login: '/login',
      register: '/register',
    };
    const target = pathMap[view] || '/';
    if (typeof window !== 'undefined' && window.location.pathname !== target && window.location.pathname !== target + '/') {
      window.history.pushState({ view }, '', target);
    }
  };

  // Synchronize browser history (back/forward buttons) with CurrentView
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/login' || hash === '#login' || hash === '#/login') {
        setCurrentView('login');
      } else if (path === '/register' || hash === '#register' || hash === '#/register') {
        setCurrentView('register');
      } else if (path === '/dashboard' || hash === '#dashboard' || hash === '#/dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/map' || path === '/peta' || hash === '#map' || hash === '#/map') {
        setCurrentView('map-explorer');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    navigateToView(mode);
  };

  const handleCekDisekitarAction = () => {
    navigateToView('map-explorer');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (postLoginRedirect === 'map-explorer') {
      navigateToView('map-explorer');
      setPostLoginRedirect(null);
    } else {
      navigateToView('dashboard');
    }
    setAuthNotice('');
  };

  const handleOpenDashboard = () => {
    if (!currentUser) {
      setPostLoginRedirect('dashboard');
      setAuthNotice('Silakan masuk ke akun Anda untuk mengakses Dashboard.');
      navigateToView('login');
      return;
    }
    navigateToView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('civictrack_token');
    setCurrentUser(null);
    navigateToView('landing');
    setPostLoginRedirect(null);
    setAuthNotice('');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole,
      });
    }
  };

  const handleOpenFeature = (featureId: string) => {
    if (featureId === 'ai') {
      setAIRouteModal({ isOpen: true, projectName: 'Pelebaran Jalan Utama Kota' });
    } else if (featureId === 'open') {
      setIsOpenDataModalOpen(true);
    } else if (featureId === 'map') {
      handleCekDisekitarAction();
    } else if (featureId === 'report' || featureId === 'progress') {
      if (projects.length > 0) {
        setSelectedProject(projects[0]);
      }
    } else if (featureId === 'notif') {
      if (!currentUser) {
        handleOpenAuth('register');
      } else {
        alert(`Notifikasi pembaruan aktif untuk akun ${currentUser.nama}!`);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Inter'] text-[#212529]">
      {/* ── CONDITIONAL RENDERING: LOGIN/REGISTER PAGE vs MAP EXPLORER vs DASHBOARD vs LANDING PAGE ── */}
      {currentView === 'login' || currentView === 'register' ? (
        <LoginPage
          initialMode={currentView === 'register' ? 'register' : 'login'}
          notice={authNotice}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => {
            setAuthNotice('');
            navigateToView('landing');
          }}
        />
      ) : currentView === 'map-explorer' ? (
        <PublicMapExplorer
          currentUser={currentUser}
          projects={projects}
          onBackToLanding={() => navigateToView('landing')}
          onOpenDashboard={() => navigateToView('dashboard')}
          onOpenProjectDetail={(proj) => setSelectedProject(proj)}
          onOpenAIRoute={(name) => handleOpenAIRoute(name)}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
        />
      ) : currentView === 'dashboard' && currentUser ? (
        <DashboardMain
          currentUser={currentUser}
          projects={projects}
          onOpenMapExplorer={() => navigateToView('map-explorer')}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          onOpenProjectDetail={(proj) => setSelectedProject(proj)}
          onOpenAIRoute={(name, proj) => {
            handleOpenAIRoute(name, proj);
          }}
          onOpenOpenDataModal={() => setIsOpenDataModalOpen(true)}
          onProjectCreated={handleProjectCreated}
          onProjectUpdated={handleProjectUpdated}
        />
      ) : (
        <>
          {/* ── NAVBAR ── */}
          <Navbar
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            currentView={currentView}
            onNavigateView={(view) => navigateToView(view)}
            onOpenOpenData={() => setIsOpenDataModalOpen(true)}
            onSelectProjectNotification={(proyekId) => {
              const proj = projects.find((p) => p.id === proyekId);
              if (proj) setSelectedProject(proj);
            }}
          />

          {/* ── HERO ── */}
          <HeroSection
            onOpenNearbyMap={handleCekDisekitarAction}
            onOpenDashboard={handleOpenDashboard}
            onOpenAuth={(mode = 'login') => handleOpenAuth(mode)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onSelectChip={handleSelectChip}
            onSelectProject={(proj) => setSelectedProject(proj)}
            projects={projects}
          />

          {/* ── STAT STRIP ── */}
          <StatStrip stats={stats} />

          {/* ── FEATURES ── */}
          <FeaturesSection
            features={FEATURES_DATA}
            onOpenFeature={handleOpenFeature}
          />

          {/* ── HOW IT WORKS ── */}
          <HowItWorksSection steps={HOW_IT_WORKS_DATA} />

          {/* ── CATEGORIES ── */}
          <CategoriesSection
            categories={CATEGORIES_DATA}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              const recentElem = document.querySelector('#recent-projects');
              if (recentElem) {
                recentElem.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* ── RECENT PROJECTS ── */}
          <RecentProjectsSection
            projects={filteredProjects}
            onSelectProject={(proj) => setSelectedProject(proj)}
            selectedCategory={selectedCategory}
            onClearFilters={handleClearFilters}
            searchQuery={searchQuery}
            onOpenMapExplorer={() => navigateToView('map-explorer')}
          />

          {/* ── CTA SECTION ── */}
          <CTASection
            onRegisterClick={() => handleOpenAuth('register')}
            onOpenMapClick={() => setIsNearbyModalOpen(true)}
          />

          {/* ── FOOTER ── */}
          <Footer onOpenOpenData={() => setIsOpenDataModalOpen(true)} />
        </>
      )}

      {/* ── GLOBAL MODALS ── */}
      <NearbyMapModal
        isOpen={isNearbyModalOpen}
        onClose={() => setIsNearbyModalOpen(false)}
        projects={projects}
        onSelectProject={(proj) => setSelectedProject(proj)}
        onOpenAIRoute={(name) => handleOpenAIRoute(name)}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject && currentView !== 'map-explorer'}
        onClose={() => setSelectedProject(null)}
        currentUser={currentUser}
        onOpenAIRoute={(name) => handleOpenAIRoute(name, selectedProject)}
        onOpenAuth={() => handleOpenAuth('login')}
        onProjectUpdated={handleProjectUpdated}
      />

      <AIRouteModal
        isOpen={aiRouteModal.isOpen}
        projectName={aiRouteModal.projectName}
        project={aiRouteModal.project}
        onClose={() => setAIRouteModal({ isOpen: false, projectName: '', project: null })}
      />

      <OpenDataModal
        isOpen={isOpenDataModalOpen}
        projects={projects}
        onClose={() => setIsOpenDataModalOpen(false)}
      />
    </div>
  );
}

export default App;

