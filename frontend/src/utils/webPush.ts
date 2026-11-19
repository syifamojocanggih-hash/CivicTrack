/**
 * Web Push Notification Utility untuk Early-Warning CivicTrack
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.warn('Gagal mendaftarkan service worker:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Gagal meminta izin notifikasi browser:', error);
    return 'denied';
  }
}

export async function triggerLocalPushNotification(title: string, options: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        icon: '/civictrack-icon.png',
        badge: '/favicon-64x64.png',
        ...options,
      });
      return true;
    } else {
      new Notification(title, options);
      return true;
    }
  } catch (err) {
    console.warn('Gagal menampilkan notifikasi browser:', err);
    return false;
  }
}
