import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  block?: boolean;
  className?: string;
}

// Global cache for compiled KaTeX HTML strings to ensure instant 0ms render
const mathCache = new Map<string, string>();

export const MathView: React.FC<MathViewProps> = ({ content, block = false, className = '' }) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    const cacheKey = `${block ? 'B:' : 'I:'}${content}`;
    const cached = mathCache.get(cacheKey);
    if (cached) return cached;

    let result = content;

    // If explicit $ or $$ present
    if (content.includes('$')) {
      const displayRegex = /\$\$([\s\S]*?)\$\$/g;
      const inlineRegex = /\$([^\$\n]+?)\$/g;

      let processed = content.replace(displayRegex, (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          return math;
        }
      });

      processed = processed.replace(inlineRegex, (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return math;
        }
      });

      result = processed;
      mathCache.set(cacheKey, result);
      return result;
    }

    // Auto-detect math symbols or if block is requested
    const hasMathSymbols =
      block ||
      /[\\^_{}=+*/√∫∑∏±×÷<>]/.test(content) ||
      content.includes('\\sqrt') ||
      content.includes('\\frac') ||
      content.includes('\\log') ||
      content.includes('\\sin') ||
      content.includes('\\cos') ||
      content.includes('\\tan') ||
      content.includes('\\lim');

    if (hasMathSymbols) {
      try {
        // Normalize incomplete braces or empty placeholders like ^{}, \sqrt{}, \frac{}{} for live preview
        let mathExp = content
          .replace(/\\sqrt\{\}/g, '\\sqrt{\\Box}')
          .replace(/\\sqrt\[(\d+|n)\]\{\}/g, '\\sqrt[$1]{\\Box}')
          .replace(/\\frac\{\}\{\}/g, '\\frac{\\Box}{\\Box}')
          .replace(/\\frac\{([^}]+)\}\{\}/g, '\\frac{$1}{\\Box}')
          .replace(/\\frac\{\}\{([^}]+)\}/g, '\\frac{\\Box}{$1}')
          .replace(/\^\{\}/g, '^{\\Box}')
          .replace(/\_\{\}/g, '_{\\Box}')
          .replace(/\^([a-zA-Z0-9]+)/g, '^{$1}')
          .replace(/\^(\s|$)/g, '^{\\Box}$1')
          .replace(/_(\s|$)/g, '_{\\Box}$1')
          .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
          .replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}')
          .replace(/√/g, '\\sqrt{\\Box}')
          .replace(/×/g, '\\times ')
          .replace(/÷/g, '\\div ')
          .replace(/²/g, '^2')
          .replace(/³/g, '^3')
          .replace(/·/g, '\\cdot ');

        result = katex.renderToString(mathExp, {
          displayMode: block,
          throwOnError: false,
        });
      } catch {
        result = content;
      }
    }

    mathCache.set(cacheKey, result);
    return result;
  }, [content, block]);

  if (renderedContent.includes('<span class="katex">') || renderedContent.includes('<span class="katex-display">')) {
    return (
      <span
        className={`math-rendered ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }

  return <span className={className}>{content}</span>;
};
