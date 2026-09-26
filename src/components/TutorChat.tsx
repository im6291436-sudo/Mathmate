import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { MathView } from './MathView';
import { SolvedProblem, ChatMessage } from '../types';

interface TutorChatProps {
  currentProblem: SolvedProblem;
  language: 'bn' | 'en';
}

export const TutorChat: React.FC<TutorChatProps> = ({ currentProblem, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Suggested questions
  const suggestedQuestions = language === 'bn' ? [
    'ধাপগুলো আরও সহজভাবে বুঝিয়ে বলো',
    'এই অংকটি সমাধান করার অন্য কোনো শর্টকাট নিয়ম আছে?',
    'পরীক্ষায় কীভাবে লিখলে সম্পূর্ণ নম্বর পাওয়া যাবে?',
    'যদি প্রদত্ত মান দ্বিগুণ হতো তবে উত্তরে কী পরিবর্তন হতো?'
  ] : [
    'Explain these steps in simpler words',
    'Is there another shortcut method for this?',
    'How should I write this in an exam to get full marks?',
    'What if the given values were negative?'
  ];

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 'welcome',
        sender: 'tutor',
        text: language === 'bn'
          ? `নমস্কার / আসসালামু আলাইকুম! আমি আপনার গণিত মিত্র শিক্ষক। "${currentProblem.problemTitle}" সম্পর্কে আপনার যেকোনো জিজ্ঞাসা বা সন্দেহ থাকলে আমাকে প্রশ্ন করতে পারেন!`
          : `Hello! I am your Math Tutor. If you have any doubt about "${currentProblem.problemTitle}", feel free to ask me!`,
        timestamp: Date.now(),
      },
    ]);
  }, [currentProblem.id, language]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContext: {
            title: currentProblem.problemTitle,
            detectedLatex: currentProblem.detectedProblemLatex,
            finalAnswer: currentProblem.finalAnswer,
            steps: currentProblem.steps,
            keyFormulas: currentProblem.keyFormulas,
          },
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          userQuestion: query,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'tutor',
            text: data.reply,
            timestamp: Date.now(),
          },
        ]);
      } else {
        throw new Error(data.error || 'No reply');
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor',
          text: language === 'bn'
            ? 'দুঃখিত, সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'Sorry, connection issue. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center space-x-1.5">
              <span>{language === 'bn' ? 'গণিত টিউটর চ্যাট' : 'AI Math Tutor Chat'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-[11px] text-slate-400">
              {language === 'bn' ? 'সরাসরি প্রশ্ন করে কোনো সন্দেহ দূর করুন' : 'Ask anything about this problem'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}
            >
              <MathView content={msg.text} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 px-3 bg-slate-950/40 rounded-xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>{language === 'bn' ? 'টিউটর চিন্তা করছেন...' : 'Tutor is thinking...'}</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested chips */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'টিউটরকে প্রশ্ন করুন (যেমন: ধাপ ২ আরেকটু বুঝিয়ে দিন)...'
                : 'Ask tutor (e.g. explain step 2 further)...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
