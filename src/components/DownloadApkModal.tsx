import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Loader2, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadApkFile } from '../utils/downloadApk';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  onOpenShareModal?: () => void;
  onMarkAsInstalled?: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
  language,
  onMarkAsInstalled
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleDownloadApk = async () => {
    try {
      localStorage.setItem('mathmate_app_installed', 'true');
    } catch {}
    if (onMarkAsInstalled) onMarkAsInstalled();

    const success = await downloadApkFile(setDownloadStatus);
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleNativeInstall = async () => {
    try {
      localStorage.setItem('mathmate_app_installed', 'true');
    } catch {}
    if (onMarkAsInstalled) onMarkAsInstalled();

    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  const handleDismissForever = () => {
    try {
      localStorage.setItem('mathmate_app_installed', 'true');
    } catch {}
    if (onMarkAsInstalled) onMarkAsInstalled();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md p-1.5 shrink-0">
              <img src="/icon.svg" alt="Mathmate Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'Mathmate অ্যাপ ডাউনলোড' : 'Download Mathmate App'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'আপনার মোবাইলে সম্পূর্ণ অফলাইনে ব্যবহারের জন্য'
                  : 'Get the app on your mobile device'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Download Options - Clean & Direct */}
        <div className="space-y-3">
          {/* Option 1: Direct Android APK */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'অ্যান্ড্রয়েড APK ফাইল' : 'Android APK File'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
                ২.৩ MB
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {language === 'bn'
                ? 'সরাসরি মোবাইলে APK ফাইল ডাউনলোড করে ইনস্টল করুন।'
                : 'Directly download and install APK on your phone.'}
            </p>
            <button
              type="button"
              onClick={handleDownloadApk}
              disabled={downloadStatus === 'downloading'}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
            >
              {downloadStatus === 'downloading' ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                  <span>{language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'}</span>
                </>
              ) : downloadStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>{language === 'bn' ? '✓ ডাউনলোড শুরু হয়েছে' : '✓ Download Started'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white shrink-0" />
                  <span>{language === 'bn' ? 'সরাসরি APK ডাউনলোড' : 'Download APK'}</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: 1-Click PWA Install (only if supported) */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>{language === 'bn' ? '১-ক্লিক ওয়েব ইনস্টল' : '1-Click Web Install'}</span>
                </span>
                <span className="text-[10px] text-indigo-300 font-medium">
                  {language === 'bn' ? 'ফ্রি' : 'Free'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'কোন ফাইল ডাউনলোড ছাড়া সরাসরি হোম স্ক্রিনে যুক্ত করুন।'
                  : 'Add straight to home screen without file download.'}
              </p>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>{language === 'bn' ? 'হোম স্ক্রিনে ইনস্টল করুন' : 'Install to Home Screen'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer: Already installed / Dismiss forever */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={handleDismissForever}
            className="text-slate-400 hover:text-slate-200 transition flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {language === 'bn'
                ? 'ইতিমধ্যে ইনস্টল করেছি (আর দেখাবেন না)'
                : 'Already installed (Don\'t show again)'}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-400 transition"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
