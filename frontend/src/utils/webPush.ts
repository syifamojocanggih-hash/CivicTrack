/**
 * Web Push Notification Utility untuk Early-Warning CivicTrack
 */
import { apiService } from '../services/api';

/**
 * Konversi kunci publik VAPID base64url menjadi Uint8Array untuk PushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

/**
 * Mendaftarkan browser ke Web Push Service, mengambil VAPID public key dari backend,
 * dan menyimpan PushSubscription ke endpoint database backend.
 */
export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return null;
  }

  try {
    let registration: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await registerServiceWorker();
    }
    if (!registration) return null;

    const reg = await navigator.serviceWorker.ready;

    // Ambil VAPID Public Key dari backend
    const vapidPublicKey = await apiService.getVapidPublicKey();
    if (!vapidPublicKey) {
      console.warn('VAPID public key tidak tersedia dari server.');
      return null;
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Dapatkan subscription yang sudah ada atau buat subscription baru
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });
    }

    // Ekstrak keys (p256dh dan auth)
    const rawP256dh = subscription.getKey('p256dh');
    const rawAuth = subscription.getKey('auth');

    const p256dhStr = rawP256dh ? btoa(String.fromCharCode(...new Uint8Array(rawP256dh))) : '';
    const authStr = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : '';

    // Kirim subscription ke backend
    await apiService.registerPushSubscription({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dhStr,
        auth: authStr,
      },
    });

    return subscription;
  } catch (err) {
    console.warn('Gagal melakukan pendaftaran Web Push ke server:', err);
    return null;
  }
}

/**
 * Menghapus langganan Web Push browser dan menghapus rekaman di backend
 */
export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return true;

    // Hapus di backend
    await apiService.unregisterPushSubscription(subscription.endpoint);

    // Hapus di browser
    const unsubscribed = await subscription.unsubscribe();
    return unsubscribed;
  } catch (err) {
    console.warn('Gagal membatalkan langganan Web Push:', err);
    return false;
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
