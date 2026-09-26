// Math notation formatters and converters for real WYSIWYG display

// Convert typed LaTeX back to readable Unicode math when displaying in plain text or preview
// e.g. 5^3 -> 5³, x^2 -> x², \sqrt{16} -> √16, \frac{a}{b} -> a/b
export function toVisualMath(text: string): string {
  if (!text) return '';

  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ',
  };

  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'i': 'ᵢ', 'j': 'ⱼ',
  };

  let res = text;

  // Convert ^{...} to superscripts
  res = res.replace(/\^\{([^}]+)\}/g, (_, exp) => {
    return exp.split('').map((char: string) => superscripts[char] || char).join('');
  });

  // Convert ^3, ^2, ^n directly to superscripts (e.g. 5^3 -> 5³)
  res = res.replace(/\^([0-9a-zA-Z+-]+)/g, (_, exp) => {
    return exp.split('').map((char: string) => superscripts[char] || char).join('');
  });

  // Convert _{...} to subscripts
  res = res.replace(/_\{([^}]+)\}/g, (_, sub) => {
    return sub.split('').map((char: string) => subscripts[char] || char).join('');
  });

  // Convert \sqrt{x} -> √(x)
  res = res.replace(/\\sqrt\[(\d+|n)\]\{([^}]+)\}/g, '$1√($2)');
  res = res.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  res = res.replace(/\\sqrt\{\}/g, '√()');
  res = res.replace(/\\sqrt/g, '√');

  // Convert \frac{a}{b} -> (a/b)
  res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  res = res.replace(/\\frac\{\}\{\}/g, '( / )');

  // Convert common LaTeX symbols to real mathematical characters
  res = res.replace(/\\times\b/g, '×');
  res = res.replace(/\\div\b/g, '÷');
  res = res.replace(/\\pm\b/g, '±');
  res = res.replace(/\\le\b/g, '≤');
  res = res.replace(/\\ge\b/g, '≥');
  res = res.replace(/\\ne\b/g, '≠');
  res = res.replace(/\\pi\b/g, 'π');
  res = res.replace(/\\theta\b/g, 'θ');
  res = res.replace(/\\infty\b/g, '∞');
  res = res.replace(/\\int\b/g, '∫');
  res = res.replace(/\\sum\b/g, '∑');

  return res;
}

// Convert user typed or visual string to clean LaTeX for AI solver
export function toSolverExpression(text: string): string {
  if (!text) return '';

  const reverseSuperscripts: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
    'ⁿ': 'n', 'ⁱ': 'i', 'ˣ': 'x', 'ʸ': 'y', 'ᵃ': 'a', 'ᵇ': 'b',
  };

  const reverseSubscripts: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
    'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ᵢ': 'i', 'ⱼ': 'j',
  };

  let clean = text;

  // Replace unicode superscripts with ^(...)
  clean = clean.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱˣʸᵃᵇ]+/g, (match) => {
    const normal = match.split('').map((c) => reverseSuperscripts[c] || c).join('');
    return `^(${normal})`;
  });

  // Replace unicode subscripts with _(...)
  clean = clean.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓᵢⱼ]+/g, (match) => {
    const normal = match.split('').map((c) => reverseSubscripts[c] || c).join('');
    return `_(${normal})`;
  });

  return clean;
}
