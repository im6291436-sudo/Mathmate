import React, { useState } from 'react';
import {
  ChevronDown,
  Delete,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Calculator,
  Superscript,
  Square,
  Divide,
  CornerDownLeft,
} from 'lucide-react';

export type KeyCategory =
  | 'basic'
  | 'algebra'
  | 'calculus'
  | 'trig'
  | 'matrix';

interface MathKeyboardProps {
  onInsert: (symbol: string, cursorOffset?: number) => void;
  onBackspace: () => void;
  onClear: () => void;
  onMoveCursor?: (direction: 'left' | 'right') => void;
  onSolve?: () => void;
  language: 'bn' | 'en';
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onMoveCursor,
  onSolve,
  language,
}) => {
  const [activeCategory, setActiveCategory] = useState<KeyCategory>('basic');
  const [isAbcMode, setIsAbcMode] = useState(false);

  // Helper to trigger insert
  const handleKeyClick = (text: string, cursorOffset = 0) => {
    onInsert(text, cursorOffset);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-700/70 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all">
      {/* 1. TOP POWER & ROOT QUICK ACCESS BAR - Direct visual characters (no 5^3, types real ⁵, ³, ², √) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-2 sm:p-2.5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase flex items-center space-x-1">
            <Superscript className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {language === 'bn' ? 'আসল পাওয়ার ও রুট (সরাসরি প্রদর্শিত):' : 'Visual Powers & Roots:'}
            </span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {language === 'bn' ? '✓ কোন ^ চিহ্ন থাকবে না' : '✓ Direct math view'}
          </span>
        </div>

        {/* Big tactile equation builders: ², ³, ⁿ, √, ∛, ⁿ√, ( ), | |, a/b */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {/* Square ² */}
          <button
            type="button"
            onClick={() => handleKeyClick('²')}
            className="h-11 rounded-xl bg-indigo-950/70 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-200 font-serif font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="Square: ²"
          >
            <span className="group-hover:scale-110 transition-transform">
              <span className="italic">x</span>²
            </span>
          </button>

          {/* Cube ³ */}
          <button
            type="button"
            onClick={() => handleKeyClick('³')}
            className="h-11 rounded-xl bg-indigo-950/70 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-200 font-serif font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="Cube: ³"
          >
            <span className="group-hover:scale-110 transition-transform">
              <span className="italic">x</span>³
            </span>
          </button>

          {/* Power ⁿ (General power) */}
          <button
            type="button"
            onClick={() => handleKeyClick('ⁿ')}
            className="h-11 rounded-xl bg-indigo-900/60 border border-indigo-400/60 hover:bg-indigo-500 hover:text-white text-indigo-100 font-serif font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group relative ring-1 ring-indigo-500/30"
            title="Power: ⁿ"
          >
            <span className="group-hover:scale-110 transition-transform">
              <span className="italic">x</span>ⁿ
            </span>
          </button>

          {/* Square Root √ */}
          <button
            type="button"
            onClick={() => handleKeyClick('√()', 1)}
            className="h-11 rounded-xl bg-purple-950/70 border border-purple-500/40 hover:bg-purple-600 hover:text-white text-purple-200 font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group ring-1 ring-purple-500/30"
            title="Square Root: √()"
          >
            <span className="group-hover:scale-110 transition-transform font-serif flex items-center text-base">
              √<span className="text-[11px] text-purple-300 ml-0.5">( )</span>
            </span>
          </button>

          {/* Cube Root ∛ */}
          <button
            type="button"
            onClick={() => handleKeyClick('∛()', 1)}
            className="h-11 rounded-xl bg-purple-950/70 border border-purple-500/40 hover:bg-purple-600 hover:text-white text-purple-200 font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="Cube Root: ∛()"
          >
            <span className="group-hover:scale-110 transition-transform font-serif flex items-center text-base">
              ∛<span className="text-[11px] text-purple-300 ml-0.5">( )</span>
            </span>
          </button>

          {/* N-th Root ⁿ√ */}
          <button
            type="button"
            onClick={() => handleKeyClick('ⁿ√()', 1)}
            className="h-11 rounded-xl bg-purple-900/60 border border-purple-400/50 hover:bg-purple-500 hover:text-white text-purple-100 font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="n-th Root: ⁿ√()"
          >
            <span className="group-hover:scale-110 transition-transform font-serif flex items-center text-base">
              ⁿ√<span className="text-[11px] text-purple-300 ml-0.5">( )</span>
            </span>
          </button>

          {/* Fraction a/b */}
          <button
            type="button"
            onClick={() => handleKeyClick('/ ')}
            className="h-11 rounded-xl bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-emerald-200 text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center group ring-1 ring-emerald-500/30"
            title="Fraction: a / b"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="text-[9px] border border-emerald-400/80 px-1 rounded-sm mb-0.5 font-bold">a</span>
              <span className="w-5 h-[1.5px] bg-emerald-400 block" />
              <span className="text-[9px] border border-emerald-400/80 px-1 rounded-sm mt-0.5 font-bold">b</span>
            </div>
          </button>

          {/* Subscript x_n */}
          <button
            type="button"
            onClick={() => handleKeyClick('ₙ')}
            className="h-11 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-serif font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="Subscript: ₙ"
          >
            <span className="italic">x</span>
            <span className="text-xs ml-0.5 text-indigo-300 font-bold">ₙ</span>
          </button>

          {/* Parentheses ( ) */}
          <button
            type="button"
            onClick={() => handleKeyClick('()', 1)}
            className="h-11 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-serif font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="Parentheses: ( )"
          >
            <span className="text-base text-amber-300 font-bold">( )</span>
          </button>

          {/* Absolute Value | | */}
          <button
            type="button"
            onClick={() => handleKeyClick('||', 1)}
            className="h-11 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-serif font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center group"
            title="Absolute Value: | |"
          >
            <span className="text-base text-amber-300 font-bold">| |</span>
          </button>
        </div>
      </div>

      {/* 2. MODE & CATEGORY SELECTOR BAR */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAbcMode(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
              !isAbcMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>123 ম্যাথ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAbcMode(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
              isAbcMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>abc চলক</span>
          </button>
        </div>

        {/* Math sub-categories */}
        {!isAbcMode && (
          <div className="flex items-center space-x-1 overflow-x-auto text-xs py-0.5">
            {[
              { id: 'basic', labelBn: 'মৌলিক', labelEn: 'Basic' },
              { id: 'algebra', labelBn: 'বীজগণিত', labelEn: 'Algebra' },
              { id: 'trig', labelBn: 'ত্রিকোণমিতি', labelEn: 'Trig' },
              { id: 'calculus', labelBn: 'ক্যালকুলাস', labelEn: 'Calculus' },
              { id: 'matrix', labelBn: 'ম্যাট্রিক্স', labelEn: 'Matrix' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as KeyCategory)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition font-medium ${
                  activeCategory === tab.id
                    ? 'bg-slate-800 text-indigo-300 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>
        )}

        <div className="shrink-0 flex items-center space-x-1">
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-900 transition"
          >
            {language === 'bn' ? 'সব মুছুন' : 'Clear'}
          </button>
        </div>
      </div>

      {/* 3. MAIN KEYPAD */}
      <div className="p-2 sm:p-3 bg-slate-950/90 select-none">
        {isAbcMode ? (
          /* FULL ALPHABET MODE */
          <div className="space-y-1.5 animate-in fade-in duration-150">
            {/* Row 1 */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleKeyClick(char)}
                  className="h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-100 font-mono text-base font-semibold active:scale-95 transition flex items-center justify-center"
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 px-2">
              {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleKeyClick(char)}
                  className="h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-100 font-mono text-base font-semibold active:scale-95 transition flex items-center justify-center"
                >
                  {char}
                </button>
              ))}
              <button
                type="button"
                onClick={onBackspace}
                className="h-11 rounded-xl bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/60 text-rose-300 font-mono text-sm active:scale-95 transition flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-8 gap-1 sm:gap-1.5 px-4">
              {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleKeyClick(char)}
                  className="h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-100 font-mono text-base font-semibold active:scale-95 transition flex items-center justify-center"
                >
                  {char}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeyClick(' ')}
                className="h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition flex items-center justify-center"
              >
                Space
              </button>
            </div>

            {/* Common math constants in abc mode: π, θ, e, i, ∞ */}
            <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-slate-800/80">
              {[
                { label: 'π', val: 'π' },
                { label: 'θ', val: 'θ' },
                { label: 'e', val: 'e' },
                { label: 'i', val: 'i' },
                { label: '∞', val: '∞' },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => handleKeyClick(c.val)}
                  className="h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300 font-serif font-bold text-base transition flex items-center justify-center"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* STANDARD MATH GRID: 8 COLUMNS */
          <div className="space-y-1.5 animate-in fade-in duration-150">
            {/* Direct Superscript Power Row: ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ */}
            <div className="bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 mb-1">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {language === 'bn' ? 'সরাসরি পাওয়ার সংখ্যা:' : 'Direct Powers:'}
                </span>
                <span className="text-[10px] text-indigo-400">
                  {language === 'bn' ? 'যেমন: ৫ চাপুন তারপর ³ চাপুন = 5³' : 'e.g. 5 then ³ = 5³'}
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'].map((sup) => (
                  <button
                    key={sup}
                    type="button"
                    onClick={() => handleKeyClick(sup)}
                    className="h-8 rounded-lg bg-indigo-950/60 hover:bg-indigo-600 text-indigo-200 hover:text-white font-mono font-bold text-sm border border-indigo-500/30 transition active:scale-95 flex items-center justify-center"
                  >
                    {sup}
                  </button>
                ))}
              </div>
            </div>

            {/* Standard 8-Column Grid */}
            <div className="grid grid-cols-8 gap-1 sm:gap-1.5 text-xs sm:text-sm">
              {/* ROW 1: (  )  |  √  x²  x³  xⁿ  π */}
              <button
                type="button"
                onClick={() => handleKeyClick('()', 1)}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-serif font-bold text-base transition flex items-center justify-center"
              >
                ( )
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('[]', 1)}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-serif font-bold text-base transition flex items-center justify-center"
              >
                [ ]
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('||', 1)}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-serif font-bold text-base transition flex items-center justify-center"
              >
                | |
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('√()', 1)}
                className="h-10 sm:h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-600 hover:text-white text-purple-200 font-serif font-bold text-base transition flex items-center justify-center"
                title="Square Root"
              >
                √
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('²')}
                className="h-10 sm:h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-200 font-serif font-bold text-base transition flex items-center justify-center"
                title="Squared"
              >
                <span className="italic">x</span>²
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('³')}
                className="h-10 sm:h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-200 font-serif font-bold text-base transition flex items-center justify-center"
                title="Cubed"
              >
                <span className="italic">x</span>³
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('ⁿ')}
                className="h-10 sm:h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-200 font-serif font-bold text-base transition flex items-center justify-center"
                title="Power n"
              >
                <span className="italic">x</span>ⁿ
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('π')}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300 font-serif font-bold text-base transition flex items-center justify-center"
              >
                π
              </button>

              {/* ROW 2: x  7  8  9  ÷  <  >  % */}
              <button
                type="button"
                onClick={() => handleKeyClick('x')}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-300 font-serif italic font-bold text-base transition flex items-center justify-center"
              >
                x
              </button>
              <NumKey num="7" onClick={() => handleKeyClick('7')} />
              <NumKey num="8" onClick={() => handleKeyClick('8')} />
              <NumKey num="9" onClick={() => handleKeyClick('9')} />
              <OpKey label="÷" onClick={() => handleKeyClick(' ÷ ')} />
              <OpKey label="<" onClick={() => handleKeyClick('<')} />
              <OpKey label=">" onClick={() => handleKeyClick('>')} />
              <OpKey label="%" onClick={() => handleKeyClick('%')} />

              {/* ROW 3: y  4  5  6  ×  ≤  ≥  ± */}
              <button
                type="button"
                onClick={() => handleKeyClick('y')}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-300 font-serif italic font-bold text-base transition flex items-center justify-center"
              >
                y
              </button>
              <NumKey num="4" onClick={() => handleKeyClick('4')} />
              <NumKey num="5" onClick={() => handleKeyClick('5')} />
              <NumKey num="6" onClick={() => handleKeyClick('6')} />
              <OpKey label="×" onClick={() => handleKeyClick(' × ')} />
              <OpKey label="≤" onClick={() => handleKeyClick(' ≤ ')} />
              <OpKey label="≥" onClick={() => handleKeyClick(' ≥ ')} />
              <OpKey label="±" onClick={() => handleKeyClick(' ± ')} />

              {/* ROW 4: z  1  2  3  -  =  ≠  , */}
              <button
                type="button"
                onClick={() => handleKeyClick('z')}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-300 font-serif italic font-bold text-base transition flex items-center justify-center"
              >
                z
              </button>
              <NumKey num="1" onClick={() => handleKeyClick('1')} />
              <NumKey num="2" onClick={() => handleKeyClick('2')} />
              <NumKey num="3" onClick={() => handleKeyClick('3')} />
              <OpKey label="-" onClick={() => handleKeyClick(' - ')} />
              <OpKey label="=" onClick={() => handleKeyClick(' = ')} />
              <OpKey label="≠" onClick={() => handleKeyClick(' ≠ ')} />
              <OpKey label="," onClick={() => handleKeyClick(', ')} />

              {/* ROW 5: abc  ⇄  0  .  +  ←  →  ⌫ */}
              <button
                type="button"
                onClick={() => setIsAbcMode(true)}
                className="h-10 sm:h-12 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 text-white font-mono font-bold text-xs sm:text-sm active:scale-95 transition flex items-center justify-center shadow"
              >
                abc
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick(' → ')}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-mono text-sm transition flex items-center justify-center"
                title="Arrow"
              >
                →
              </button>
              <NumKey num="0" onClick={() => handleKeyClick('0')} />
              <button
                type="button"
                onClick={() => handleKeyClick('.')}
                className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono font-bold text-base transition flex items-center justify-center"
              >
                .
              </button>
              <OpKey label="+" onClick={() => handleKeyClick(' + ')} />

              {/* Cursor Left */}
              <button
                type="button"
                onClick={() => onMoveCursor && onMoveCursor('left')}
                className="h-10 sm:h-12 rounded-xl bg-blue-900/60 border border-blue-700/50 hover:bg-blue-800 text-blue-200 active:scale-95 transition flex items-center justify-center"
                title="Move Left"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Cursor Right */}
              <button
                type="button"
                onClick={() => onMoveCursor && onMoveCursor('right')}
                className="h-10 sm:h-12 rounded-xl bg-blue-900/60 border border-blue-700/50 hover:bg-blue-800 text-blue-200 active:scale-95 transition flex items-center justify-center"
                title="Move Right"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Backspace Delete */}
              <button
                type="button"
                onClick={onBackspace}
                className="h-10 sm:h-12 rounded-xl bg-blue-950 border border-blue-900 hover:bg-blue-900 text-blue-200 active:scale-95 transition flex items-center justify-center shadow"
                title="Delete"
              >
                <Delete className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
              </button>
            </div>

            {/* CATEGORY EXTENSION BAR (If Algebra, Trig, Calculus selected) */}
            {activeCategory !== 'basic' && (
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                  {activeCategory === 'algebra' && (
                    <>
                      {[
                        { label: 'log', val: 'log(' },
                        { label: 'ln', val: 'ln(' },
                        { label: 'f(x)', val: 'f(x)' },
                        { label: 'g(x)', val: 'g(x)' },
                        { label: 'eˣ', val: 'eˣ' },
                        { label: '|x|', val: '|x|' },
                        { label: 'n!', val: '!' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleKeyClick(item.val)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono whitespace-nowrap transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </>
                  )}

                  {activeCategory === 'trig' && (
                    <>
                      {['sin(', 'cos(', 'tan(', 'cot(', 'sec(', 'csc(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'θ'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleKeyClick(t)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono whitespace-nowrap transition"
                        >
                          {t}
                        </button>
                      ))}
                    </>
                  )}

                  {activeCategory === 'calculus' && (
                    <>
                      {[
                        { label: 'd/dx', val: 'd/dx ' },
                        { label: '∫', val: '∫ ' },
                        { label: 'lim', val: 'lim(x→0) ' },
                        { label: '∑', val: '∑ ' },
                        { label: 'dx', val: 'dx' },
                        { label: 'dy', val: 'dy' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleKeyClick(item.val)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono whitespace-nowrap transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </>
                  )}

                  {activeCategory === 'matrix' && (
                    <>
                      {[
                        { label: '[ 2×2 ]', val: '[[a, b], [c, d]]' },
                        { label: '[ 3×3 ]', val: '[[a, b, c], [d, e, f], [g, h, i]]' },
                        { label: 'det(A)', val: 'det(A)' },
                        { label: 'A⁻¹', val: 'A⁻¹' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleKeyClick(item.val)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono whitespace-nowrap transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for clean keypad layout
const NumKey: React.FC<{ num: string; onClick: () => void }> = ({ num, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="h-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono font-bold text-base sm:text-lg active:scale-95 transition flex items-center justify-center"
  >
    {num}
  </button>
);

const OpKey: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="h-10 sm:h-12 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200 font-bold text-sm sm:text-base active:scale-95 transition flex items-center justify-center"
  >
    {label}
  </button>
);
