import React, { useState } from 'react';
import { SolvedProblem } from '../types';
import { MathView } from './MathView';
import { X, Search, Bookmark, Trash2, Calendar, ArrowRight, BookOpen } from 'lucide-react';

interface HistoryDrawerProps {
  history: SolvedProblem[];
  onSelectProblem: (problem: SolvedProblem) => void;
  onToggleBookmark: (id: string) => void;
  onDeleteProblem: (id: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectProblem,
  onToggleBookmark,
  onDeleteProblem,
  onClearHistory,
  onClose,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBookmark, setFilterBookmark] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.problemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detectedProblemText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBookmark = filterBookmark ? item.isBookmarked : true;
    return matchesSearch && matchesBookmark;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              📚
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {language === 'bn' ? 'সমাধানের ইতিহাস ও বুকমার্ক' : 'Solution History & Bookmarks'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? `মোট সংরক্ষিত: ${history.length} টি সমস্যা`
                  : `Saved problems: ${history.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'bn' ? 'ইতিহাস খুঁজুন...' : 'Search history...'}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setFilterBookmark(!filterBookmark)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition ${
                filterBookmark
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'শুধু বুকমার্ক' : 'Bookmarks Only'}</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-red-400 hover:text-red-300 text-[11px] flex items-center space-x-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 shadow transition group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                  {item.topic}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className={`p-1 rounded hover:bg-slate-800 transition ${
                      item.isBookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => onDeleteProblem(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-white text-xs sm:text-sm line-clamp-1 mb-1">
                {item.problemTitle}
              </h4>

              <div className="text-xs text-slate-400 line-clamp-2 mb-2 font-mono bg-slate-900/80 p-1.5 rounded">
                <MathView content={item.detectedProblemLatex || item.detectedProblemText} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => {
                    onSelectProblem(item);
                    onClose();
                  }}
                  className="font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition"
                >
                  <span>{language === 'bn' ? 'সমাধান দেখুন' : 'View Solution'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">
                {language === 'bn' ? 'কোনো ইতিহাস পাওয়া যায়নি।' : 'No saved problems found.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
