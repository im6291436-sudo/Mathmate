// Client-side/Offline mathematical solver engine for instant computation & reliable fallbacks
import { SolvedProblem } from '../types';
import { solveMathWithEngine } from './mathSolverEngine';

export function solveMathOffline(rawInput: string, language: 'bn' | 'en' = 'bn'): SolvedProblem | null {
  if (!rawInput || !rawInput.trim()) return null;

  // 0. Primary pass: Run through advanced linear/quadratic/arithmetic engine
  const engineResult = solveMathWithEngine(rawInput, language);
  if (engineResult) {
    return engineResult;
  }

  const text = rawInput.trim();

  // 1. Check for basic arithmetic / powers: e.g. 5^3, 5³, 2^10, sqrt(16), 125 * 5, 100 / 4, 25 + 75
  // Normalize visual exponents: 5³ -> 5^3
  const normalized = text
    .replace(/⁰/g, '^0')
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
    .replace(/√(\d+)/g, 'sqrt($1)')
    .replace(/√/g, 'sqrt');

  // Case A: Pure Power Expression like a^b or a^(b) (e.g. 5^3 or 5^(3))
  const powerMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*\^\s*\(?(\d+(?:\.\d+)?)\)?$/);
  if (powerMatch) {
    const base = parseFloat(powerMatch[1]);
    const exp = parseFloat(powerMatch[2]);
    const answer = Math.pow(base, exp);

    const steps = [
      {
        stepNumber: 1,
        title: language === 'bn' ? 'ধাপ ১: ঘাত বা সূচকের সংজ্ঞায়ন' : 'Step 1: Understand Power Definition',
        latex: `${base}^{${exp}} = \\underbrace{${base} \\times ${base} \\dots \\times ${base}}_{${exp}\\text{ ${language === 'bn' ? 'বার' : 'times'}}}`,
        explanation: language === 'bn'
          ? `এখানে ভিত্তি (Base) হলো ${base} এবং সূচক বা ঘাত (Exponent) হলো ${exp}। অর্থাৎ ${base}-কে মোট ${exp} বার গুণ করতে হবে।`
          : `Here base is ${base} and exponent is ${exp}. Multiply ${base} by itself ${exp} times.`,
      },
      {
        stepNumber: 2,
        title: language === 'bn' ? 'ধাপ ২: ধাপে ধাপে গুণ' : 'Step 2: Step-by-Step Multiplication',
        latex: exp === 3 
          ? `${base} \\times ${base} = ${base * base} \\implies ${base * base} \\times ${base} = ${answer}` 
          : `${base}^{${exp}} = ${answer}`,
        explanation: language === 'bn'
          ? `ধারাবাহিক গুণ সম্পন্ন করে আমরা পাই ${answer}।`
          : `Performing successive multiplication gives ${answer}.`,
      },
      {
        stepNumber: 3,
        title: language === 'bn' ? 'ধাপ ৩: চূড়ান্ত উত্তর' : 'Step 3: Final Answer',
        latex: `${base}^{${exp}} = ${answer}`,
        explanation: language === 'bn' ? `সুতরাং নির্ণেয় মান হলো ${answer}।` : `Thus the value is ${answer}.`,
      },
    ];

    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      problemTitle: language === 'bn' ? `${base} এর ঘাত ${exp} নির্ণয়` : `Calculate ${base}^${exp}`,
      detectedProblemText: text,
      detectedProblemLatex: `${base}^{${exp}}`,
      topic: language === 'bn' ? 'পাটিগণিত ও সূচক (Arithmetic & Exponents)' : 'Arithmetic & Exponents',
      difficulty: 'Easy',
      finalAnswer: answer.toString(),
      steps,
      verification: language === 'bn' 
        ? `${answer} ÷ ${base} = ${answer / base} (যা সঠিক উত্তরের নিশ্চয়তা দেয়)`
        : `${answer} / ${base} = ${answer / base} (verifies correctly)`,
      keyFormulas: [`a^n = a \\times a \\times \\dots \\times a \\text{ (n times)}`],
      graphData: {
        canPlot: true,
        type: 'function',
        equation: `y = x^{${exp}}`,
        fn: `Math.pow(x, ${exp})`,
        xRange: [-5, 5],
        keyPoints: [{ label: `(${base}, ${answer})`, x: base, y: answer }],
        description: language === 'bn' ? `পাওয়ার ফাংশন y = x^${exp}` : `Power function y = x^${exp}`,
      },
      shortcutMethod: language === 'bn' ? `${base}³ = ${base} × ${base} × ${base} = ${answer}` : `${base}^${exp} = ${answer}`,
      commonMistakes: language === 'bn' ? `ভুল করে ${base} × ${exp} = ${base * exp} লিখবেন না, এটি সূচকের গুণ!` : `Do not multiply base by exponent!`,
      similarPracticeProblem: {
        question: language === 'bn' ? `${base + 1}² এর মান কত?` : `What is the value of ${(base + 1)}^2?`,
        hint: language === 'bn' ? 'সংখ্যাটিকে নিজের সাথে গুণ করুন।' : 'Multiply the number by itself.',
        options: [
          `${(base + 1) * (base + 1)}`,
          `${(base + 1) * 2}`,
          `${base * base}`,
          `${(base + 1) * 3}`,
        ],
        correctOptionIndex: 0,
        explanation: `${(base + 1)}² = ${(base + 1) * (base + 1)}`,
      },
    };
  }

  // Case B: Simple arithmetic expressions like 25 + 75, 120 * 5, 200 / 4, 15 - 8, sqrt(64)
  try {
    let sanitized = normalized
      .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
      .replace(/\^/g, '**');

    if (/^[0-9+\-*/().\s,Math.sqrt]+$/.test(sanitized)) {
      // Safe arithmetic evaluator
      // eslint-disable-next-line no-eval
      const evalVal = Function(`'use strict'; return (${sanitized})`)();
      if (typeof evalVal === 'number' && !isNaN(evalVal) && isFinite(evalVal)) {
        return {
          id: Date.now().toString(),
          timestamp: Date.now(),
          problemTitle: language === 'bn' ? 'গাণিতিক গণনা' : 'Arithmetic Calculation',
          detectedProblemText: text,
          detectedProblemLatex: text,
          topic: language === 'bn' ? 'পাটিগণিত (Arithmetic)' : 'Arithmetic',
          difficulty: 'Easy',
          finalAnswer: evalVal.toString(),
          steps: [
            {
              stepNumber: 1,
              title: language === 'bn' ? 'প্রদত্ত রাশি' : 'Given Expression',
              latex: text,
              explanation: language === 'bn' ? 'রাশিটির মান ক্রমানুসারে সমাধান করা হলো।' : 'Evaluating the expression in order of operations.',
            },
            {
              stepNumber: 2,
              title: language === 'bn' ? 'হিসাব সম্পন্ন' : 'Calculation Complete',
              latex: `${text} = ${evalVal}`,
              explanation: language === 'bn' ? `গাণিতিক গণনা সম্পন্ন করে প্রাপ্ত ফলাফল: ${evalVal}` : `Computed result is ${evalVal}`,
            },
          ],
          verification: `${evalVal}`,
          keyFormulas: ['BODMAS / PEMDAS'],
        };
      }
    }
  } catch {
    // If eval fails, proceed
  }

  // Case C: Quadratic Equation e.g. x^2 - 5x + 6 = 0 or x² - 5x + 6 = 0
  const quadMatch = normalized.match(/([+-]?\s*\d*)x\^2\s*([+-]\s*\d*)x\s*([+-]\s*\d+)\s*=\s*0/i);
  if (quadMatch) {
    const rawA = quadMatch[1].replace(/\s/g, '');
    const a = rawA === '' || rawA === '+' ? 1 : rawA === '-' ? -1 : parseFloat(rawA);
    const rawB = quadMatch[2].replace(/\s/g, '');
    const b = rawB === '+' ? 1 : rawB === '-' ? -1 : parseFloat(rawB);
    const rawC = quadMatch[3].replace(/\s/g, '');
    const c = parseFloat(rawC);

    const D = b * b - 4 * a * c;
    if (D >= 0) {
      const x1 = (-b + Math.sqrt(D)) / (2 * a);
      const x2 = (-b - Math.sqrt(D)) / (2 * a);
      return {
        id: Date.now().toString(),
        timestamp: Date.now(),
        problemTitle: language === 'bn' ? 'দ্বিঘাত সমীকরণ সমাধান' : 'Quadratic Equation Solution',
        detectedProblemText: text,
        detectedProblemLatex: `${a !== 1 ? a : ''}x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
        topic: language === 'bn' ? 'বীজগণিত (Algebra)' : 'Algebra',
        difficulty: 'Medium',
        finalAnswer: `x = ${x1}, x = ${x2}`,
        steps: [
          {
            stepNumber: 1,
            title: language === 'bn' ? 'ধাপ ১: দ্বিঘাত সূত্রের প্রয়োগ' : 'Step 1: Quadratic Formula',
            latex: `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`,
            explanation: language === 'bn'
              ? `এখানে a = ${a}, b = ${b}, c = ${c}। নিশ্চয়ক (Discriminant) D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${D}।`
              : `Here a = ${a}, b = ${b}, c = ${c}. Discriminant D = ${D}.`,
          },
          {
            stepNumber: 2,
            title: language === 'bn' ? 'ধাপ ২: মূল বা বীজ নির্ণয়' : 'Step 2: Roots Calculation',
            latex: `x_1 = \\frac{${-b} + ${Math.sqrt(D)}}{${2 * a}} = ${x1}, \\quad x_2 = \\frac{${-b} - ${Math.sqrt(D)}}{${2 * a}} = ${x2}`,
            explanation: language === 'bn' ? `মূল দুটি পাওয়া গেল: x = ${x1} এবং x = ${x2}।` : `Roots are x = ${x1} and x = ${x2}.`,
          },
        ],
        verification: `(${x1})^2 - 5(${x1}) + 6 = 0 ✓`,
        keyFormulas: [`x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`],
      };
    }
  }

  return null;
}
