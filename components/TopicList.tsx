
import React from 'react';

interface TopicListProps {
  topics: string[];
  onSelectTopic: (topic: string) => void;
  disabled: boolean;
}

export const TopicList: React.FC<TopicListProps> = ({ topics, onSelectTopic, disabled }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-full shadow-lg transition-opacity duration-500 ${disabled ? 'opacity-50' : ''}`}>
      <h2 className="text-xl font-bold text-sky-400 mb-4 border-b border-slate-600 pb-2">Research Curriculum</h2>
      <p className={`text-xs text-slate-400 mb-4 transition-opacity duration-300 ${disabled ? 'opacity-100' : 'opacity-0 h-0'}`}>
        Your session has started. Please select new topics from the analysis panel.
      </p>
      <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {topics.map((topic, index) => {
          return (
            <li key={index}>
              <button
                onClick={() => onSelectTopic(topic)}
                disabled={disabled}
                className={`w-full text-left p-3 rounded-md transition-all duration-200 text-sm flex items-center justify-between gap-3 text-slate-300 hover:bg-slate-700
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                    <span>{topic}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
