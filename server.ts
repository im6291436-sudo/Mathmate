import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { solveMathWithEngine } from './src/utils/mathSolverEngine.ts';

dotenv.config();

const app = express();
// Ensure server always binds to port 3000 (8080 is reserved for nginx reverse proxy)
const port = process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Explicit PWA and Manifest endpoints with no-cache so phone gets new icons immediately
app.get('/manifest.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/manifest.json'));
});

app.get('/manifest.webmanifest', (_req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/manifest.json'));
});

app.get('/favicon.ico', (_req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/favicon.ico'));
});

app.get('/apple-touch-icon.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/apple-touch-icon.png'));
});

app.get('/pwa-192x192.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/pwa-192x192.png'));
});

app.get('/pwa-512x512.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/pwa-512x512.png'));
});

app.get('/pwa-maskable-192x192.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/pwa-maskable-192x192.png'));
});

app.get('/pwa-maskable-512x512.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/pwa-maskable-512x512.png'));
});

app.get('/sw.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/sw.js'));
});

app.get('/icon.svg', (_req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/icon.svg'));
});

app.get('/icon-maskable.svg', (_req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/icon-maskable.svg'));
});

app.get('/download/Mathmate.apk', (_req, res) => {
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="Mathmate.apk"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/Mathmate.apk'));
});

app.get('/Mathmate.apk', (_req, res) => {
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="Mathmate.apk"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve('public/Mathmate.apk'));
});

app.use(express.static(path.resolve('public')));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust multi-model generator with fallback and retry
async function generateWithFallback(
  contents: any,
  config?: any
): Promise<string> {
  // Use high-availability models with priority on fast, stable ones
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        ...(config ? { config } : {}),
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Mathmate AI] Model ${model} encountered an issue, trying next candidate:`, err?.message || err);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All candidate AI models failed to respond.');
}

// Helper to extract JSON from model output safely
function extractJsonFromText(rawText: string) {
  try {
    return JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      return JSON.parse(rawText.substring(startIdx, endIdx + 1));
    }
    throw new Error('Failed to parse response as JSON');
  }
}

// 1. Math Solver Endpoint (Text, Photo, Drawing Canvas)
app.post('/api/solve', async (req, res) => {
  try {
    const { problemText, imageBase64, mimeType, mode = 'standard', language = 'bn' } = req.body;

    if (!problemText && !imageBase64) {
      return res.status(400).json({ error: 'Please provide either a math problem text or an image/photo.' });
    }

    const parts: any[] = [];

    if (imageBase64) {
      const cleanData = imageBase64.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanData,
        },
      });
    }

    const languageInstruction = language === 'bn'
      ? 'Explain in clear, friendly Bengali (বাংলা), keeping mathematical symbols in standard LaTeX notation (e.g. $x^2 + 5x + 6 = 0$, $\\frac{a}{b}$). Translate terminology naturally (e.g., সমাধান, ক্ষেত্রফল, সমীকরণ, বীজগণিত, জ্যামিতি).'
      : 'Explain in English, using standard LaTeX mathematical notation for equations and symbols.';

    const modePrompt = {
      standard: 'Provide a complete, rigorous, step-by-step textbook solution.',
      shortcut: 'Focus heavily on mental math tricks, quick shortcuts, Vedic math tips, and exam timing hacks.',
      explain_simple: 'Explain as if teaching a beginner or high school student, with intuitive visual analogies and zero jargon.',
      exam_prep: 'Format like a high-scoring board exam answer with given conditions, formulas, steps, units, and final answer note.',
    }[mode as 'standard' | 'shortcut' | 'explain_simple' | 'exam_prep'] || 'Provide a complete step-by-step solution.';

    const promptText = `
You are Mathmate, a world-class AI Mathematics Professor and interactive tutor.
Your mission is to accurately transcribe, analyze, and solve the provided math problem (from text, photo scan, handwriting, or diagram).

User's input text (if any): "${problemText || ''}"
${imageBase64 ? 'An image of the math problem or diagram is provided above. Carefully read handwritten or printed text, symbols, fractions, powers, geometries, and graphs.' : ''}

Mode: ${modePrompt}
Language: ${languageInstruction}

Strictly output your response as valid JSON matching this schema:
{
  "problemTitle": "Brief descriptive title (e.g. দ্বিঘাত সমীকরণ সমাধান / Quadratic Equation Solve)",
  "detectedProblemText": "Full extracted/transcribed problem in clean text",
  "detectedProblemLatex": "Core mathematical equation or question in LaTeX format",
  "topic": "Algebra / Geometry / Calculus / Trigonometry / Arithmetic / Statistics / Linear Algebra / etc.",
  "difficulty": "Easy / Medium / Hard",
  "finalAnswer": "Direct final answer highlighted cleanly with units if applicable (e.g. x = 2 অথবা x = -3)",
  "steps": [
    {
      "stepNumber": 1,
      "title": "ধাপ ১: প্রদত্ত তথ্য ও সূত্র নির্বাচন",
      "latex": "সমীকরণ বা গাণিতিক ধাপ LaTeX-এ",
      "explanation": "এই ধাপে কী করা হলো এবং কেন করা হলো তার সহজ ও প্রাঞ্জল ব্যাখ্যা"
    }
  ],
  "verification": "উত্তরের সত্যতা যাচাই বা বিকল্প পরীক্ষা (Verification / Check)",
  "keyFormulas": [
    "প্রয়োজনীয় সূত্র বা উপপাদ্য (LaTeX)"
  ],
  "graphData": {
    "canPlot": true or false,
    "type": "function", // or null
    "equation": "e.g. y = x^2 - 4 or y = 2*x + 1",
    "fn": "JavaScript math expression for y in terms of x if plottable, e.g. 'x*x - 4' or '2*x + 1' or 'Math.sin(x)'",
    "xRange": [-6, 6],
    "keyPoints": [
      { "label": "ছেদবিন্দু / Root", "x": 2, "y": 0 },
      { "label": "শীর্ষবিন্দু / Vertex", "x": 0, "y": -4 }
    ],
    "description": "গ্রাফটির সংক্ষিপ্ত বৈশিষ্ট্য"
  },
  "shortcutMethod": "শর্টকাট কৌশল বা দ্রুত সমাধান করার উপায়",
  "commonMistakes": "পরীক্ষায় ছাত্রছাত্রীরা সাধারণত কী ভুল করে এবং কীভাবে তা এড়িয়ে চলবে",
  "realWorldApplication": "বাস্তব জীবনে বা বিজ্ঞানে এর বাস্তব প্রয়োগ",
  "similarPracticeProblem": {
    "question": "অনুশীলনের জন্য অনুরূপ একটি সমস্যা",
    "hint": "সমাধানের জন্য সূত্র বা ইঙ্গিত",
    "options": ["ক) ...", "খ) ...", "গ) ...", "ঘ) ..."],
    "correctOptionIndex": 0,
    "explanation": "সঠিক উত্তরের সংক্ষিপ্ত সমাধান"
  }
}
`;

    parts.push({ text: promptText });

    const outputText = await generateWithFallback(
      { parts },
      { responseMimeType: 'application/json' }
    );

    const parsedData = extractJsonFromText(outputText);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Math solve AI error, checking built-in math engine fallback:', error?.message || error);
    if (req.body?.problemText) {
      const fallbackResult = solveMathWithEngine(req.body.problemText, req.body.language || 'bn');
      if (fallbackResult) {
        return res.json({ success: true, data: fallbackResult });
      }
    }
    return res.status(500).json({
      error: 'Failed to solve the math problem.',
      details: error?.message || 'Unknown error occurred.',
    });
  }
});

// 2. Interactive Math Tutor Chat (Follow-up questions)
app.post('/api/chat', async (req, res) => {
  try {
    const { problemContext, chatHistory, userQuestion, language = 'bn' } = req.body;

    const systemPrompt = `
You are Mathmate AI Math Tutor. You are helping a student understand their math problem.
Current Problem Context:
${JSON.stringify(problemContext, null, 2)}

User Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}
Instructions:
- Be encouraging, extremely pedagogical, and patient.
- Break down explanations into simple intuitions and visual mental models.
- Use LaTeX ($...$) for mathematical symbols and equations.
- Keep responses concise, clear, and formatted with bullet points if helpful.
`;

    const contents: any[] = [];
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: language === 'bn' ? 'আমি প্রস্তুত! এই অংকটির যেকোনো বিষয় নিয়ে প্রশ্ন করুন, আমি সহজ করে বুঝিয়ে দেবো।' : 'I am ready! Ask me any question about this problem and I will explain it simply.' }] });

    if (Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userQuestion }],
    });

    const replyText = await generateWithFallback(contents);

    return res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error?.message || 'Chat tutor error' });
  }
});

// 3. Quiz & Practice Generator by Category
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic = 'বীজগণিত (Algebra)', difficulty = 'Medium', count = 3, language = 'bn' } = req.body;

    const prompt = `
Generate ${count} engaging math quiz practice questions on the topic: "${topic}", difficulty: "${difficulty}".
Language: ${language === 'bn' ? 'Bengali (বাংলা) with standard LaTeX math notation' : 'English with LaTeX'}.

Return valid JSON with format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "প্রশ্নটি (LaTeX সমীকরণ সহ)",
      "options": ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
      "correctIndex": 0,
      "hint": "সাহায্যকারী সূত্র বা ক্লু",
      "explanation": "ধাপে ধাপে সমাধান ও সঠিক উত্তরের ব্যাখ্যা"
    }
  ]
}
`;

    const quizOutput = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = extractJsonFromText(quizOutput);
    return res.json({ success: true, quiz: parsed });
  } catch (error: any) {
    console.error('Quiz error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate quiz' });
  }
});

// Google Search Console automatic verification file handler
app.get(/google[a-zA-Z0-9_-]+\.html$/, (req, res) => {
  const filename = path.basename(req.path);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`google-site-verification: ${filename}`);
});

// Download full project source code as a ZIP file directly
app.get('/api/download-zip', async (_req, res) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();

    function addDirToZip(currentDir: string, zipFolder: any) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        if (
          item === 'node_modules' ||
          item === '.git' ||
          item === 'dist' ||
          item === '.env' ||
          item.endsWith('.log')
        ) {
          continue;
        }
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          addDirToZip(fullPath, subFolder);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    }

    addDirToZip(rootDir, zip);
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mathmate-project.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.end(zipBuffer);
  } catch (error: any) {
    console.error('Error generating project zip:', error);
    res.status(500).send('Failed to generate project zip');
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
