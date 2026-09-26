export type SolverMode = 'standard' | 'shortcut' | 'explain_simple' | 'exam_prep';
export type AppLanguage = 'bn' | 'en';

export interface MathStep {
  stepNumber: number;
  title: string;
  latex?: string;
  explanation: string;
}

export interface GraphPoint {
  label: string;
  x: number;
  y: number;
}

export interface GraphData {
  canPlot: boolean;
  type?: 'function' | 'points' | null;
  equation?: string;
  fn?: string;
  xRange?: [number, number];
  keyPoints?: GraphPoint[];
  description?: string;
}

export interface PracticeProblem {
  question: string;
  hint?: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface SolvedProblem {
  id: string;
  timestamp: number;
  problemTitle: string;
  detectedProblemText: string;
  detectedProblemLatex?: string;
  topic: string;
  difficulty: string;
  finalAnswer: string;
  steps: MathStep[];
  verification?: string;
  keyFormulas?: string[];
  graphData?: GraphData;
  shortcutMethod?: string;
  commonMistakes?: string;
  realWorldApplication?: string;
  similarPracticeProblem?: PracticeProblem;
  inputImage?: string;
  inputText?: string;
  isBookmarked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
  explanation: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export interface FormulaItem {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'algebra' | 'geometry' | 'trigonometry' | 'calculus' | 'arithmetic' | 'mensuration' | 'statistics' | 'higher_math';
  classLevel: 'primary' | 'middle' | 'secondary' | 'higher';
  gradeBn: string;
  gradeEn?: string;
  latex: string;
  latexBn?: string;
  latexEn?: string;
  explanationBn: string;
  explanationEn: string;
  sampleProblem?: string;
  sampleProblemBn?: string;
  sampleProblemEn?: string;
}
