import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { profile } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY);
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!isSupported || !profile) return;
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => setIsSubscribed(!!sub));
  }, [isSupported, profile]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !profile) return false;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      await supabase.from('push_subscriptions').upsert({
        user_id: profile.id,
        endpoint: json.endpoint,
        p256dh: (json.keys as any).p256dh,
        auth: (json.keys as any).auth,
      }, { onConflict: 'user_id,endpoint' });
      setIsSubscribed(true);
      setPermission('granted');
      return true;
    } catch {
      setPermission(Notification.permission);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, profile]);

  const unsubscribe = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await supabase.from('push_subscriptions')
        .delete()
        .eq('user_id', profile.id)
        .eq('endpoint', sub.endpoint);
    }
    setIsSubscribed(false);
    setLoading(false);
  }, [profile]);

  return { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe };
}
