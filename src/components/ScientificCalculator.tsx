import React, { useState } from 'react';
import { Sparkles, Delete, RotateCcw } from 'lucide-react';

interface ScientificCalculatorProps {
  onSendToSolver: (expression: string) => void;
  language: 'bn' | 'en';
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({ onSendToSolver, language }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string>('');
  const [isRad, setIsRad] = useState(false);
  const [memory, setMemory] = useState(0);

  const appendToDisplay = (val: string) => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return val;
      return prev + val;
    });
  };

  const clearAll = () => {
    setDisplay('0');
    setHistory('');
  };

  const backspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const calculate = () => {
    try {
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      // Handle trig with Deg/Rad
      if (!isRad) {
        expr = expr.replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
        expr = expr.replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
        expr = expr.replace(/tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
      } else {
        expr = expr.replace(/sin\(/g, 'Math.sin(');
        expr = expr.replace(/cos\(/g, 'Math.cos(');
        expr = expr.replace(/tan\(/g, 'Math.tan(');
      }

      expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
      expr = expr.replace(/log\(/g, 'Math.log10(');
      expr = expr.replace(/ln\(/g, 'Math.log(');

      // Safe Function evaluation
      const res = new Function(`return ${expr};`)();
      setHistory(display + ' =');
      setDisplay(Number(res.toFixed(8)).toString());
    } catch {
      setDisplay('Error');
    }
  };

  // Factorial helper
  const calcFactorial = () => {
    const num = parseInt(display, 10);
    if (isNaN(num) || num < 0 || num > 100) {
      setDisplay('Error');
      return;
    }
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    setHistory(`${num}! =`);
    setDisplay(res.toString());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-w-md mx-auto">
      {/* Display Screen */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 text-right">
        <div className="text-xs text-slate-500 h-4 font-mono overflow-x-auto">{history}</div>
        <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider overflow-x-auto py-1">
          {display}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRad(!isRad)}
              className={`px-2 py-0.5 rounded font-mono font-semibold transition ${
                isRad ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isRad ? 'RAD' : 'DEG'}
            </button>
            {memory !== 0 && (
              <span className="text-[10px] text-indigo-400 font-mono">M = {memory}</span>
            )}
          </div>
          <button
            onClick={() => onSendToSolver(display)}
            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{language === 'bn' ? 'AI ধাপে ধাপে সমাধান' : 'Solve with AI'}</span>
          </button>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm font-medium">
        {/* Row 1: Memory & Clear */}
        <button
          onClick={() => setMemory((m) => m + Number(display || 0))}
          className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 font-mono"
        >
          M+
        </button>
        <button
          onClick={() => setMemory(0)}
          className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 font-mono"
        >
          MC
        </button>
        <button
          onClick={() => setDisplay(memory.toString())}
          className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 font-mono"
        >
          MR
        </button>
        <button
          onClick={clearAll}
          className="p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 flex items-center justify-center font-mono"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={backspace}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-mono"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* Row 2: Trig & Functions */}
        <button
          onClick={() => appendToDisplay('sin(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono"
        >
          sin
        </button>
        <button
          onClick={() => appendToDisplay('cos(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono"
        >
          cos
        </button>
        <button
          onClick={() => appendToDisplay('tan(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-indigo-300 font-mono"
        >
          tan
        </button>
        <button
          onClick={() => appendToDisplay('sqrt(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          √x
        </button>
        <button
          onClick={() => appendToDisplay('^')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          xʸ
        </button>

        {/* Row 3: Log, Constants, Div */}
        <button
          onClick={() => appendToDisplay('log(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          log
        </button>
        <button
          onClick={() => appendToDisplay('ln(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          ln
        </button>
        <button
          onClick={() => appendToDisplay('π')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          π
        </button>
        <button
          onClick={() => appendToDisplay('(')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          (
        </button>
        <button
          onClick={() => appendToDisplay(')')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          )
        </button>

        {/* Row 4: 7, 8, 9, ÷, ! */}
        <button
          onClick={() => appendToDisplay('7')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          7
        </button>
        <button
          onClick={() => appendToDisplay('8')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          8
        </button>
        <button
          onClick={() => appendToDisplay('9')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          9
        </button>
        <button
          onClick={() => appendToDisplay('÷')}
          className="p-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-mono text-base"
        >
          ÷
        </button>
        <button
          onClick={calcFactorial}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          n!
        </button>

        {/* Row 5: 4, 5, 6, ×, e */}
        <button
          onClick={() => appendToDisplay('4')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          4
        </button>
        <button
          onClick={() => appendToDisplay('5')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          5
        </button>
        <button
          onClick={() => appendToDisplay('6')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          6
        </button>
        <button
          onClick={() => appendToDisplay('×')}
          className="p-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-mono text-base"
        >
          ×
        </button>
        <button
          onClick={() => appendToDisplay('e')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          e
        </button>

        {/* Row 6: 1, 2, 3, -, % */}
        <button
          onClick={() => appendToDisplay('1')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          1
        </button>
        <button
          onClick={() => appendToDisplay('2')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          2
        </button>
        <button
          onClick={() => appendToDisplay('3')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          3
        </button>
        <button
          onClick={() => appendToDisplay('-')}
          className="p-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-mono text-base"
        >
          -
        </button>
        <button
          onClick={() => appendToDisplay('%')}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono"
        >
          %
        </button>

        {/* Row 7: 0, ., =, + */}
        <button
          onClick={() => appendToDisplay('0')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base col-span-2"
        >
          0
        </button>
        <button
          onClick={() => appendToDisplay('.')}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base"
        >
          .
        </button>
        <button
          onClick={() => appendToDisplay('+')}
          className="p-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-mono text-base"
        >
          +
        </button>
        <button
          onClick={calculate}
          className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-mono font-bold text-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition"
        >
          =
        </button>
      </div>
    </div>
  );
};
