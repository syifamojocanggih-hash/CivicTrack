import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  LogOut,
  Check,
} from 'lucide-react';
import type { UserProfile, NotificationItem } from '../../types';
import { MOCK_DYNAMIC_NOTIFICATIONS } from '../../data/dashboardMockData';
import { apiService } from '../../services/api';

interface DashboardHeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSelectProjectNotification?: (projectId: number) => void;
  onToggleMobileSidebar: () => void;
  activeNavTitle?: string;
  unreadCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  onLogout,
  onSelectProjectNotification,
  onToggleMobileSidebar,
  activeNavTitle = 'Dashboard Utama',
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_DYNAMIC_NOTIFICATIONS);

  useEffect(() => {
    if (!currentUser) return;
    let isCancelled = false;

    const fetchNotifs = () => {
      apiService.getNotifications().then((res) => {
        if (!isCancelled && res.length > 0) {
          const mapped: NotificationItem[] = res.map((n) => {
            let waktu = 'Baru saja';
            try {
              const diff = Math.floor((Date.now() - new Date(n.created_at).getTime()) / 1000);
              if (diff < 60) waktu = 'Baru saja';
              else if (diff < 3600) waktu = `${Math.floor(diff / 60)} mnt lalu`;
              else if (diff < 86400) waktu = `${Math.floor(diff / 3600)} jam lalu`;
              else waktu = `${Math.floor(diff / 86400)} hari lalu`;
            } catch {
              waktu = n.created_at;
            }

            return {
              id: n.id,
              proyek_id: n.proyek_id,
              nama_proyek: n.nama_proyek || '',
              judul: n.nama_proyek ? 'Pembaruan Proyek' : 'CivicTrack Info',
              pesan: n.pesan,
              kategori: 'progres',
              waktu,
              dibaca: n.is_read,
            };
          });
          setNotifications(mapped);
        }
      }).catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  const handleMarkAllRead = () => {
    apiService.markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    if (!item.dibaca) {
      apiService.markNotificationRead(item.id).catch(() => {});
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n))
    );
    if (item.proyek_id && onSelectProjectNotification) {
      onSelectProjectNotification(item.proyek_id);
      setShowNotifMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE0E6] shadow-2xs h-16 flex items-center px-4 sm:px-6">
      <div className="w-full flex items-center justify-between">
        {/* Left: Mobile Sidebar Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5 text-[#184C78]" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">CivicTrack /</span>
              <h1 className="font-['DM_Sans'] font-bold text-base sm:text-lg text-[#184C78] leading-tight">
                {activeNavTitle}
              </h1>
            </div>
            <p className="text-[11px] text-[#6C757D] hidden md:block leading-tight">
              Sistem Pengawasan &amp; Transparansi Pembangunan Daerah
            </p>
          </div>
        </div>

        {/* Right: Notifications, Profile & Logout */}
        <div className="flex items-center gap-3">

            {/* Notification Bell with Dynamic Feed */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-[#6C757D] hover:text-[#184C78] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                title="Notifikasi Pembaruan"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-[#E74C3C] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-88 bg-white rounded-xl shadow-xl border border-[#DCE0E6] p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE0E6]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#184C78]">Notifikasi Pembaruan</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-[#FDEDEC] text-[#E74C3C] px-2 py-0.5 rounded-full border border-red-200">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#2980B9] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Tandai Semua Dibaca</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mt-2.5 max-h-72 overflow-y-auto text-xs pr-1">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          !item.dibaca
                            ? 'bg-[#EBF4FB]/60 border-[#2980B9]/40 hover:bg-[#EBF4FB]'
                            : 'bg-[#F5F7FA] border-transparent hover:bg-slate-100 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="font-bold text-[#184C78] text-[12px] flex items-center gap-1.5">
                            {!item.dibaca && <span className="w-2 h-2 rounded-full bg-[#2980B9]" />}
                            <span>{item.judul}</span>
                          </div>
                          <span className="text-[10px] text-[#6C757D] font-mono shrink-0">{item.waktu}</span>
                        </div>
                        {item.nama_proyek && (
                          <div className="text-[11px] font-semibold text-[#2980B9] mb-1">
                            📍 {item.nama_proyek}
                          </div>
                        )}
                        <p className="text-[11px] text-[#495057] leading-relaxed">{item.pesan}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#DCE0E6] mt-2 text-center">
                    <p className="text-[10px] text-[#6C757D]">
                      💡 Notifikasi otomatis terkirim saat proyek yang Anda ikuti diperbarui.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile info */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#DCE0E6]">
              <div className="w-8 h-8 rounded-full bg-[#184C78] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.nama.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#212529] leading-tight line-clamp-1 max-w-[150px]">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-[#6C757D] leading-tight truncate max-w-[150px]">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-[#6C757D] hover:text-[#E74C3C] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
    </header>
  );
};

