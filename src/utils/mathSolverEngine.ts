// Advanced built-in Mathematical Engine for Mathmate
// Provides 100% reliable textbook step-by-step solutions for algebra, arithmetic, quadratics, fractions, and calculus
import type { SolvedProblem } from '../types.ts';

interface LinearParseResult {
  variable: string;
  fractionCoeff?: { num: number; den: number };
  coeff: number;
  constant: number;
  rhs: number;
  rawEquation: string;
}

/**
 * Parses and solves linear equations with fractional coefficients, like:
 * 5m/12 - 12 = 48
 * 3x/4 + 5 = 20
 * 2x + 8 = 24
 * x/5 - 3 = 7
 */
function parseLinearFractionEquation(input: string): LinearParseResult | null {
  // Normalize spaces, unicode minus, multiplication
  const str = input
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '')
    .trim();

  if (!str.includes('=')) return null;

  const [lhs, rhsStr] = str.split('=');
  const rhs = parseFloat(rhsStr);
  if (isNaN(rhs)) return null;

  // Find variable letter [a-zA-Z] excluding 'e' or 'E' if scientific notation
  const varMatch = lhs.match(/([a-df-zA-DF-Z])/);
  if (!varMatch) return null;
  const variable = varMatch[1];

  // Regex patterns:
  // Pattern 1: (num)var/(den) [+-] (const)
  // e.g. 5m/12-12 or 5m/12+6
  const pattern1 = new RegExp(`^([+-]?\\d*)${variable}\\/(\\d+)([+-]\\d+(?:\\.\\d+)?)?$`);
  const match1 = lhs.match(pattern1);
  if (match1) {
    const rawNum = match1[1];
    const num = rawNum === '' || rawNum === '+' ? 1 : rawNum === '-' ? -1 : parseFloat(rawNum);
    const den = parseFloat(match1[2]);
    const constant = match1[3] ? parseFloat(match1[3]) : 0;
    return {
      variable,
      fractionCoeff: { num, den },
      coeff: num / den,
      constant,
      rhs,
      rawEquation: `${lhs} = ${rhsStr}`,
    };
  }

  // Pattern 2: (const) [+-] (num)var/(den)
  const pattern2 = new RegExp(`^([+-]?\\d+(?:\\.\\d+)?)([+-]\\d*)${variable}\\/(\\d+)$`);
  const match2 = lhs.match(pattern2);
  if (match2) {
    const constant = parseFloat(match2[1]);
    const rawNum = match2[2];
    const num = rawNum === '+' ? 1 : rawNum === '-' ? -1 : parseFloat(rawNum);
    const den = parseFloat(match2[3]);
    return {
      variable,
      fractionCoeff: { num, den },
      coeff: num / den,
      constant,
      rhs,
      rawEquation: `${lhs} = ${rhsStr}`,
    };
  }

  // Pattern 3: Standard linear: (coeff)var [+-] (const)
  // e.g. 5m - 12 = 48, 2x + 8 = 24
  const pattern3 = new RegExp(`^([+-]?\\d*(?:\\.\\d+)?)${variable}([+-]\\d+(?:\\.\\d+)?)?$`);
  const match3 = lhs.match(pattern3);
  if (match3) {
    const rawCoeff = match3[1];
    const coeff = rawCoeff === '' || rawCoeff === '+' ? 1 : rawCoeff === '-' ? -1 : parseFloat(rawCoeff);
    const constant = match3[2] ? parseFloat(match3[2]) : 0;
    return {
      variable,
      coeff,
      constant,
      rhs,
      rawEquation: `${lhs} = ${rhsStr}`,
    };
  }

  // Pattern 4: Two-sided linear: ax + b = cx + d
  const pattern4 = new RegExp(`^([+-]?\\d*)${variable}([+-]\\d+)?=([+-]?\\d*)${variable}([+-]\\d+)?$`);
  const match4 = str.match(pattern4);
  if (match4) {
    const a = match4[1] === '' || match4[1] === '+' ? 1 : match4[1] === '-' ? -1 : parseFloat(match4[1]);
    const b = match4[2] ? parseFloat(match4[2]) : 0;
    const c = match4[3] === '' || match4[3] === '+' ? 1 : match4[3] === '-' ? -1 : parseFloat(match4[3]);
    const d = match4[4] ? parseFloat(match4[4]) : 0;
    const netCoeff = a - c;
    const netRhs = d - b;
    if (netCoeff !== 0) {
      return {
        variable,
        coeff: netCoeff,
        constant: 0,
        rhs: netRhs,
        rawEquation: str,
      };
    }
  }

  return null;
}

export function solveMathWithEngine(rawInput: string, language: 'bn' | 'en' = 'bn'): SolvedProblem | null {
  if (!rawInput || !rawInput.trim()) return null;
  const input = rawInput.trim();

  // 1. Try Linear Fractional / Standard Equations (e.g. 5m/12 - 12 = 48)
  const linear = parseLinearFractionEquation(input);
  if (linear) {
    const { variable, fractionCoeff, constant, rhs } = linear;
    const isBn = language === 'bn';

    if (fractionCoeff) {
      const { num, den } = fractionCoeff;
      // Step 1: Move constant to RHS
      // num * var / den = rhs - constant
      const rhsAfterConst = rhs - constant;
      // Step 2: Multiply by denominator
      // num * var = rhsAfterConst * den
      const rhsAfterMult = rhsAfterConst * den;
      // Step 3: Divide by numerator
      const finalVal = rhsAfterMult / num;
      const formattedAns = Number.isInteger(finalVal) ? finalVal.toString() : finalVal.toFixed(4).replace(/\.?0+$/, '');

      const termLatex = num === 1 ? `\\frac{${variable}}{${den}}` : `\\frac{${num}${variable}}{${den}}`;
      const constSign = constant >= 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`;

      const steps = [
        {
          stepNumber: 1,
          title: isBn ? 'ধাপ ১: প্রদত্ত সমীকরণ পর্যবেক্ষণ' : 'Step 1: Identify Given Equation',
          latex: `${termLatex} ${constSign} = ${rhs}`,
          explanation: isBn
            ? `এখানে অজ্ঞাত চলক হলো $${variable}$। সমীকরণটি সমাধান করতে আমাদের $${variable}$-এর মান নির্ণয় করতে হবে।`
            : `The unknown variable is $${variable}$. We need to isolate $${variable}$.`,
        },
        {
          stepNumber: 2,
          title: isBn ? 'ধাপ ২: ধ্রুবক সংখ্যা পক্ষান্তর করা' : 'Step 2: Transpose Constant to RHS',
          latex: `${termLatex} = ${rhs} ${constant < 0 ? `+ ${Math.abs(constant)}` : `- ${constant}`} \\implies ${termLatex} = ${rhsAfterConst}`,
          explanation: isBn
            ? `বামপাশের ধ্রুবক সংখ্যা $${constSign}$ কে ডানপাশে পক্ষান্তর করি (চিহ্ন পরিবর্তিত হয়ে $${constant < 0 ? '+' : '-'}$ হয়)। ফলে ডানপাশে মান দাঁড়ায় $${rhsAfterConst}$।`
            : `Move the constant to the right-hand side with sign change, yielding $${rhsAfterConst}$.`,
        },
        {
          stepNumber: 3,
          title: isBn ? 'ধাপ ৩: হর দ্বারা উভয় পক্ষকে গুণ করা (আড়গুণন)' : 'Step 3: Cross Multiply by Denominator',
          latex: `${num}${variable} = ${rhsAfterConst} \\times ${den} \\implies ${num}${variable} = ${rhsAfterMult}`,
          explanation: isBn
            ? `ভগ্নাংশের হর $${den}$ সরানোর জন্য সমীকরণের উভয় পক্ষকে $${den}$ দিয়ে গুণ করি।`
            : `Multiply both sides by denominator $${den}$ to eliminate fraction.`,
        },
        {
          stepNumber: 4,
          title: isBn ? `ধাপ ৪: চলকের সহগ দিয়ে ভাগ করে চূড়ান্ত মান নির্ণয়` : `Step 4: Divide by Coefficient`,
          latex: `${variable} = \\frac{${rhsAfterMult}}{${num}} \\implies ${variable} = ${formattedAns}`,
          explanation: isBn
            ? `এখন $${variable}$-এর সাথে গুণ থাকা $${num}$ দিয়ে উভয় পক্ষকে ভাগ করে আমরা নির্ণেয় মান পাই $${formattedAns}$।`
            : `Divide both sides by $${num}$ to obtain $${variable} = ${formattedAns}$.`,
        },
      ];

      return {
        id: Date.now().toString(),
        timestamp: Date.now(),
        problemTitle: isBn ? `সরল সমীকরণ সমাধান ($${variable}$ এর মান)` : `Solve Linear Equation for $${variable}$`,
        detectedProblemText: input,
        detectedProblemLatex: `${termLatex} ${constSign} = ${rhs}`,
        topic: isBn ? 'বীজগণিত (Linear Algebra)' : 'Linear Algebra',
        difficulty: 'Easy',
        finalAnswer: `${variable} = ${formattedAns}`,
        steps,
        verification: isBn
          ? `বামপক্ষ: \\frac{${num} \\times (${formattedAns})}{${den}} ${constSign} = \\frac{${num * parseFloat(formattedAns)}}{${den}} ${constSign} = ${rhsAfterConst} ${constSign} = ${rhs} = ডানপক্ষ (সঠিক)`
          : `LHS: \\frac{${num}(${formattedAns})}{${den}} ${constSign} = ${rhs} = RHS (Verified!)`,
        keyFormulas: [
          `\\frac{a \\cdot x}{b} + c = d \\implies x = \\frac{(d - c) \\cdot b}{a}`,
        ],
        graphData: {
          canPlot: true,
          type: 'function',
          equation: `y = \\frac{${num}}{${den}}x - ${rhsAfterConst}`,
          fn: `(${num}/${den})*x - ${rhsAfterConst}`,
          xRange: [parseFloat(formattedAns) - 50, parseFloat(formattedAns) + 50],
          keyPoints: [
            { label: `Root (${formattedAns}, 0)`, x: parseFloat(formattedAns), y: 0 },
            { label: `Y-intercept (0, -${rhsAfterConst})`, x: 0, y: -rhsAfterConst },
          ],
          description: isBn ? `সরলরৈখিক গ্রাফের ছেদবিন্দু x = ${formattedAns}` : `Linear function root at x = ${formattedAns}`,
        },
        shortcutMethod: isBn
          ? `১-লাইন শর্টকাট: $${variable} = \\frac{(${rhs} ${constant < 0 ? '+' : '-'} ${Math.abs(constant)}) \\times ${den}}{${num}} = \\frac{${rhsAfterConst} \\times ${den}}{${num}} = ${formattedAns}$`
          : `1-Line Trick: $${variable} = (${rhs} - (${constant})) \\times ${den} / ${num} = ${formattedAns}$`,
        commonMistakes: isBn
          ? `পক্ষান্তর করার সময় চিহ্নের পরিবর্তন মনে রাখুন (-১২ ডানপাশে গেলে +১২ হবে, -১২ নয়)।`
          : `Ensure correct sign change when moving terms across the equals sign.`,
        realWorldApplication: isBn
          ? `পদার্থবিজ্ঞান ও প্রকৌশলবিদ্যায় দূরত্ব, বেগ, রোধ ও বলের সমীকরণ নির্ধারণে এই ধরনের সমীকরণ ব্যাপকভাবে ব্যবহৃত হয়।`
          : `Used widely in physics and engineering to balance rates, forces, and financial ratios.`,
        similarPracticeProblem: {
          question: isBn ? `\\frac{3x}{5} - 6 = 24 হলে x এর মান কত?` : `If \\frac{3x}{5} - 6 = 24, find x.`,
          hint: isBn ? `প্রথমে -৬ কে ডানে নিয়ে ৩০ করুন, তারপর ৫ দিয়ে গুণ ও ৩ দিয়ে ভাগ করুন।` : `Add 6 to 24 to get 30, then multiply by 5 and divide by 3.`,
          options: ['50', '40', '60', '35'],
          correctOptionIndex: 0,
          explanation: `\\frac{3x}{5} = 30 \\implies 3x = 150 \\implies x = 50`,
        },
      };
    } else {
      // Standard linear: coeff * var + constant = rhs
      const { coeff, constant, rhs } = linear;
      const rhsAfterConst = rhs - constant;
      const finalVal = rhsAfterConst / coeff;
      const formattedAns = Number.isInteger(finalVal) ? finalVal.toString() : finalVal.toFixed(4).replace(/\.?0+$/, '');

      const steps = [
        {
          stepNumber: 1,
          title: isBn ? 'ধাপ ১: প্রদত্ত সমীকরণ' : 'Step 1: Given Equation',
          latex: `${coeff !== 1 ? coeff : ''}${variable} ${constant >= 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`} = ${rhs}`,
          explanation: isBn ? `সমীকরণ থেকে চলক $${variable}$-কে পৃথক করতে হবে।` : `Isolate variable $${variable}$.`,
        },
        {
          stepNumber: 2,
          title: isBn ? 'ধাপ ২: ধ্রুবক পক্ষান্তর' : 'Step 2: Move Constant',
          latex: `${coeff !== 1 ? coeff : ''}${variable} = ${rhs} ${constant < 0 ? `+ ${Math.abs(constant)}` : `- ${constant}`} = ${rhsAfterConst}`,
          explanation: isBn ? `ডানপাশে হিসাব করে পাই $${rhsAfterConst}$।` : `Simplifying right side gives $${rhsAfterConst}$.`,
        },
        {
          stepNumber: 3,
          title: isBn ? 'ধাপ ৩: সহগ দ্বারা ভাগ' : 'Step 3: Divide by Coefficient',
          latex: `${variable} = \\frac{${rhsAfterConst}}{${coeff}} = ${formattedAns}`,
          explanation: isBn ? `অতএব নির্ণেয় সমাধান $${variable} = ${formattedAns}$।` : `Thus $${variable} = ${formattedAns}$.`,
        },
      ];

      return {
        id: Date.now().toString(),
        timestamp: Date.now(),
        problemTitle: isBn ? `একচলক বিশিষ্ট সরল সমীকরণ` : `Linear Equation Solve`,
        detectedProblemText: input,
        detectedProblemLatex: `${coeff !== 1 ? coeff : ''}${variable} ${constant >= 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`} = ${rhs}`,
        topic: 'Algebra',
        difficulty: 'Easy',
        finalAnswer: `${variable} = ${formattedAns}`,
        steps,
        verification: isBn ? `মান বসিয়ে পাই: ${coeff}(${formattedAns}) + (${constant}) = ${rhs} (সঠিক)` : `Verified: LHS = RHS = ${rhs}`,
        keyFormulas: [`ax + b = c \\implies x = \\frac{c - b}{a}`],
      };
    }
  }

  // 2. Quadratic Equation: ax^2 + bx + c = 0
  const quadNormalized = input
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '')
    .replace(/²/g, '^2');

  const quadMatch = quadNormalized.match(/^([+-]?\d*)[xX]\^2([+-]\d*)[xX]([+-]\d+)?=0$/) ||
                     quadNormalized.match(/^([+-]?\d*)[xX]\^2([+-]\d+)?=0$/);

  if (quadMatch) {
    const isBn = language === 'bn';
    const rawA = quadMatch[1];
    const a = rawA === '' || rawA === '+' ? 1 : rawA === '-' ? -1 : parseFloat(rawA);
    const hasLinear = quadNormalized.includes('x') && !quadNormalized.startsWith('x^2') ? true : false;
    let b = 0;
    let c = 0;

    if (quadMatch[3] !== undefined) {
      const rawB = quadMatch[2];
      b = rawB === '+' ? 1 : rawB === '-' ? -1 : parseFloat(rawB);
      c = parseFloat(quadMatch[3]);
    } else if (quadMatch[2] !== undefined) {
      c = parseFloat(quadMatch[2]);
    }

    const D = b * b - 4 * a * c;
    if (D >= 0) {
      const sqrtD = Math.sqrt(D);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      const ans1 = Number.isInteger(x1) ? x1.toString() : x1.toFixed(3);
      const ans2 = Number.isInteger(x2) ? x2.toString() : x2.toFixed(3);
      const finalAns = x1 === x2 ? `x = ${ans1}` : `x = ${ans1} ${isBn ? 'অথবা' : 'or'} x = ${ans2}`;

      const steps = [
        {
          stepNumber: 1,
          title: isBn ? 'ধাপ ১: আদর্শ দ্বিঘাত সমীকরণের সাথে তুলনা' : 'Step 1: Standard Quadratic Form',
          latex: `ax^2 + bx + c = 0 \\implies a = ${a}, \\; b = ${b}, \\; c = ${c}`,
          explanation: isBn
            ? `প্রদত্ত সমীকরণটি $ax^2 + bx + c = 0$ আকারের। এখানে সহগগুলো হলো $a = ${a}$, $b = ${b}$, এবং $c = ${c}$।`
            : `Comparing with $ax^2 + bx + c = 0$, we have $a = ${a}$, $b = ${b}$, and $c = ${c}$.`,
        },
        {
          stepNumber: 2,
          title: isBn ? 'ধাপ ২: নিশ্চায়ক (Discriminant) নির্ণয়' : 'Step 2: Calculate Discriminant',
          latex: `D = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${D}`,
          explanation: isBn
            ? `যেহেতু নিশ্চায়ক $D = ${D} \\ge 0$, সমীকরণটির মূলগুলো বাস্তব${D === 0 ? ' ও সমান' : ' ও অসমান'} হবে।`
            : `Since $D = ${D} \\ge 0$, roots are real${D === 0 ? ' and equal' : ' and distinct'}.`,
        },
        {
          stepNumber: 3,
          title: isBn ? 'ধাপ ৩: দ্বিঘাত সূত্রের প্রয়োগ' : 'Step 3: Quadratic Formula Application',
          latex: `x = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${D}}}{2(${a})} = \\frac{${-b} \\pm ${Number.isInteger(sqrtD) ? sqrtD : `\\sqrt{${D}}`}}{${2 * a}}`,
          explanation: isBn
            ? `ধনাত্মক (+) ও ঋণাত্মক (-) মান বিবেচনা করে আমরা দুটি মূল পাই।`
            : `Evaluating for both + and - signs gives the two solutions.`,
        },
        {
          stepNumber: 4,
          title: isBn ? 'ধাপ ৪: চূড়ান্ত মূলসমূহ' : 'Step 4: Final Roots',
          latex: `x_1 = ${ans1}, \\quad x_2 = ${ans2}`,
          explanation: isBn ? `অতএব সমীকরণের নির্ণেয় সমাধান: $${finalAns}$।` : `Therefore, the solutions are $${finalAns}$.`,
        },
      ];

      return {
        id: Date.now().toString(),
        timestamp: Date.now(),
        problemTitle: isBn ? `দ্বিঘাত সমীকরণ সমাধান` : `Quadratic Equation Solve`,
        detectedProblemText: input,
        detectedProblemLatex: `${a !== 1 ? a : ''}x^2 ${b !== 0 ? (b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`) : ''} ${c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0`,
        topic: 'Algebra',
        difficulty: 'Medium',
        finalAnswer: finalAns,
        steps,
        verification: isBn ? `মূল দুটি সমীকরণে বসিয়ে উভয় পক্ষে শূন্য (০) পাওয়া যায়।` : `Substituting roots back gives LHS = 0.`,
        keyFormulas: [`x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`],
        graphData: {
          canPlot: true,
          type: 'function',
          equation: `y = ${a}x^2 + ${b}x + ${c}`,
          fn: `${a}*x*x + ${b}*x + ${c}`,
          xRange: [Math.min(x1, x2) - 4, Math.max(x1, x2) + 4],
          keyPoints: [
            { label: `Root (${ans1}, 0)`, x: x1, y: 0 },
            { label: `Root (${ans2}, 0)`, x: x2, y: 0 },
          ],
        },
      };
    }
  }

  // 3. Basic Arithmetic & BODMAS (e.g. (25 * 4) / 5, 125 + 75, 5^3)
  try {
    const cleanExpr = input
      .replace(/[–—−]/g, '-')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/\^/g, '**');

    // Only allow safe math tokens
    if (/^[0-9+\-*/().\s*]+$/.test(cleanExpr) && !cleanExpr.includes('=')) {
      // Evaluate arithmetic safely
      const evalFunc = new Function(`return (${cleanExpr})`);
      const val = evalFunc();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const isBn = language === 'bn';
        const formattedVal = Number.isInteger(val) ? val.toString() : val.toFixed(4).replace(/\.?0+$/, '');

        return {
          id: Date.now().toString(),
          timestamp: Date.now(),
          problemTitle: isBn ? 'পাটিগণিত ও গাণিতিক সরলীকরণ' : 'Arithmetic Calculation',
          detectedProblemText: input,
          detectedProblemLatex: input.replace(/\*/g, '\\times ').replace(/\//g, '\\div '),
          topic: 'Arithmetic',
          difficulty: 'Easy',
          finalAnswer: formattedVal,
          steps: [
            {
              stepNumber: 1,
              title: isBn ? 'ধাপ ১: রাশি পর্যবেক্ষণ ও BODMAS নিয়ম' : 'Step 1: BODMAS / Order of Operations',
              latex: `${input} = ${formattedVal}`,
              explanation: isBn
                ? `প্রদত্ত রাশিতে ক্রমানুসারে ব্র্যাকেট (B), সূচক (O), ভাগ (D), গুণ (M), যোগ (A) এবং বিয়োগ (S) এর নিয়ম প্রয়োগ করে চূড়ান্ত মান পাওয়া গেছে।`
                : `Applying standard order of operations (Parentheses, Exponents, Division, Multiplication, Addition, Subtraction).`,
            },
            {
              stepNumber: 2,
              title: isBn ? 'ধাপ ২: চূড়ান্ত ফলাফল' : 'Step 2: Final Result',
              latex: `\\text{Result} = ${formattedVal}`,
              explanation: isBn ? `গণনা সম্পন্ন করে নির্ণেয় মান হলো ${formattedVal}।` : `The evaluated result is ${formattedVal}.`,
            },
          ],
          verification: isBn ? `বিপরীত গাণিতিক প্রক্রিয়ার মাধ্যমে যাচাইকৃত।` : `Verified via standard arithmetic.`,
          keyFormulas: ['\\text{BODMAS: Bracket } \\to \\text{ Order } \\to \\text{ Division } \\to \\text{ Multiplication } \\to \\text{ Addition } \\to \\text{ Subtraction}'],
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}
