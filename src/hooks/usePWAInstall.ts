import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check various indicators of installed / standalone mode
    const checkInstalled = (): boolean => {
      // 1. CSS display-mode standalone or fullscreen
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreenMedia = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUiMedia = window.matchMedia('(display-mode: minimal-ui)').matches;

      // 2. iOS Safari standalone flag
      const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      // 3. Android TWA / WebAPK / referrer
      const isDocumentReferrerAndroid = document.referrer.includes('android-app://');

      // 4. URL query params like ?source=pwa or ?utm_source=homescreen
      const urlParams = new URLSearchParams(window.location.search);
      const isPwaQuery = urlParams.get('source') === 'pwa' || urlParams.get('utm_source') === 'homescreen';

      return (
        isStandaloneMedia ||
        isFullscreenMedia ||
        isMinimalUiMedia ||
        isIosStandalone ||
        isDocumentReferrerAndroid ||
        isPwaQuery
      );
    };

    setIsInstalled(checkInstalled());

    // Listen for display-mode changes in real time
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        try {
          localStorage.setItem('mathmate_pwa_installed', 'true');
        } catch { /* safe */ }
      }
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleDisplayModeChange);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('mathmate_pwa_installed', 'true');
      } catch { /* safe */ }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('mathmate_pwa_installed', 'true');
      } catch { /* safe */ }
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
