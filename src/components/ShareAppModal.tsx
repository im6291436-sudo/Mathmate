import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, X, Smartphone, MessageCircle, Send, CheckCircle2, ArrowRight, Sparkles, Trash2, Download, FileCode } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose, language }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = () => {
    setDownloadingZip(true);
    const link = document.createElement('a');
    link.href = '/api/download-zip';
    link.setAttribute('download', 'mathmate-project.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingZip(false), 2500);
  };

  // The dynamic live URL for Mathmate app (works with custom domains, dev & preview)
  const appLiveUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-dev-glegq5qdvn2afn4burio42-431245731112.asia-southeast1.run.app';

  const shareTitle = language === 'bn'
    ? 'Mathmate - AI গণিত সমাধানকারী অ্যাপ'
    : 'Mathmate - AI Math Solver App';

  const shareText = language === 'bn'
    ? `📱 Mathmate - AI গণিত সমাধানকারী অ্যাপ!\n\n` +
      `📐 যেকোনো কঠিন অংক ফটো তুলে বা লিখে ১ সেকেন্ডে ধাপে ধাপে সমাধান, সূত্র ও শর্টকাট কৌশল দেখুন।\n\n` +
      `🚀 ফোনে ইনস্টল ও ফ্রিতে ব্যবহার করতে এই লিঙ্কে যান:\n${appLiveUrl}`
    : `📱 Mathmate - AI Math Solver App!\n\n` +
      `📐 Snap a photo or type any math problem to get step-by-step solutions, formulas & shortcut tricks instantly.\n\n` +
      `🚀 Install and use free on your phone:\n${appLiveUrl}`;

  const handleShareViaSystem = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const shareData = {
          title: shareTitle,
          text: shareText,
          url: appLiveUrl,
        };

        if (navigator.canShare && !navigator.canShare(shareData)) {
          await navigator.share({
            title: shareTitle,
            text: `${shareText}\n\n🔗 ${appLiveUrl}`,
          });
        } else {
          await navigator.share(shareData);
        }
        setSharedSuccess(true);
        setTimeout(() => setSharedSuccess(false), 3000);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleCopyLinkOnly = () => {
    navigator.clipboard.writeText(appLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(appLiveUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 p-2 shrink-0">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{language === 'bn' ? 'অ্যাপ শেয়ার ও আমন্ত্রণ' : 'Share Mathmate App'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Instant Install
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'বন্ধু ও সহপাঠীদের সাথে শেয়ার করুন যাতে তারাও সহজেই ফোনে ইনস্টল করতে পারে'
                  : 'Share with friends so they can easily download and install it on their phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: 1-Click Native Share (WhatsApp, Messenger, Facebook, etc.) */}
        <div className="space-y-3">
          <button
            onClick={handleShareViaSystem}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            {sharedSuccess ? <Check className="w-5 h-5 text-emerald-200" /> : <Share2 className="w-5 h-5" />}
            <span>
              {sharedSuccess
                ? (language === 'bn' ? '✓ সফলভাবে শেয়ার হয়েছে!' : '✓ Shared Successfully!')
                : (language === 'bn' ? 'সোশ্যাল মিডিয়া বা মেসেঞ্জারে শেয়ার করুন' : 'Share via Apps / Social Media')}
            </span>
          </button>

          {/* WhatsApp Direct Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে (WhatsApp) বন্ধুদের পাঠান' : 'Share directly to WhatsApp'}</span>
          </button>
        </div>

        {/* Direct Link Copy Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'bn' ? 'অ্যাপের সরাসরি ডাউনলোড ও ইনস্টল লিঙ্ক:' : 'Direct App Install Link:'}</span>
            </span>
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQR ? (language === 'bn' ? 'QR লুকান' : 'Hide QR') : (language === 'bn' ? 'QR কোড দেখুন' : 'View QR Code')}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={appLiveUrl}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLinkOnly}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition ${
                copiedLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>

          {/* QR Code Expansion */}
          {showQR && (
            <div className="pt-3 border-t border-slate-800/80 flex flex-col items-center space-y-2 animate-in fade-in duration-200">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img
                  src={qrImageUrl}
                  alt="Mathmate QR Code"
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                {language === 'bn'
                  ? '📷 যেকোনো মোবাইলের ক্যামেরা দিয়ে স্ক্যান করলেই ১ সেকেন্ডে অ্যাপটি খুলবে ও ইনস্টল হবে।'
                  : '📷 Scan with any phone camera to open and install in 1 second.'}
              </p>
            </div>
          )}
        </div>

        {/* Android / iOS Friendly Install Guide */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-xs">
          <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'বন্ধু বা অন্য কেউ কীভাবে ফোনে ইনস্টল করবে?' : 'How others can install this on their phone:'}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <li>
              {language === 'bn'
                ? 'শেয়ার করা লিঙ্কে ক্লিক করে ফোনের ক্রোম ব্রাউজারে ওপেন করবে।'
                : 'Tap the shared link to open it in Chrome on their phone.'}
            </li>
            <li>
              {language === 'bn'
                ? 'ব্রাউজারের উপরে ডানদিকের ৩টি ডট (⋮) মেনুতে চাপ দেবে।'
                : 'Tap the three-dot menu (⋮) in the top-right corner.'}
            </li>
            <li>
              <span className="text-white font-medium">
                {language === 'bn' ? '“Install app” বা “Add to Home screen” চাপবে।' : 'Select “Install app” or “Add to Home screen”.'}
              </span>
            </li>
            <li>
              {language === 'bn'
                ? 'ম্যাথমেটের রঙিন লোগো সহ অ্যাপটি সরাসরি ফোনে ইনস্টল হয়ে যাবে!'
                : 'Mathmate with its colorful logo will be installed on their phone!'}
            </li>
          </ol>
        </div>

        {/* Tip for Family Link / Under 13 / Supervision Error */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 text-xs text-emerald-200">
          <div className="font-semibold text-emerald-300 flex items-center space-x-1.5">
            <span>🛡️</span>
            <span>
              {language === 'bn'
                ? 'অন্য ফোনে "Can\'t access this service (Under 13)" দেখালে করণীয়:'
                : 'If seeing "Can\'t access this service (Under 13)" on other phone:'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'ওই ফোনে যদি Google Family Link (১৩ বছরের নিচের অ্যাকাউন্ট) থাকে, তবে গুগল ডেভেলপার লিংক ব্লক করে। সমাধান: আপনার ফোন থেকে সরাসরি ডাউনলোড করা Mathmate.apk ফাইলটি WhatsApp বা ব্লুটুথ দিয়ে পাঠিয়ে দিন, অথবা তাদের ব্রাউজারের Incognito (ছদ্মবেশী) মোডে লিঙ্কটি খুলুন।'
              : 'If that phone has Google Family Link (supervised account), Google blocks dev links. Solution: Send the downloaded Mathmate.apk file via WhatsApp/Bluetooth, or open the link in Chrome Incognito mode.'}
          </p>
        </div>

        {/* Tip for Fixing Grey 'R' icon */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs text-amber-200">
          <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'হোম স্ক্রিনের ধূসর “R” আইকনটি ঠিক করার নিয়ম:' : 'Fix the grey “R” icon on your home screen:'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'আপনার ফোনের স্ক্রিনে থাকা আগের ধূসর "R" শর্টকাটটি আঙুল দিয়ে চেপে ধরে "Remove / Delete" করে দিন। এরপর ব্রাউজারের ৩-ডট (⋮) থেকে "Install app" চাপলে নতুন রঙিন আসল Mathmate লোগো সহ অ্যাপ পাবেন।'
              : 'Long press and remove the old grey "R" shortcut from your home screen. Then tap "Install app" from Chrome menu (⋮) to get the fresh colorful Mathmate app icon.'}
          </p>
        </div>

        {/* Source Code Download (ZIP) */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'সম্পূর্ণ অ্যাপের কোড ডাউনলোড (ZIP)' : 'Download Source Code (.zip)'}
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              GitHub বিকল্প
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'গিটহাব খোঁজাখুঁজি ছাড়াই সরাসরি আপনার ফোনে এই প্রজেক্টের সমস্ত কোড এবং ফাইল ZIP আকারে এক ক্লিকে ডাউনলোড করুন।'
              : 'Download the entire project source code directly to your phone as a ZIP file with one click.'}
          </p>
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloadingZip
                ? (language === 'bn' ? 'ফাইল প্রস্তুত ও ডাউনলোড হচ্ছে...' : 'Generating ZIP...')
                : (language === 'bn' ? 'সরাসরি প্রজেক্ট কোড ডাউনলোড করুন (ZIP)' : 'Download Project ZIP')}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span className="text-indigo-400">Mathmate AI Math Solver</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
