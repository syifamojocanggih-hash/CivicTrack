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
import { AuthModal } from './components/AuthModal';
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
import type { ProyekItem, ProyekKategori, UserProfile, UserRole, StatSummary } from './types';

export function App() {
  // State
  const [projects, setProjects] = useState<ProyekItem[]>(INITIAL_PROJECTS);
  const [stats, setStats] = useState<StatSummary>(STATS_DATA);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | null>(null);
  const [activeNav, setActiveNav] = useState<string>('peta');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'map-explorer'>('landing');
  const [authNotice, setAuthNotice] = useState<string>('');
  const [postLoginRedirect, setPostLoginRedirect] = useState<'dashboard' | 'map-explorer' | null>(null);

  // Sync projects and stats from backend on mount
  useEffect(() => {
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
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });
  const [selectedProject, setSelectedProject] = useState<ProyekItem | null>(null);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState<boolean>(false);
  const [aiRouteModal, setAIRouteModal] = useState<{ isOpen: boolean; projectName: string }>({
    isOpen: false,
    projectName: '',
  });
  const [isOpenDataModalOpen, setIsOpenDataModalOpen] = useState<boolean>(false);

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

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleCekDisekitarAction = () => {
    if (!currentUser) {
      setPostLoginRedirect('map-explorer');
      setAuthNotice('Silakan masuk terlebih dahulu untuk membuka Peta Eksplorasi Proyek di sekitar Anda.');
      handleOpenAuth('login');
    } else {
      setCurrentView('map-explorer');
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (postLoginRedirect === 'map-explorer') {
      setCurrentView('map-explorer');
      setPostLoginRedirect(null);
    } else {
      setCurrentView('dashboard');
    }
    setAuthNotice('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setPostLoginRedirect(null);
    setAuthNotice('');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    let newName = currentUser.nama;
    let newEmail = currentUser.email;
    let newDinas = currentUser.nama_dinas;

    if (newRole === 'penanggung_jawab' || newRole === 'admin_dinas' || newRole === 'pemerintah') {
      newName = 'Ir. Hendro Wijaya, S.T.';
      newEmail = 'penanggungjawab.pu@bojonegoro.go.id';
      newDinas = 'Dinas Pekerjaan Umum & Tim Pelaksana';
    } else if (newRole === 'aparatur_pemerintah' || newRole === 'pimpinan_instansi') {
      newName = 'Drs. H. M. Fauzi, M.Si';
      newEmail = 'aparatur.pemerintah@bojonegoro.go.id';
      newDinas = 'Sekretariat Daerah & Bappeda';
    } else {
      newName = 'Budi Santoso';
      newEmail = 'budi.santoso@gmail.com';
      newDinas = undefined;
    }

    setCurrentUser({
      ...currentUser,
      nama: newName,
      email: newEmail,
      role: newRole,
      nama_dinas: newDinas,
    });
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
      {/* ── CONDITIONAL RENDERING: MAP EXPLORER vs DASHBOARD vs LANDING PAGE ── */}
      {currentView === 'map-explorer' ? (
        <PublicMapExplorer
          currentUser={currentUser}
          projects={projects}
          onBackToLanding={() => setCurrentView('landing')}
          onOpenDashboard={() => setCurrentView('dashboard')}
          onOpenProjectDetail={(proj) => setSelectedProject(proj)}
          onOpenAIRoute={(name) => setAIRouteModal({ isOpen: true, projectName: name })}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
        />
      ) : currentView === 'dashboard' && currentUser ? (
        <DashboardMain
          currentUser={currentUser}
          projects={projects}
          onBackToLanding={() => setCurrentView('landing')}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          onOpenProjectDetail={(proj) => setSelectedProject(proj)}
          onOpenAIRoute={(name) => setAIRouteModal({ isOpen: true, projectName: name })}
          onOpenOpenDataModal={() => setIsOpenDataModalOpen(true)}
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
            onNavigateView={(view) => setCurrentView(view as any)}
          />

          {/* ── HERO ── */}
          <HeroSection
            onOpenNearbyMap={handleCekDisekitarAction}
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
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* ── RECENT PROJECTS ── */}
          <RecentProjectsSection
            projects={filteredProjects}
            onSelectProject={(proj) => setSelectedProject(proj)}
            selectedCategory={selectedCategory}
            onClearFilters={handleClearFilters}
            searchQuery={searchQuery}
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
        onOpenAIRoute={(name) => setAIRouteModal({ isOpen: true, projectName: name })}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => {
          setAuthModalState({ isOpen: false, mode: 'login' });
          setAuthNotice('');
        }}
        onLoginSuccess={handleLoginSuccess}
        notice={authNotice}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        currentUser={currentUser}
        onOpenAIRoute={(name) => setAIRouteModal({ isOpen: true, projectName: name })}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      <AIRouteModal
        isOpen={aiRouteModal.isOpen}
        projectName={aiRouteModal.projectName}
        onClose={() => setAIRouteModal({ isOpen: false, projectName: '' })}
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

