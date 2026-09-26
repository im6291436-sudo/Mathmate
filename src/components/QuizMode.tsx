import React, { useState } from 'react';
import { QuizData, QuizQuestion } from '../types';
import { MathView } from './MathView';
import { CheckCircle2, XCircle, HelpCircle, Trophy, RotateCcw, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModeProps {
  language: 'bn' | 'en';
}

export const QuizMode: React.FC<QuizModeProps> = ({ language }) => {
  const [topic, setTopic] = useState<string>('বীজগণিত (Algebra)');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [loading, setLoading] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const topicsList = [
    { labelBn: 'বীজগণিত (Algebra)', labelEn: 'Algebra', value: 'Algebra' },
    { labelBn: 'জ্যামিতি ও পরিমিতি (Geometry)', labelEn: 'Geometry', value: 'Geometry' },
    { labelBn: 'ত্রিকোণমিতি (Trigonometry)', labelEn: 'Trigonometry', value: 'Trigonometry' },
    { labelBn: 'ক্যালকুলাস (Calculus)', labelEn: 'Calculus', value: 'Calculus' },
    { labelBn: 'পাটিগণিত ও লাভ-ক্ষতি (Arithmetic)', labelEn: 'Arithmetic', value: 'Arithmetic' },
    { labelBn: 'সম্ভাবনা ও পরিসংখ্যান (Probability)', labelEn: 'Probability & Statistics', value: 'Probability' },
  ];

  const handleStartQuiz = async () => {
    setLoading(true);
    setQuizData(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowHint(false);
    setScore(0);
    setQuizCompleted(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          count: 4,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.quiz && Array.isArray(data.quiz.questions)) {
        setQuizData(data.quiz);
      } else {
        throw new Error('Invalid quiz response');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered

    const currentQ = quizData?.questions[currentIndex];
    const isCorrect = currentQ && currentQ.correctIndex === optIndex;

    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));

    if (isCorrect) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentIndex + 1 < quizData.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint(false);
    } else {
      setQuizCompleted(true);
      if (score >= quizData.questions.length / 2) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const currentQ: QuizQuestion | undefined = quizData?.questions[currentIndex];
  const answeredOption = selectedAnswers[currentIndex];
  const isAnswered = answeredOption !== undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Setup Card */}
      {!quizData && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'bn' ? 'গণিত কুইজ ও অনুশীলন টেস্ট' : 'Math Quiz & Practice Test'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {language === 'bn'
                ? 'আপনার পছন্দের গণিত বিষয়ের ওপর ইন্টারেক্টিভ কুইজ খেলে দক্ষতা বৃদ্ধি করুন'
                : 'Test and sharpen your skills with AI-generated dynamic math quizzes'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'bn' ? 'টপিক নির্বাচন করুন:' : 'Select Topic:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topicsList.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTopic(t.labelBn)}
                    className={`p-3 rounded-xl text-left border text-xs sm:text-sm font-medium transition ${
                      topic === t.labelBn
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {language === 'bn' ? t.labelBn : t.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'bn' ? 'কাঠিন্যের মাত্রা:' : 'Difficulty:'}
              </label>
              <div className="flex gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition ${
                      difficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {diff === 'Easy'
                      ? language === 'bn' ? 'সহজ' : 'Easy'
                      : diff === 'Medium'
                      ? language === 'bn' ? 'মাঝারি' : 'Medium'
                      : language === 'bn' ? 'কঠিন' : 'Hard'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-xl shadow-indigo-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{language === 'bn' ? 'কুইজ শুরু করুন' : 'Start Practice Quiz'}</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">
            {language === 'bn' ? 'নতুন কুইজ প্রশ্ন তৈরি করা হচ্ছে...' : 'Generating quiz questions with AI...'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'কয়েক সেকেন্ড অপেক্ষা করুন' : 'Hold on a few moments'}
          </p>
        </div>
      )}

      {/* Quiz Completed Result */}
      {quizCompleted && quizData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {language === 'bn' ? 'কুইজ সম্পন্ন হয়েছে!' : 'Quiz Completed!'}
            </h3>
            <p className="text-sm text-slate-400">
              {language === 'bn'
                ? `আপনি ${quizData.questions.length}টির মধ্যে ${score}টি প্রশ্নের সঠিক উত্তর দিয়েছেন!`
                : `You answered ${score} out of ${quizData.questions.length} questions correctly!`}
            </p>
          </div>

          <div className="inline-block p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-mono">
              {Math.round((score / quizData.questions.length) * 100)}%
            </div>
            <div className="text-xs text-slate-500 uppercase font-semibold mt-1">
              {score >= 3
                ? language === 'bn' ? 'অসাধারণ পারফরম্যান্স! 🌟' : 'Excellent Performance! 🌟'
                : language === 'bn' ? 'ভালো প্রচেষ্টা! আরও অনুশীলন করুন 💪' : 'Good effort! Keep practicing 💪'}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStartQuiz}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center space-x-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'bn' ? 'আবার খেলুন' : 'Play Again'}</span>
            </button>
            <button
              onClick={() => {
                setQuizData(null);
                setQuizCompleted(false);
              }}
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
            >
              {language === 'bn' ? 'টপিক পরিবর্তন' : 'Change Topic'}
            </button>
          </div>
        </div>
      )}

      {/* Active Question */}
      {quizData && !quizCompleted && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300">
                {quizData.topic}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'bn'
                  ? `প্রশ্ন ${currentIndex + 1} / ${quizData.questions.length}`
                  : `Question ${currentIndex + 1} of ${quizData.questions.length}`}
              </span>
            </div>
            <div className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
              {language === 'bn' ? `স্কোর: ${score}` : `Score: ${score}`}
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80">
            <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
              <MathView content={currentQ.question} />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = answeredOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnClass = 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50 text-slate-200';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200';
                } else if (isSelected) {
                  btnClass = 'bg-red-950/70 border-red-500/80 text-red-200';
                } else {
                  btnClass = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between text-sm font-medium transition ${btnClass}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <MathView content={option} />
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Hint Trigger */}
          {currentQ.hint && !isAnswered && (
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? (language === 'bn' ? 'ইঙ্গিত লুকান' : 'Hide hint') : (language === 'bn' ? 'ইঙ্গিত / সূত্র দেখতে চান?' : 'Need a hint?')}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200 leading-relaxed">
                  💡 <MathView content={currentQ.hint} />
                </div>
              )}
            </div>
          )}

          {/* Explanation when answered */}
          {isAnswered && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl text-xs sm:text-sm text-indigo-200 leading-relaxed">
                <span className="font-semibold text-indigo-300 block mb-1">
                  📘 {language === 'bn' ? 'ব্যাখ্যা ও সমাধান:' : 'Explanation:'}
                </span>
                <MathView content={currentQ.explanation} />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition"
                >
                  <span>
                    {currentIndex + 1 === quizData.questions.length
                      ? language === 'bn' ? 'ফলাফল দেখুন' : 'See Results'
                      : language === 'bn' ? 'পরবর্তী প্রশ্ন' : 'Next Question'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
