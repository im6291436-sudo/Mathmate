import React, { useState } from 'react';
import { SolvedProblem } from '../types';
import { MathView } from './MathView';
import { MathGraph } from './MathGraph';
import { TutorChat } from './TutorChat';
import {
  Bookmark,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Globe,
  Printer,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SolutionViewerProps {
  problem: SolvedProblem;
  onToggleBookmark: (id: string) => void;
  language: 'bn' | 'en';
}

export const SolutionViewer: React.FC<SolutionViewerProps> = ({ problem, onToggleBookmark, language }) => {
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [practiceAnswerIndex, setPracticeAnswerIndex] = useState<number | null>(null);

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(problem.finalAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleShareSolution = async () => {
    // Build a nicely formatted step-by-step summary for social media & messaging apps
    const stepsFormatted = problem.steps
      .map(
        (s) =>
          `📌 ধাপ ${s.stepNumber}: ${s.title}\n${s.latex ? `   ${s.latex}\n` : ''}   ${s.explanation}`
      )
      .join('\n\n');

    const stepsFormattedEn = problem.steps
      .map(
        (s) =>
          `📌 Step ${s.stepNumber}: ${s.title}\n${s.latex ? `   ${s.latex}\n` : ''}   ${s.explanation}`
      )
      .join('\n\n');

    const shareTitle = `${problem.problemTitle} | Mathmate AI`;
    const shareText =
      language === 'bn'
        ? `📐 গণিত সমস্যা: ${problem.problemTitle}\n\n` +
          `❓ প্রশ্ন: ${problem.detectedProblemText}\n\n` +
          `✅ চূড়ান্ত উত্তর: ${problem.finalAnswer}\n\n` +
          `🪜 ধাপে ধাপে সমাধান:\n${stepsFormatted}\n\n` +
          (problem.shortcutMethod ? `⚡ শর্টকাট কৌশল: ${problem.shortcutMethod}\n\n` : '') +
          `🤖 Mathmate AI Math Solver দিয়ে সমাধান করা হয়েছে।`
        : `📐 Math Problem: ${problem.problemTitle}\n\n` +
          `❓ Question: ${problem.detectedProblemText}\n\n` +
          `✅ Final Answer: ${problem.finalAnswer}\n\n` +
          `🪜 Step-by-Step Solution:\n${stepsFormattedEn}\n\n` +
          (problem.shortcutMethod ? `⚡ Shortcut Technique: ${problem.shortcutMethod}\n\n` : '') +
          `🤖 Solved using Mathmate AI Math Solver.`;

    const shareUrl = window.location.href;

    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    // Attempt Web Share API if supported
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          // If browser rejects combined url & text, share text with url appended
          await navigator.share({
            title: shareTitle,
            text: `${shareText}\n\n🔗 ${shareUrl}`,
          });
        } else {
          await navigator.share(shareData);
        }
        setSharedSuccess(true);
        setTimeout(() => setSharedSuccess(false), 3000);
        return;
      } catch (err: any) {
        // If user actively cancelled the native share sheet, ignore
        if (err?.name === 'AbortError') {
          return;
        }
        // If full text is too long for native share or rejected, try lightweight share
        try {
          await navigator.share({
            title: shareTitle,
            text: `${problem.problemTitle}\n\n${problem.detectedProblemText}\n\nউত্তর / Answer: ${problem.finalAnswer}`,
            url: shareUrl,
          });
          setSharedSuccess(true);
          setTimeout(() => setSharedSuccess(false), 3000);
          return;
        } catch (innerErr: any) {
          if (innerErr?.name === 'AbortError') return;
        }
      }
    }

    // Fallback if Web Share API is unsupported or failed: Copy to clipboard
    try {
      const fullFallbackText = `${shareTitle}\n\n${shareText}\n\n🔗 ${shareUrl}`;
      await navigator.clipboard.writeText(fullFallbackText);
      setSharedSuccess(true);
      setTimeout(() => setSharedSuccess(false), 3000);
    } catch {
      // Fallback failed silently
    }
  };

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Build text to speak
    const textToSpeak = `${problem.problemTitle}. চূড়ান্ত উত্তর: ${problem.finalAnswer}. ` +
      problem.steps.map((s) => `${s.title}. ${s.explanation}`).join('. ');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePracticeSelect = (index: number) => {
    if (practiceAnswerIndex !== null) return;
    setPracticeAnswerIndex(index);
    if (problem.similarPracticeProblem && index === problem.similarPracticeProblem.correctOptionIndex) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Problem Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
              {problem.topic}
            </span>
            <span
              className={`px-2.5 py-1 rounded-xl font-semibold text-xs border ${
                problem.difficulty === 'Easy' || problem.difficulty === 'সহজ'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : problem.difficulty === 'Hard' || problem.difficulty === 'কঠিন'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Share Solution */}
            <button
              onClick={handleShareSolution}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                sharedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-500/40'
              }`}
              title={language === 'bn' ? 'সমাধান শেয়ার করুন (Share Solution)' : 'Share Solution via Social Media / Apps'}
            >
              {sharedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Share2 className="w-4 h-4" />}
              <span>
                {sharedSuccess
                  ? (language === 'bn' ? 'শেয়ার/কপি হয়েছে' : 'Shared!')
                  : (language === 'bn' ? 'শেয়ার' : 'Share')}
              </span>
            </button>

            {/* Audio narration */}
            <button
              onClick={handleSpeechToggle}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition ${
                isSpeaking
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Listen to solution"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isSpeaking
                  ? (language === 'bn' ? 'থামান' : 'Stop')
                  : (language === 'bn' ? 'শুনুন (Audio)' : 'Listen')}
              </span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(problem.id)}
              className={`p-2.5 rounded-xl border transition ${
                problem.isBookmarked
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${problem.isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Print / Export */}
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Print Solution"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {problem.problemTitle}
        </h1>

        {/* Detected Original Question */}
        <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              {language === 'bn' ? 'শনাক্তকৃত সমস্যা (Identified Problem):' : 'Identified Math Problem:'}
            </span>
            {problem.inputImage && (
              <span className="text-[11px] text-indigo-400">📸 ফটো স্ক্যান থেকে শনাক্ত</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            {problem.inputImage && (
              <img
                src={problem.inputImage}
                alt="Source problem"
                className="w-24 h-24 object-contain rounded-xl border border-slate-700 bg-black shrink-0"
              />
            )}
            <div className="flex-1 space-y-2">
              <div className="text-slate-200 text-sm sm:text-base leading-relaxed">
                {problem.detectedProblemText}
              </div>
              {problem.detectedProblemLatex && (
                <div className="p-3 bg-slate-900 rounded-xl overflow-x-auto text-indigo-300">
                  <MathView content={problem.detectedProblemLatex} block={true} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Final Answer Card */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'চূড়ান্ত উত্তর (Final Answer)' : 'Final Answer'}</span>
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              <MathView content={problem.finalAnswer} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Share Solution Button */}
            <button
              onClick={handleShareSolution}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                sharedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-md shadow-indigo-600/20'
              }`}
              title={language === 'bn' ? 'সোশ্যাল মিডিয়া বা মেসেজিংয়ে শেয়ার করুন' : 'Share solution via Web Share API'}
            >
              {sharedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Share2 className="w-4 h-4" />}
              <span>
                {sharedSuccess
                  ? (language === 'bn' ? 'শেয়ার/কপি হয়েছে!' : 'Shared / Copied!')
                  : (language === 'bn' ? 'সমাধান শেয়ার করুন' : 'Share Solution')}
              </span>
            </button>

            <button
              onClick={handleCopyAnswer}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/50 text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              {copiedAnswer ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAnswer ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'উত্তর কপি করুন' : 'Copy Answer')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            🪜
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {language === 'bn' ? 'ধাপে ধাপে বিস্তারিত সমাধান' : 'Step-by-Step Detailed Solution'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'প্রতিটি ধাপ সহজ ও প্রাঞ্জলভাবে ব্যাখ্যা করা হয়েছে'
                : 'Each mathematical step explained clearly and rigorously'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {problem.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition space-y-3"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  {step.title}
                </h3>
              </div>

              {step.latex && (
                <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 overflow-x-auto text-indigo-200">
                  <MathView content={step.latex} block={true} />
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-10">
                <MathView content={step.explanation} />
              </p>
            </div>
          ))}
        </div>

        {/* Verification Check */}
        {problem.verification && (
          <div className="p-5 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'উত্তরের সত্যতা যাচাই (Verification)' : 'Verification / Proof Check'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <MathView content={problem.verification} />
            </p>
          </div>
        )}

        {/* Share Problem & Full Solution Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? '💡 আপনার বন্ধুদের সাথে বা মেসেঞ্জারে এই গণিত ও সম্পূর্ণ সমাধানটি শেয়ার করুন:'
              : '💡 Share this math problem and step-by-step solution with classmates or study groups:'}
          </p>
          <button
            onClick={handleShareSolution}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              sharedSuccess
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-md shadow-indigo-600/20'
            }`}
          >
            {sharedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Share2 className="w-4 h-4" />}
            <span>
              {sharedSuccess
                ? (language === 'bn' ? 'শেয়ার / কপি সম্পন্ন!' : 'Shared / Copied!')
                : (language === 'bn' ? 'সমাধান শেয়ার করুন (Share)' : 'Share Solution')}
            </span>
          </button>
        </div>
      </div>

      {/* Key Formulas Used & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Formulas */}
        {problem.keyFormulas && problem.keyFormulas.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white text-base">
                {language === 'bn' ? 'প্রয়োজনীয় সূত্রাবলি' : 'Key Formulas Used'}
              </h3>
            </div>
            <div className="space-y-2.5">
              {problem.keyFormulas.map((form, idx) => (
                <div key={idx} className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs sm:text-sm text-indigo-200">
                  <MathView content={form} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortcut / Hack */}
        {problem.shortcutMethod && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-white text-base">
                {language === 'bn' ? 'শর্টকাট বা দ্রুত সমাধান কৌশল' : 'Shortcut & Mental Math Trick'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 rounded-xl p-4 border border-slate-800">
              <MathView content={problem.shortcutMethod} />
            </p>
          </div>
        )}
      </div>

      {/* Interactive 2D Graph (if plottable) */}
      {problem.graphData && problem.graphData.canPlot && (
        <MathGraph graphData={problem.graphData} language={language} />
      )}

      {/* Common Mistakes & Real World Application */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problem.commonMistakes && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-white text-base">
                {language === 'bn' ? 'সাধারণ ভুল ও সতর্কতা' : 'Common Mistakes to Avoid'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 rounded-xl p-4 border border-slate-800">
              <MathView content={problem.commonMistakes} />
            </p>
          </div>
        )}

        {problem.realWorldApplication && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Globe className="w-5 h-5" />
              <h3 className="font-semibold text-white text-base">
                {language === 'bn' ? 'বাস্তব জীবনে প্রয়োগ' : 'Real-World Application'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 rounded-xl p-4 border border-slate-800">
              <MathView content={problem.realWorldApplication} />
            </p>
          </div>
        )}
      </div>

      {/* Interactive Practice Problem */}
      {problem.similarPracticeProblem && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {language === 'bn' ? 'অনুরূপ অনুশীলন পরীক্ষা (Practice Problem)' : 'Similar Practice Test'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'নিজেকে যাচাই করে সঠিক উত্তরটি নির্বাচন করুন' : 'Test your understanding now'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 text-sm sm:text-base font-medium text-white">
            <MathView content={problem.similarPracticeProblem.question} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {problem.similarPracticeProblem.options.map((opt, i) => {
              const isSelected = practiceAnswerIndex === i;
              const isCorrect = i === problem.similarPracticeProblem?.correctOptionIndex;

              let btnClass = 'bg-slate-950 border-slate-800 hover:border-indigo-500/50 text-slate-200';
              if (practiceAnswerIndex !== null) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnClass = 'bg-red-950/70 border-red-500 text-red-200';
                } else {
                  btnClass = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  disabled={practiceAnswerIndex !== null}
                  onClick={() => handlePracticeSelect(i)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm font-medium transition ${btnClass}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <MathView content={opt} />
                  </div>
                  {practiceAnswerIndex !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {practiceAnswerIndex !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                </button>
              );
            })}
          </div>

          {practiceAnswerIndex !== null && problem.similarPracticeProblem.explanation && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs sm:text-sm text-indigo-200 animate-in fade-in">
              <span className="font-semibold block mb-1">
                💡 {language === 'bn' ? 'ব্যাখ্যা:' : 'Explanation:'}
              </span>
              <MathView content={problem.similarPracticeProblem.explanation} />
            </div>
          )}
        </div>
      )}

      {/* AI Tutor Chat section */}
      <div className="space-y-4">
        <button
          onClick={() => setShowTutorChat(!showTutorChat)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-purple-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-200 font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg"
        >
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>
            {showTutorChat
              ? (language === 'bn' ? 'AI গণিত শিক্ষক চ্যাট লুকান' : 'Hide Math Tutor Chat')
              : (language === 'bn' ? 'এই অংক নিয়ে AI শিক্ষকের সাথে কথা বলুন (চ্যাট করুন)' : 'Ask Follow-up Questions to AI Math Tutor')}
          </span>
        </button>

        {showTutorChat && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <TutorChat currentProblem={problem} language={language} />
          </div>
        )}
      </div>

      {/* Floating Share / Copy Toast Notification */}
      {sharedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-slate-900/95 backdrop-blur-md border border-emerald-500/60 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            {language === 'bn'
              ? 'সমাধান ও লিঙ্ক সফলভাবে শেয়ার / ক্লিপবোর্ডে কপি করা হয়েছে!'
              : 'Solution & link successfully shared / copied to clipboard!'}
          </span>
        </div>
      )}
    </div>
  );
};
