/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  PenTool,
  Keyboard,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  Trophy,
  Calculator,
  History,
  Bookmark,
  Languages,
  X,
  RotateCcw,
  Loader2,
  CheckCircle,
  HelpCircle,
  Info,
  Download,
  Smartphone,
  Share2
} from 'lucide-react';
import { SolvedProblem, SolverMode, AppLanguage } from './types';
import { MathView } from './components/MathView';
import { SolutionViewer } from './components/SolutionViewer';
import { CameraCapture } from './components/CameraCapture';
import { DrawingCanvas } from './components/DrawingCanvas';
import { MathKeyboard } from './components/MathKeyboard';
import { ScientificCalculator } from './components/ScientificCalculator';
import { FormulaBook } from './components/FormulaBook';
import { QuizMode } from './components/QuizMode';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DownloadApkModal } from './components/DownloadApkModal';
import { ShareAppModal } from './components/ShareAppModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { toVisualMath, toSolverExpression } from './utils/mathFormat';
import { solveMathOffline } from './utils/mathSolverFallback';
import { downloadApkFile } from './utils/downloadApk';

const QUICK_SAMPLE_PROBLEMS = [
  {
    titleBn: 'দ্বিঘাত সমীকরণ',
    titleEn: 'Quadratic Equation',
    problem: '3x^2 - 11x + 6 = 0 সমীকরণটির মূলদ্বয় নির্ণয় করো।',
    category: 'Algebra',
  },
  {
    titleBn: 'ত্রিকোণমিতিক মান',
    titleEn: 'Trigonometry Value',
    problem: 'যদি tan A = 4/3 হয়, তবে (sin A + cos A) / (sin A - cos A) এর মান কত?',
    category: 'Trigonometry',
  },
  {
    titleBn: 'ক্যালকুলাস ইন্টিগ্রেশন',
    titleEn: 'Calculus Integration',
    problem: 'মান নির্ণয় করো: \\int (4x^3 - 6x^2 + 2x - 7) dx',
    category: 'Calculus',
  },
  {
    titleBn: 'শতকরা ও লাভ-ক্ষতি',
    titleEn: 'Profit & Loss',
    problem: 'একটি দ্রব্য 450 টাকায় বিক্রয় করায় 10% ক্ষতি হলো। দ্রব্যটিতে 20% লাভ করতে হলে কত টাকায় বিক্রয় করতে হবে?',
    category: 'Arithmetic',
  },
  {
    titleBn: 'পিথাগোরাস ও জ্যামিতি',
    titleEn: 'Pythagorean Geometry',
    problem: 'একটি সমকোণী ত্রিভুজের অতিভুজ 13 সেমি এবং একটি বাহু 12 সেমি হলে, অপর বাহুর দৈর্ঘ্য এবং ত্রিভুজটির ক্ষেত্রফল কত?',
    category: 'Geometry',
  },
];

export default function App() {
  const { isInstalled } = usePWAInstall();
  // Detect if running inside installed Android APK, Android WebView, PWA standalone, or marked installed
  const [isInstalledApp, setIsInstalledApp] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // 1. Android APK WebView local file assets
    if (window.location.protocol === 'file:') return true;

    // 2. Android WebView detection
    const ua = (window.navigator?.userAgent || '').toLowerCase();
    const isWebView =
      ua.includes('; wv') ||
      ua.includes('version/4.0') ||
      (ua.includes('android') && ua.includes('wv')) ||
      (ua.includes('android') && ua.includes('version/') && ua.includes('chrome/'));
    if (isWebView) return true;

    // 3. Standalone mode (PWA installed on homescreen)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if ((window.navigator as any).standalone === true) return true;

    // 4. Android app referrer
    if (document.referrer && document.referrer.includes('android-app://')) return true;

    // 5. Query parameter indicator (?source=apk or ?source=app)
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') === 'apk' || params.get('source') === 'app' || params.get('installed') === '1') {
      return true;
    }

    // 6. User previously downloaded or chose to hide download prompts
    try {
      if (localStorage.getItem('mathmate_app_installed') === 'true') {
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  });

  useEffect(() => {
    if (isInstalled) {
      setIsInstalledApp(true);
      try {
        localStorage.setItem('mathmate_app_installed', 'true');
      } catch {}
    }
  }, [isInstalled]);
  const [activeTab, setActiveTab] = useState<'solver' | 'formulas' | 'quiz' | 'calculator'>('solver');
  const [language, setLanguage] = useState<AppLanguage>('bn');
  const [solverMode, setSolverMode] = useState<SolverMode>('standard');
  const [problemText, setProblemText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Modals & Drawers
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(true);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareAppModal, setShowShareAppModal] = useState(false);

  // Solving states
  const [isSolving, setIsSolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentSolution, setCurrentSolution] = useState<SolvedProblem | null>(null);

  // History stored in LocalStorage
  const [history, setHistory] = useState<SolvedProblem[]>([]);

  // Voice recording
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mathmate_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save history whenever it changes
  const saveToHistory = (newProblem: SolvedProblem) => {
    setHistory((prev) => {
      const updated = [newProblem, ...prev.filter((p) => p.id !== newProblem.id)].slice(0, 50);
      try {
        localStorage.setItem('mathmate_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history', e);
      }
      return updated;
    });
  };

  const handleToggleBookmark = (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
      localStorage.setItem('mathmate_history', JSON.stringify(updated));
      return updated;
    });
    if (currentSolution && currentSolution.id === id) {
      setCurrentSolution((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null));
    }
  };

  const handleDeleteProblem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('mathmate_history', JSON.stringify(updated));
      return updated;
    });
    if (currentSolution && currentSolution.id === id) {
      setCurrentSolution(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mathmate_history');
  };

  // Solve Action
  const handleSolve = async () => {
    if (!problemText.trim() && !selectedImage) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে কোনো গণিত সমস্যা লিখুন অথবা ফটো/ড্রয়িং আপলোড করুন।'
          : 'Please enter a math question or upload a photo/drawing.'
      );
      return;
    }

    setErrorMsg(null);
    setIsSolving(true);

    try {
      // Convert visual superscripts like 5³ to mathematical standard ^(3) for the solver engine
      const solverProblemText = toSolverExpression(problemText.trim());

      let solved: SolvedProblem | null = null;

      try {
        const res = await fetch('/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemText: solverProblemText,
            imageBase64: selectedImage,
            mode: solverMode,
            language,
          }),
        });

        const result = await res.json();
        if (res.ok && result.success && result.data) {
          solved = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            problemTitle: result.data.problemTitle || 'গণিত সমাধান',
            detectedProblemText: result.data.detectedProblemText || problemText,
            detectedProblemLatex: result.data.detectedProblemLatex,
            topic: result.data.topic || 'General Math',
            difficulty: result.data.difficulty || 'Medium',
            finalAnswer: result.data.finalAnswer || '',
            steps: result.data.steps || [],
            verification: result.data.verification,
            keyFormulas: result.data.keyFormulas || [],
            graphData: result.data.graphData,
            shortcutMethod: result.data.shortcutMethod,
            commonMistakes: result.data.commonMistakes,
            realWorldApplication: result.data.realWorldApplication,
            similarPracticeProblem: result.data.similarPracticeProblem,
            inputImage: selectedImage || undefined,
            inputText: problemText || undefined,
            isBookmarked: false,
          };
        }
      } catch (networkOrApiErr) {
        console.warn('API solve failed, attempting smart math fallback engine:', networkOrApiErr);
      }

      // If API failed or was unreachable, attempt client-side math computation (e.g. 5³, x² - 5x + 6 = 0, arithmetic)
      if (!solved && problemText.trim()) {
        const offlineResult = solveMathOffline(problemText.trim(), language);
        if (offlineResult) {
          solved = offlineResult;
        }
      }

      if (!solved) {
        throw new Error(
          language === 'bn'
            ? 'সমাধান করতে ব্যর্থ হয়েছে। অনুগ্রহ করে সমস্যাটি পুনরায় পরীক্ষা করে সাবমিট করুন।'
            : 'Failed to solve the math problem. Please check your problem and try again.'
        );
      }

      setCurrentSolution(solved);
      saveToHistory(solved);
      setActiveTab('solver');

      // Scroll smoothly to solution
      setTimeout(() => {
        window.scrollTo({ top: 480, behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          (language === 'bn'
            ? 'সমাধান করতে ব্যর্থ হয়েছে। অনুগ্রহ করে সমস্যাটি পুনরায় পরীক্ষা করুন।'
            : 'Failed to solve. Please recheck your problem.')
      );
    } finally {
      setIsSolving(false);
    }
  };

  // Insert Symbol from Math Keyboard with cursor position tracking & placeholder focus
  const handleInsertSymbol = (symbol: string, cursorOffset: number = 0) => {
    const visualSymbol = toVisualMath(symbol);
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? problemText.length;
      const end = textarea.selectionEnd ?? problemText.length;
      const nextText = problemText.substring(0, start) + visualSymbol + problemText.substring(end);
      setProblemText(nextText);
      const newCursorPos = Math.max(0, start + visualSymbol.length - cursorOffset);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    } else {
      setProblemText((prev) => prev + visualSymbol);
    }
  };

  // Backspace handler for Math keyboard
  const handleBackspace = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? problemText.length;
      const end = textarea.selectionEnd ?? problemText.length;
      if (start === end) {
        if (start > 0) {
          const nextText = problemText.substring(0, start - 1) + problemText.substring(end);
          setProblemText(nextText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start - 1, start - 1);
          }, 10);
        }
      } else {
        const nextText = problemText.substring(0, start) + problemText.substring(end);
        setProblemText(nextText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start);
        }, 10);
      }
    } else {
      setProblemText((prev) => prev.slice(0, -1));
    }
  };

  // Move cursor Left/Right
  const handleMoveCursor = (direction: 'left' | 'right') => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      const currentPos = textarea.selectionStart ?? problemText.length;
      const nextPos = direction === 'left' ? Math.max(0, currentPos - 1) : Math.min(problemText.length, currentPos + 1);
      textarea.setSelectionRange(nextPos, nextPos);
    }
  };

  // Voice Input (Web Speech Recognition)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'bn'
          ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই।'
          : 'Voice recognition is not supported in this browser.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setProblemText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setActiveTab('solver');
              setCurrentSolution(null);
            }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <span className="font-mono font-bold text-xl">∑</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Math<span className="text-indigo-400">mate</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  AI Solver
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {language === 'bn' ? 'যেকোনো গণিত ফটো বা টাইপ করে তাৎক্ষণিক সমাধান' : 'Snap or type any math problem'}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('solver')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'solver'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'bn' ? 'সমাধানকারী' : 'Solver'}</span>
            </button>
            <button
              onClick={() => setActiveTab('formulas')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'formulas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সূত্র ভাণ্ডার' : 'Formulas'}</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'কুইজ টেস্ট' : 'Quiz'}</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ক্যালকুলেটর' : 'Calculator'}</span>
            </button>
          </nav>

          {/* Quick Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Single subtle Install/Download button - ONLY shown on web browser when NOT installed */}
            {!isInstalledApp && (
              <button
                onClick={() => setShowDownloadModal(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                title={language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'Download App'}
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'Download App'}</span>
              </button>
            )}

            {/* Share App Button */}
            <button
              onClick={() => setShowShareAppModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold shadow-sm transition active:scale-95"
              title={language === 'bn' ? 'অ্যাপটি অন্যদের সাথে শেয়ার করুন' : 'Share App with Friends'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
            </button>

            {/* History Drawer Trigger */}
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
              title="History & Bookmarks"
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {history.length > 99 ? '99+' : history.length}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              <Languages className="w-4 h-4 text-indigo-400" />
              <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-slate-800/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('solver')}
            className={`py-1.5 px-2 rounded-lg flex items-center space-x-1 ${
              activeTab === 'solver' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সমাধান' : 'Solver'}</span>
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`py-1.5 px-2 rounded-lg flex items-center space-x-1 ${
              activeTab === 'formulas' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সূত্র' : 'Formulas'}</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-1.5 px-2 rounded-lg flex items-center space-x-1 ${
              activeTab === 'quiz' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কুইজ' : 'Quiz'}</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-1.5 px-2 rounded-lg flex items-center space-x-1 ${
              activeTab === 'calculator' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ক্যালক' : 'Calc'}</span>
          </button>
          <button
            onClick={() => setShowShareAppModal(true)}
            className="py-1.5 px-2 rounded-lg flex items-center space-x-1 text-indigo-400 font-bold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* TAB 1: SOLVER VIEW */}
        {activeTab === 'solver' && (
          <div className="space-y-8">
            {/* Input Hub Hero Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                    <span>{language === 'bn' ? 'গণিত ফটো তুলুন বা টাইপ করুন' : 'Snap Math Photo or Type'}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  </h2>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? 'বীজগণিত, জ্যামিতি, ক্যালকুলাস, ত্রিকোণমিতি বা পাটিগণিতের যেকোনো প্রশ্ন মুহূর্তেই সমাধান করুন'
                      : 'Solve algebra, calculus, geometry, trigonometry or arithmetic step-by-step'}
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: 'standard', labelBn: 'প্রমিত', labelEn: 'Standard' },
                    { id: 'shortcut', labelBn: 'শর্টকাট', labelEn: 'Shortcut' },
                    { id: 'explain_simple', labelBn: 'সহজ সরল', labelEn: 'Simple' },
                    { id: 'exam_prep', labelBn: 'পরীক্ষা', labelEn: 'Exam' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSolverMode(m.id as SolverMode)}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                        solverMode === m.id
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {language === 'bn' ? m.labelBn : m.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mathway Quick Controls & Action Header */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'bn' ? 'গাণিতিক সমীকরণ বা প্রশ্ন' : 'Math Problem / Expression'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                    title={language === 'bn' ? 'মুখে বলুন' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
                    <span className="text-xs hidden sm:inline">{language === 'bn' ? 'ভয়েস' : 'Voice'}</span>
                  </button>

                  {/* Clear all button */}
                  {(problemText || selectedImage) && (
                    <button
                      type="button"
                      onClick={() => {
                        setProblemText('');
                        setSelectedImage(null);
                        setErrorMsg(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                    >
                      {language === 'bn' ? 'সব মুছুন' : 'Clear all'}
                    </button>
                  )}

                  {/* Submit / Solve button (Mathway Navy Pill Style) */}
                  <button
                    type="button"
                    onClick={handleSolve}
                    disabled={isSolving || (!problemText.trim() && !selectedImage)}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-900/30 border border-blue-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1.5"
                  >
                    {isSolving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{language === 'bn' ? 'সমাধান করুন' : 'Submit'}</span>
                  </button>
                </div>
              </div>

              {/* Textarea & Math Input */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500 transition shadow-inner">
                <textarea
                  ref={textareaRef}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'এখানে আপনার গণিত সমস্যাটি লিখুন (যেমন: x^2 - 5x + 6 = 0 সমাধান করো, অথবা কোনো ত্রিভুজের পরিমিতি)...'
                      : 'Type your math problem here (e.g. solve x^2 - 5x + 6 = 0, find area of triangle with sides 6, 8, 10)...'
                  }
                  rows={4}
                  className="w-full bg-transparent p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />

                {/* Attached Image Thumbnail */}
                {selectedImage && (
                  <div className="p-3 mx-4 mb-3 bg-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedImage}
                        alt="Selected problem"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-600 bg-black"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {language === 'bn' ? 'সংযুক্ত ফটো বা ড্রয়িং' : 'Attached Photo / Drawing'}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          ✓ {language === 'bn' ? 'স্ক্যানের জন্য প্রস্তুত' : 'Ready to analyze'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Input Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-900/60 border-t border-slate-800/80 rounded-b-2xl">
                  {/* Media buttons */}
                  <div className="flex items-center space-x-1.5">
                    {/* Snap Photo / Upload */}
                    <button
                      onClick={() => setShowCameraModal(true)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ফটো স্ক্যান' : 'Snap Photo'}</span>
                    </button>

                    {/* Drawing Pad */}
                    <button
                      onClick={() => setShowDrawingModal(true)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ড্রয়িং প্যাড' : 'Draw'}</span>
                    </button>

                    {/* Math Virtual Keyboard Toggle */}
                    <button
                      onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                        showMathKeyboard
                          ? 'bg-slate-800 text-white border-slate-600'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'প্রতীক' : 'Symbols'}</span>
                    </button>

                    {/* Voice Dictation */}
                    <button
                      onClick={handleToggleVoice}
                      className={`p-1.5 rounded-xl border text-xs transition ${
                        isListening
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                      title={language === 'bn' ? 'মুখে বলুন' : 'Voice input'}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Clear button */}
                  {(problemText || selectedImage) && (
                    <button
                      onClick={() => {
                        setProblemText('');
                        setSelectedImage(null);
                        setErrorMsg(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-300 transition"
                    >
                      {language === 'bn' ? 'সব মুছুন' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Live Styled Math Equation Display Canvas (Mathway Style) */}
              {problemText.trim() && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl shadow-xl flex items-center justify-between gap-4 overflow-x-auto">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400/50" />
                    <div className="text-lg sm:text-2xl font-serif text-white tracking-wide overflow-x-auto">
                      <MathView content={problemText} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProblemText('');
                    }}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Clear'}
                  </button>
                </div>
              )}

              {/* Math Keyboard Drawer */}
              {showMathKeyboard && (
                <div className="animate-in fade-in duration-200">
                  <MathKeyboard
                    onInsert={handleInsertSymbol}
                    onBackspace={handleBackspace}
                    onClear={() => setProblemText('')}
                    onMoveCursor={handleMoveCursor}
                    onSolve={handleSolve}
                    language={language}
                  />
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-2xl text-red-200 text-xs sm:text-sm flex items-start space-x-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Big Solve Button */}
              <button
                onClick={handleSolve}
                disabled={isSolving || (!problemText.trim() && !selectedImage)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-base sm:text-lg shadow-xl shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition hover:scale-[1.008] active:scale-[0.99]"
              >
                {isSolving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {language === 'bn' ? 'গণিত মিত্র সমাধান করছে...' : 'Mathmate is solving with AI...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>
                      {language === 'bn' ? 'AI ধাপে ধাপে সমাধান করুন' : 'Solve Step-by-Step with AI'}
                    </span>
                  </>
                )}
              </button>

              {/* Quick Preset Math Samples */}
              <div className="pt-2">
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{language === 'bn' ? 'দ্রুত চেষ্টা করুন (নমুনা অংক):' : 'Try quick sample problems:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SAMPLE_PROBLEMS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setProblemText(sample.problem);
                        setSelectedImage(null);
                        setErrorMsg(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 text-xs transition"
                    >
                      <span className="text-indigo-400 font-semibold mr-1.5">[{sample.category}]</span>
                      <span>{language === 'bn' ? sample.titleBn : sample.titleEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Render Solved Problem View if exists */}
            {currentSolution && (
              <div className="pt-4">
                <SolutionViewer
                  problem={currentSolution}
                  onToggleBookmark={handleToggleBookmark}
                  language={language}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FORMULA BOOK - Persistent mounting for INSTANT 0ms tab switching */}
        <div className={activeTab === 'formulas' ? 'block' : 'hidden'}>
          <FormulaBook
            onSelectSample={(sampleProblem) => {
              setProblemText(sampleProblem);
              setSelectedImage(null);
              setActiveTab('solver');
            }}
            language={language}
          />
        </div>

        {/* TAB 3: QUIZ & PRACTICE */}
        {activeTab === 'quiz' && <QuizMode language={language} />}

        {/* TAB 4: SCIENTIFIC CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">
                {language === 'bn' ? 'সায়েন্টিফিক ক্যালকুলেটর' : 'Scientific Calculator'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'গাণিতিক হিসাব করুন এবং সরাসরি AI এর সাহায্যে ধাপে ধাপে বিস্তারিত সমাধান দেখুন'
                  : 'Calculate values and instantly get AI step-by-step explanations'}
              </p>
            </div>
            <ScientificCalculator
              onSendToSolver={(expr) => {
                setProblemText(`মান নির্ণয় করো বা সমাধান করো: ${expr}`);
                setSelectedImage(null);
                setActiveTab('solver');
                setTimeout(() => handleSolve(), 100);
              }}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">Mathmate</span>
            <span>•</span>
            <span>{language === 'bn' ? 'বুদ্ধিমান গণিত শিক্ষক ও সমাধানকারী' : 'Smart AI Math Solver & Tutor'}</span>
          </div>
          <div>
            <span>{language === 'bn' ? 'ফটো স্ক্যান • ধাপে ধাপে সমাধান • গ্রাফ • সূত্র ভাণ্ডার' : 'Photo Scan • Step-by-Step • Graphs • Formula Book'}</span>
          </div>
        </div>
      </footer>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCapture
          onCapture={(img) => {
            setSelectedImage(img);
            setErrorMsg(null);
          }}
          onClose={() => setShowCameraModal(false)}
          language={language}
        />
      )}

      {/* Drawing Pad Modal */}
      {showDrawingModal && (
        <DrawingCanvas
          onConfirm={(img) => {
            setSelectedImage(img);
            setErrorMsg(null);
          }}
          onClose={() => setShowDrawingModal(false)}
          language={language}
        />
      )}

      {/* History & Bookmarks Drawer */}
      {showHistoryDrawer && (
        <HistoryDrawer
          history={history}
          onSelectProblem={(p) => {
            setCurrentSolution(p);
            setActiveTab('solver');
          }}
          onToggleBookmark={handleToggleBookmark}
          onDeleteProblem={handleDeleteProblem}
          onClearHistory={handleClearHistory}
          onClose={() => setShowHistoryDrawer(false)}
          language={language}
        />
      )}

      {/* Share App Modal */}
      {showShareAppModal && (
        <ShareAppModal
          isOpen={showShareAppModal}
          onClose={() => setShowShareAppModal(false)}
          language={language}
        />
      )}

      {/* APK / PWA Mobile App Download Modal */}
      {!isInstalledApp && showDownloadModal && (
        <DownloadApkModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          language={language}
          onOpenShareModal={() => setShowShareAppModal(true)}
          onMarkAsInstalled={() => setIsInstalledApp(true)}
        />
      )}
    </div>
  );
}
