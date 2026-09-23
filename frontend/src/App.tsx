import { useState, useMemo } from 'react';
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

import {
  STATS_DATA,
  INITIAL_PROJECTS,
  CATEGORIES_DATA,
  FEATURES_DATA,
  HOW_IT_WORKS_DATA,
} from './data/mockData';
import type { ProyekItem, ProyekKategori, UserProfile } from './types';

export function App() {
  // State
  const [projects] = useState<ProyekItem[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | null>(null);
  const [activeNav, setActiveNav] = useState<string>('peta');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Modal States
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });
  const [selectedProject, setSelectedProject] = useState<ProyekItem | null>(null);
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

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleOpenFeature = (featureId: string) => {
    if (featureId === 'ai') {
      setAIRouteModal({ isOpen: true, projectName: 'Pelebaran Jalan Utama Kota' });
    } else if (featureId === 'open') {
      setIsOpenDataModalOpen(true);
    } else if (featureId === 'map') {
      const hero = document.querySelector('#hero');
      hero?.scrollIntoView({ behavior: 'smooth' });
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
      {/* ── NAVBAR ── */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* ── HERO ── */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onSelectChip={handleSelectChip}
        onSelectProject={(proj) => setSelectedProject(proj)}
        projects={projects}
      />

      {/* ── STAT STRIP ── */}
      <StatStrip stats={STATS_DATA} />

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
        onOpenMapClick={() => {
          const hero = document.querySelector('#hero');
          hero?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── FOOTER ── */}
      <Footer onOpenOpenData={() => setIsOpenDataModalOpen(true)} />

      {/* ── MODALS ── */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        onLoginSuccess={(user) => setCurrentUser(user)}
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
