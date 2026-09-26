import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FORMULA_LIBRARY } from '../data/formulas';
import { FormulaItem } from '../types';
import { FitMath } from './FitMath';
import {
  downloadFormulaA4Pdf,
  printFormulaA4,
  downloadCategoryA4Pdf,
  printCategoryA4,
} from '../utils/pdfExport';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Calculator,
  Square,
  Compass,
  PieChart,
  Grid,
  Download,
  Printer,
  Loader2,
  FileCheck,
} from 'lucide-react';

interface FormulaBookProps {
  onSelectSample: (problem: string) => void;
  language: 'bn' | 'en';
}

// Helper to determine category badges & colors
function getCategoryLabel(cat: string, language: 'bn' | 'en'): string {
  switch (cat) {
    case 'algebra':
      return language === 'bn' ? 'বীজগণিত' : 'Algebra';
    case 'arithmetic':
      return language === 'bn' ? 'পাটিগণিত' : 'Arithmetic';
    case 'mensuration':
      return language === 'bn' ? 'পরিমিতি ও পরিসীমা' : 'Mensuration';
    case 'trigonometry':
      return language === 'bn' ? 'ত্রিকোণমিতি' : 'Trigonometry';
    case 'geometry':
      return language === 'bn' ? 'জ্যামিতি ও স্থানাঙ্ক' : 'Geometry';
    case 'calculus':
      return language === 'bn' ? 'ক্যালকুলাস' : 'Calculus';
    case 'statistics':
      return language === 'bn' ? 'পরিসংখ্যান' : 'Statistics';
    case 'higher_math':
      return language === 'bn' ? 'উচ্চতর গণিত' : 'Higher Math';
    default:
      return cat;
  }
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'algebra':
      return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    case 'arithmetic':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'mensuration':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'trigonometry':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    case 'geometry':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    case 'calculus':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'statistics':
      return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    case 'higher_math':
      return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
}

interface FormulaCardProps {
  formula: FormulaItem;
  language: 'bn' | 'en';
  isDownloading: boolean;
  isCopied: boolean;
  onDownload: (formula: FormulaItem, e: React.MouseEvent) => void;
  onPrint: (formula: FormulaItem, e: React.MouseEvent) => void;
  onCopy: (id: string, latex: string, e: React.MouseEvent) => void;
  onSelectSample: (sample: string) => void;
  onOpenModal: (formula: FormulaItem) => void;
}

/**
 * Memoized Formula Card component for buttery-smooth 60fps scrolling and filtering
 */
const FormulaCard = React.memo<FormulaCardProps>(({
  formula,
  language,
  isDownloading,
  isCopied,
  onDownload,
  onPrint,
  onCopy,
  onSelectSample,
  onOpenModal,
}) => {
  const isBn = language === 'bn';
  const title = isBn ? formula.titleBn : formula.titleEn;
  const subtitle = isBn ? formula.titleEn : formula.titleBn;
  const formulaLatex = (isBn ? formula.latexBn : formula.latexEn) || formula.latex;
  const explanation = isBn ? formula.explanationBn : formula.explanationEn;
  const sample = (isBn ? formula.sampleProblemBn : formula.sampleProblemEn) || formula.sampleProblem;
  const gradeBadge = (isBn ? formula.gradeBn : formula.gradeEn) || formula.gradeBn;
  const catLabel = getCategoryLabel(formula.category, language);
  const catColor = getCategoryColor(formula.category);

  return (
    <div
      onClick={() => onOpenModal(formula)}
      className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/70 hover:shadow-indigo-500/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition group backdrop-blur-sm cursor-pointer relative hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <div>
        {/* Card Header: Badges + Action Buttons */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
              {gradeBadge}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catColor}`}>
              {catLabel}
            </span>
          </div>

          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            {/* Quick A4 PDF Download Button */}
            <button
              type="button"
              onClick={(e) => onDownload(formula, e)}
              disabled={isDownloading}
              className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/40 transition shrink-0 flex items-center gap-1 text-[11px] font-bold shadow-sm active:scale-95 disabled:opacity-50"
              title={isBn ? 'A4 পেপারে PDF ডাউনলোড করুন (দ্রুত)' : 'Download A4 PDF'}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>A4 PDF</span>
                </>
              )}
            </button>

            {/* Quick Print Button */}
            <button
              type="button"
              onClick={(e) => onPrint(formula, e)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition shrink-0"
              title={isBn ? 'তাত্ক্ষণিক প্রিন্ট / সেভ' : 'Instant Print'}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Copy LaTeX button */}
            <button
              type="button"
              onClick={(e) => onCopy(formula.id, formulaLatex, e)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
              title="Copy LaTeX"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-indigo-200 transition">
          {title}
        </h3>
        <p className="text-[11px] text-slate-400 mb-2 font-mono">{subtitle}</p>

        {/* FORMULA DISPLAY BOX - STRICT SINGLE LINE WITH PROPORTIONAL SCALING */}
        <div className="bg-slate-950 rounded-xl px-2.5 py-2.5 border border-slate-800 group-hover:border-indigo-500/40 text-center my-2 shadow-inner transition relative flex items-center justify-center min-h-[3.2rem] overflow-hidden">
          <FitMath
            content={formulaLatex}
            block={false}
            className="text-indigo-200 font-semibold"
            sizeLevel="normal"
            minScale={0.48}
          />
          <div className="absolute right-2 bottom-1.5 opacity-30 group-hover:opacity-100 transition pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-slate-300 leading-relaxed mt-2 line-clamp-2">
          {explanation}
        </p>
      </div>

      {/* Sample problem test trigger */}
      {sample && (
        <div
          className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={sample}>
            💡 {sample}
          </span>
          <button
            type="button"
            onClick={() => onSelectSample(sample)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 shrink-0 ml-1 group-hover:translate-x-0.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{isBn ? 'সমাধান দেখুন' : 'Solve'}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
});

FormulaCard.displayName = 'FormulaCard';

export const FormulaBook: React.FC<FormulaBookProps> = ({ onSelectSample, language }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // PDF Download States
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isCategoryDownloading, setIsCategoryDownloading] = useState<boolean>(false);
  const [categoryProgressText, setCategoryProgressText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Large Modal Zoom State
  const [activeFormula, setActiveFormula] = useState<FormulaItem | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'huge'>('normal');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Primary Subject Categories
  const categories = useMemo(
    () => [
      { id: 'all', labelBn: 'সকল বিষয়', labelEn: 'All Topics', icon: <Grid className="w-4 h-4" /> },
      { id: 'arithmetic', labelBn: 'পাটিগণিত', labelEn: 'Arithmetic', icon: <Calculator className="w-4 h-4 text-amber-400" /> },
      { id: 'algebra', labelBn: 'বীজগণিত', labelEn: 'Algebra', icon: <Sparkles className="w-4 h-4 text-blue-400" /> },
      { id: 'mensuration', labelBn: 'পরিমিতি ও পরিসীমা', labelEn: 'Mensuration', icon: <Square className="w-4 h-4 text-emerald-400" /> },
      { id: 'geometry', labelBn: 'জ্যামিতি ও স্থানাঙ্ক', labelEn: 'Geometry', icon: <Compass className="w-4 h-4 text-cyan-400" /> },
      { id: 'trigonometry', labelBn: 'ত্রিকোণমিতি', labelEn: 'Trigonometry', icon: <span className="font-bold text-xs text-purple-400">Δ</span> },
      { id: 'statistics', labelBn: 'পরিসংখ্যান ও উচ্চতর', labelEn: 'Statistics', icon: <PieChart className="w-4 h-4 text-rose-400" /> },
    ],
    []
  );

  const classLevels = useMemo(
    () => [
      { id: 'all', labelBn: 'সকল শ্রেণি', labelEn: 'All Classes' },
      { id: 'primary', labelBn: 'প্রাথমিক (১-৫)', labelEn: 'Primary (1-5)' },
      { id: 'middle', labelBn: 'নিম্ন-মাধ্যমিক (৬-৮)', labelEn: 'Middle (6-8)' },
      { id: 'secondary', labelBn: 'মাধ্যমিক (৯-১০)', labelEn: 'Secondary (9-10)' },
      { id: 'higher', labelBn: 'উচ্চমাধ্যমিক (১১-১২+)', labelEn: 'Higher (11-12+)' },
    ],
    []
  );

  const getCategoryCount = useCallback((catId: string) => {
    if (catId === 'all') return FORMULA_LIBRARY.length;
    return FORMULA_LIBRARY.filter(
      (f) => f.category === catId || (catId === 'statistics' && f.category === 'higher_math')
    ).length;
  }, []);

  const filteredFormulas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FORMULA_LIBRARY.filter((f) => {
      const matchesClass = selectedClass === 'all' || f.classLevel === selectedClass;
      const matchesCat =
        selectedCategory === 'all' ||
        f.category === selectedCategory ||
        (selectedCategory === 'statistics' && f.category === 'higher_math');

      if (!matchesClass || !matchesCat) return false;
      if (!query) return true;

      const title = language === 'bn' ? f.titleBn : f.titleEn;
      const explanation = language === 'bn' ? f.explanationBn : f.explanationEn;
      const grade = (language === 'bn' ? f.gradeBn : f.gradeEn) || '';
      const latex = (language === 'bn' ? f.latexBn : f.latexEn) || f.latex || '';
      const sample = (language === 'bn' ? f.sampleProblemBn : f.sampleProblemEn) || '';

      return (
        title.toLowerCase().includes(query) ||
        explanation.toLowerCase().includes(query) ||
        grade.toLowerCase().includes(query) ||
        latex.toLowerCase().includes(query) ||
        sample.toLowerCase().includes(query) ||
        f.titleBn.toLowerCase().includes(query) ||
        f.titleEn.toLowerCase().includes(query)
      );
    });
  }, [selectedClass, selectedCategory, searchQuery, language]);

  // Grouped formulas for the comprehensive overview
  const groupedCategories = useMemo(() => {
    const groups: {
      id: string;
      labelBn: string;
      labelEn: string;
      icon: React.ReactNode;
      formulas: FormulaItem[];
    }[] = [
      {
        id: 'arithmetic',
        labelBn: 'পাটিগণিতের সকল সূত্র (লাভ, ক্ষতি, শতকরা, ক্রয়-বিক্রয়মূল্য, মুনাফা)',
        labelEn: 'Arithmetic Formulas (Profit, Loss, Percentage, Cost/Selling Price, Interest)',
        icon: <Calculator className="w-4 h-4 text-amber-400" />,
        formulas: [],
      },
      {
        id: 'algebra',
        labelBn: 'বীজগণিতের সকল সূত্র (বর্গ, ঘন, উৎপাদক, ধারা, লঘিষ্ঠ)',
        labelEn: 'Algebra Formulas (Square, Cube, Factors, Series)',
        icon: <Sparkles className="w-4 h-4 text-blue-400" />,
        formulas: [],
      },
      {
        id: 'mensuration',
        labelBn: 'পরিমিতি ও পরিসীমা (বর্গক্ষেত্র, আয়তক্ষেত্র, রম্বস, ট্রাপিজিয়াম, বৃত্ত)',
        labelEn: 'Mensuration & Perimeter (Square, Rectangle, Rhombus, Circle)',
        icon: <Square className="w-4 h-4 text-emerald-400" />,
        formulas: [],
      },
      {
        id: 'geometry',
        labelBn: 'জ্যামিতি ও স্থানাঙ্ক জ্যামিতি (পিথাগোরাস, দূরত্ব, মধ্যবিন্দু, ঢাল)',
        labelEn: 'Geometry & Coordinates (Pythagoras, Distance, Midpoint, Slope)',
        icon: <Compass className="w-4 h-4 text-cyan-400" />,
        formulas: [],
      },
      {
        id: 'trigonometry',
        labelBn: 'ত্রিকোণমিতির সকল সূত্রাবলি',
        labelEn: 'Trigonometry Formulas',
        icon: <span className="font-bold text-xs text-purple-400">Δ</span>,
        formulas: [],
      },
      {
        id: 'statistics',
        labelBn: 'পরিসংখ্যান ও উচ্চতর গণিতের সূত্রাবলি',
        labelEn: 'Statistics & Higher Math Formulas',
        icon: <PieChart className="w-4 h-4 text-rose-400" />,
        formulas: [],
      },
    ];

    filteredFormulas.forEach((f) => {
      let targetCat = f.category;
      if (targetCat === 'higher_math') targetCat = 'statistics';
      const group = groups.find((g) => g.id === targetCat);
      if (group) {
        group.formulas.push(f);
      }
    });

    return groups.filter((g) => g.formulas.length > 0);
  }, [filteredFormulas]);

  const handleCopyLatex = useCallback((id: string, latex: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Download Individual Formula as A4 PDF
  const handleDownloadA4 = useCallback(async (formula: FormulaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingId(formula.id);
      showToast(
        language === 'bn'
          ? `"${formula.titleBn}" এর A4 PDF তৈরি হচ্ছে...`
          : `Generating A4 PDF for "${formula.titleEn}"...`
      );
      await downloadFormulaA4Pdf(formula, language);
      showToast(
        language === 'bn'
          ? '✓ A4 পেপার PDF ডাউনলোড সফল হয়েছে!'
          : '✓ A4 Paper PDF downloaded successfully!'
      );
    } catch (err) {
      console.error('PDF error:', err);
      showToast(
        language === 'bn'
          ? 'PDF তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to generate PDF. Please try again.'
      );
    } finally {
      setDownloadingId(null);
    }
  }, [language, showToast]);

  // Instant Print / Save as PDF for Individual Formula (< 100ms)
  const handlePrintA4 = useCallback((formula: FormulaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    printFormulaA4(formula, language);
  }, [language]);

  // Download Category Booklet as A4 PDF
  const handleDownloadCategoryA4 = useCallback(async (customTitle?: string, customFormulas?: FormulaItem[]) => {
    const targetFormulas = customFormulas || filteredFormulas;
    if (!targetFormulas.length) return;

    const cat = categories.find((c) => c.id === selectedCategory);
    const catName =
      customTitle ||
      (language === 'bn' ? cat?.labelBn || 'সকল সূত্র' : cat?.labelEn || 'All Formulas');

    try {
      setIsCategoryDownloading(true);
      setCategoryProgressText(language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Initializing...');
      showToast(
        language === 'bn'
          ? `${catName} এর A4 PDF বুকলেট প্রস্তুত হচ্ছে...`
          : `Generating A4 PDF booklet for ${catName}...`
      );

      await downloadCategoryA4Pdf(
        catName,
        targetFormulas,
        language,
        (progress) => setCategoryProgressText(progress)
      );

      showToast(
        language === 'bn'
          ? `✓ ${catName} A4 বুকলেট ডাউনলোড সম্পন্ন হয়েছে!`
          : `✓ ${catName} A4 booklet downloaded successfully!`
      );
    } catch (err) {
      console.error('Category PDF error:', err);
      showToast(
        language === 'bn'
          ? 'বুকলেট তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Failed to generate booklet.'
      );
    } finally {
      setIsCategoryDownloading(false);
      setCategoryProgressText('');
    }
  }, [filteredFormulas, selectedCategory, categories, language, showToast]);

  // Instant Print for Category Booklet
  const handlePrintCategoryA4 = useCallback((customTitle?: string, customFormulas?: FormulaItem[]) => {
    const targetFormulas = customFormulas || filteredFormulas;
    if (!targetFormulas.length) return;
    const cat = categories.find((c) => c.id === selectedCategory);
    const catName =
      customTitle ||
      (language === 'bn' ? cat?.labelBn || 'সকল সূত্র' : cat?.labelEn || 'All Formulas');
    printCategoryA4(catName, targetFormulas, language);
  }, [filteredFormulas, selectedCategory, categories, language]);

  // Modal navigation
  const currentIndex = activeFormula
    ? filteredFormulas.findIndex((f) => f.id === activeFormula.id)
    : -1;

  const handleNextFormula = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < filteredFormulas.length - 1) {
      setActiveFormula(filteredFormulas[currentIndex + 1]);
    } else if (filteredFormulas.length > 0) {
      setActiveFormula(filteredFormulas[0]);
    }
  }, [currentIndex, filteredFormulas]);

  const handlePrevFormula = useCallback(() => {
    if (currentIndex > 0) {
      setActiveFormula(filteredFormulas[currentIndex - 1]);
    } else if (filteredFormulas.length > 0) {
      setActiveFormula(filteredFormulas[filteredFormulas.length - 1]);
    }
  }, [currentIndex, filteredFormulas]);

  // Handle keyboard ESC or arrows inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeFormula) return;
      if (e.key === 'Escape') {
        setActiveFormula(null);
      } else if (e.key === 'ArrowRight') {
        handleNextFormula();
      } else if (e.key === 'ArrowLeft') {
        handlePrevFormula();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFormula, handleNextFormula, handlePrevFormula]);

  const modalTitle = activeFormula
    ? language === 'bn'
      ? activeFormula.titleBn
      : activeFormula.titleEn
    : '';
  const modalSubtitle = activeFormula
    ? language === 'bn'
      ? activeFormula.titleEn
      : activeFormula.titleBn
    : '';
  const modalLatex = activeFormula
    ? (language === 'bn' ? activeFormula.latexBn : activeFormula.latexEn) || activeFormula.latex
    : '';
  const modalExplanation = activeFormula
    ? language === 'bn'
      ? activeFormula.explanationBn
      : activeFormula.explanationEn
    : '';
  const modalSample = activeFormula
    ? (language === 'bn' ? activeFormula.sampleProblemBn : activeFormula.sampleProblemEn) ||
      activeFormula.sampleProblem
    : '';
  const modalGrade = activeFormula
    ? (language === 'bn' ? activeFormula.gradeBn : activeFormula.gradeEn) || activeFormula.gradeBn
    : '';

  return (
    <div className="space-y-5">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border-2 border-indigo-500 text-white font-medium px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4">
          <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shadow-md shadow-indigo-500/10 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {language === 'bn' ? 'সকল বিষয়ের সূত্র ভাণ্ডার' : 'Complete Formula Library'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {FORMULA_LIBRARY.length} {language === 'bn' ? 'সূত্র' : 'Formulas'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'পাটিগণিত, বীজগণিত, পরিমিতি, জ্যামিতি ও স্থানাঙ্কের সকল সূত্র একত্রে'
                  : 'All formulas of Arithmetic, Algebra, Geometry & Mensuration together'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Booklet A4 PDF Download Button */}
            <button
              type="button"
              onClick={() => handleDownloadCategoryA4()}
              disabled={isCategoryDownloading || filteredFormulas.length === 0}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-800 border border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm active:scale-95 disabled:opacity-50"
              title={
                language === 'bn'
                  ? 'বর্তমান তালিকার সকল সূত্র A4 PDF বুকলেট আকারে দ্রুত ডাউনলোড করুন'
                  : 'Fast download current list as A4 PDF booklet'
              }
            >
              {isCategoryDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{categoryProgressText || (language === 'bn' ? 'বুকলেট তৈরি হচ্ছে...' : 'Generating...')}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {language === 'bn' ? 'সম্পূর্ণ তালিকা A4 PDF বুকলেট' : 'Download A4 Booklet'}
                  </span>
                </>
              )}
            </button>

            {/* Quick Booklet Print */}
            <button
              type="button"
              onClick={() => handlePrintCategoryA4()}
              disabled={filteredFormulas.length === 0}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1 transition shadow-sm active:scale-95 disabled:opacity-50"
              title={language === 'bn' ? 'তাত্ক্ষণিক প্রিন্ট / সেভ' : 'Instant Print / Save'}
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            {/* Instant Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'সূত্র খুঁজুন (লাভ, ক্ষতি, পিথাগোরাস, বর্গ, পরিসীমা)...'
                    : 'Search formula (profit, loss, pythagoras, square)...'
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 1. PRIMARY SUBJECT TABS */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{language === 'bn' ? 'বিষয়ভিত্তিক সকল সূত্র একসাথে সাজানো:' : 'Grouped by Subject:'}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const count = getCategoryCount(cat.id);
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 border active:scale-95 ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{cat.icon}</span>
                  <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CLASS LEVEL FILTER PILLS */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap mr-1">
            {language === 'bn' ? 'শ্রেণি:' : 'Class:'}
          </span>
          {classLevels.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedClass(lvl.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition border ${
                selectedClass === lvl.id
                  ? 'bg-slate-100 text-slate-900 border-white font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? lvl.labelBn : lvl.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Quick Reset */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          {language === 'bn'
            ? `প্রদর্শন করা হচ্ছে: ${filteredFormulas.length} টি সূত্র (একলাইনে স্পষ্ট দৃশ্যমান • A4 PDF দ্রুত ডাউনলোডযোগ্য)`
            : `Showing ${filteredFormulas.length} formulas (Single-line crisp • Fast A4 PDF download)`}
        </span>
        {(selectedClass !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
          >
            {language === 'bn' ? 'সব ফিল্টার মুছুন' : 'Reset all filters'}
          </button>
        )}
      </div>

      {/* FORMULA DISPLAY CONTAINER */}
      {/* CASE A: When "সকল বিষয়" is selected with no search query -> Show grouped by category sections */}
      {selectedCategory === 'all' && !searchQuery ? (
        <div className="space-y-8">
          {groupedCategories.map((group) => (
            <div key={group.id} className="space-y-3.5">
              {/* Category Group Header with Quick A4 Download & Print */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                    {group.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {language === 'bn' ? group.labelBn : group.labelEn}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {group.formulas.length} {language === 'bn' ? 'টি সূত্র একসাথে' : 'Formulas together'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(group.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
                  >
                    {language === 'bn' ? 'শুধুমাত্র এই বিষয় দেখুন' : 'View only this'}
                  </button>

                  {/* Fast Category A4 PDF Download */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadCategoryA4(
                        language === 'bn' ? group.labelBn : group.labelEn,
                        group.formulas
                      )
                    }
                    disabled={isCategoryDownloading}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <Download className="w-3 h-3 text-indigo-400" />
                    <span>A4 PDF</span>
                  </button>

                  {/* Instant Print */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePrintCategoryA4(
                        language === 'bn' ? group.labelBn : group.labelEn,
                        group.formulas
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title={language === 'bn' ? 'তাত্ক্ষণিক প্রিন্ট' : 'Instant Print'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards Grid for this category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {group.formulas.map((f) => (
                  <FormulaCard
                    key={f.id}
                    formula={f}
                    language={language}
                    isDownloading={downloadingId === f.id}
                    isCopied={copiedId === f.id}
                    onDownload={handleDownloadA4}
                    onPrint={handlePrintA4}
                    onCopy={handleCopyLatex}
                    onSelectSample={onSelectSample}
                    onOpenModal={setActiveFormula}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* CASE B: Specific category or active search query */
        <div className="space-y-4">
          {filteredFormulas.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
                ?
              </div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'কোনো সূত্র পাওয়া যায়নি' : 'No formulas found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {language === 'bn'
                  ? 'আপনার অনুসন্ধানের সাথে কোনো সূত্র মেলেনি। অন্য শব্দ দিয়ে খুঁজে দেখুন বা ফিল্টার পরিবর্তন করুন।'
                  : 'Try searching with different keywords like pythagoras, area, or reset filters.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedClass('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                {language === 'bn' ? 'সকল সূত্র দেখুন' : 'View all formulas'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredFormulas.map((f) => (
                <FormulaCard
                  key={f.id}
                  formula={f}
                  language={language}
                  isDownloading={downloadingId === f.id}
                  isCopied={copiedId === f.id}
                  onDownload={handleDownloadA4}
                  onPrint={handlePrintA4}
                  onCopy={handleCopyLatex}
                  onSelectSample={onSelectSample}
                  onOpenModal={setActiveFormula}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* LARGE ZOOM / STUDY MODAL */}
      {activeFormula && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setActiveFormula(null)}
        >
          <div
            className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl text-left relative space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {modalGrade}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {getCategoryLabel(activeFormula.category, language)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 mr-2">
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel('normal')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      fontSizeLevel === 'normal'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Normal Size"
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel('large')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      fontSizeLevel === 'large'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Large Size"
                  >
                    1.5x
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel('huge')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      fontSizeLevel === 'huge'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Huge Size"
                  >
                    2x
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFormula(null)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shadow-sm"
                  title={language === 'bn' ? 'বন্ধ করুন (Esc)' : 'Close (Esc)'}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Formula Titles */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {modalTitle}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-300 font-mono">
                {modalSubtitle}
              </p>
            </div>

            {/* BIG PROMINENT FORMULA DISPLAY BOX - SINGLE LINE AUTO-SCALED */}
            <div className="relative bg-slate-950/95 border-2 border-indigo-500/50 rounded-2xl p-3 sm:p-5 md:p-6 text-center shadow-2xl shadow-indigo-500/10 overflow-hidden ring-4 ring-indigo-500/10 flex flex-col justify-center">
              <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none rounded-2xl" />

              <div className="w-full flex items-center justify-center min-h-[4rem] py-2 sm:py-3">
                <FitMath
                  content={modalLatex}
                  block={true}
                  className="text-white font-extrabold tracking-wide drop-shadow-md"
                  sizeLevel={fontSizeLevel}
                  minScale={0.38}
                />
              </div>

              {/* Action buttons inside the formula box */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    {language === 'bn' ? 'সম্পূর্ণ ও স্পষ্ট একলাইনে গাণিতিক রূপ' : 'Single-Line Crisp Math'}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  {/* A4 PDF Download Button inside Modal */}
                  <button
                    type="button"
                    onClick={() => handleDownloadA4(activeFormula)}
                    disabled={downloadingId === activeFormula.id}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm active:scale-95 disabled:opacity-50"
                    title={language === 'bn' ? 'A4 পেপারে PDF ডাউনলোড করুন' : 'Download A4 PDF'}
                  >
                    {downloadingId === activeFormula.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                        <span>{language === 'bn' ? 'PDF তৈরি হচ্ছে...' : 'Generating PDF...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>{language === 'bn' ? '📥 A4 PDF ডাউনলোড' : '📥 Download A4 PDF'}</span>
                      </>
                    )}
                  </button>

                  {/* Instant Print Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintA4(activeFormula)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center space-x-1.5 transition border border-slate-700 shrink-0"
                    title={language === 'bn' ? 'তাত্ক্ষণিক প্রিন্ট / সেভ' : 'Instant Print'}
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-300" />
                    <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                  </button>

                  {/* Copy LaTeX button */}
                  <button
                    type="button"
                    onClick={(e) => handleCopyLatex(activeFormula.id, modalLatex, e)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center space-x-1.5 transition border border-slate-700 shrink-0"
                  >
                    {copiedId === activeFormula.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'LaTeX কপি' : 'Copy LaTeX'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Explanation Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>
                  {language === 'bn' ? 'বিস্তারিত ব্যাখ্যা ও অর্থ:' : 'Detailed Explanation & Meaning:'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {modalExplanation}
              </p>
            </div>

            {/* Example Problem & Instant Solve Button */}
            {modalSample && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      {language === 'bn' ? 'ব্যবহারিক উদাহরণ অংক:' : 'Practical Example Problem:'}
                    </span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {language === 'bn' ? '১-ক্লিক সমাধান' : '1-Click Solve'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-100 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {modalSample}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormula(null);
                    onSelectSample(modalSample);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? '🚀 এই উদাহরণটি ধাপে ধাপে সমাধান করুন'
                      : '🚀 Solve this example step-by-step'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}

            {/* Bottom Carousel Navigation */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevFormula}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'bn' ? 'পূর্ববর্তী সূত্র' : 'Previous'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormula(null)}
                className="text-xs text-slate-400 hover:text-white transition px-2 py-1 cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>

              <button
                type="button"
                onClick={handleNextFormula}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
              >
                <span>{language === 'bn' ? 'পরবর্তী সূত্র' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
