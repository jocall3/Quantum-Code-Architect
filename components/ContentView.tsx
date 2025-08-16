
import React from 'react';
import type { StoryContent } from '../types';
import { Loader2, AlertTriangle, FileSearch, BrainCircuit } from 'lucide-react';

interface ContentViewProps {
  analyses: StoryContent[];
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
}

const Spinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center h-full">
        <Loader2 className="animate-spin text-sky-400 h-12 w-12 mb-4" />
        <p className="text-sky-300 text-lg">{message}</p>
        <p className="text-sm text-slate-400 mt-1">Processing complex quantum algorithms...</p>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
        <FileSearch className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-2xl font-bold text-slate-300">Quantum Code Architect</h3>
        <p className="mt-2 max-w-sm">Select a topic from the initial curriculum on the left to begin your research session.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center h-full text-red-400 p-4">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h3 className="text-2xl font-bold">Analysis Failed</h3>
        <p className="mt-2 max-w-md bg-red-900/50 p-3 rounded-md border border-red-500/50">{message}</p>
    </div>
);

const AnalysisBlock: React.FC<{ analysis: StoryContent }> = ({ analysis }) => (
    <div className="animate-fade-in mb-8 pb-8 border-b-2 border-slate-700/50 last:border-b-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-sky-300 mb-2">{analysis.title}</h2>
        <p className="text-sm text-slate-400 mb-4 border-b border-slate-600 pb-2 font-mono">TECHNICAL ANALYSIS OF: {analysis.topic}</p>
        <div className="space-y-6">
            {analysis.imageUrl ? (
                <img src={analysis.imageUrl} alt={`Generated image for ${analysis.title}`} className="w-full h-auto object-cover rounded-md shadow-lg border-2 border-slate-700" />
            ) : (
                <div className="w-full aspect-video bg-slate-900/50 rounded-md flex items-center justify-center">
                    <Loader2 className="animate-spin text-sky-400 h-8 w-8" />
                    <span className="ml-3">Visualizing quantum circuits...</span>
                </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-sky-400 mb-2">Table of Contents</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                {analysis.tableOfContents.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-sky-400 mb-2 mt-4">Detailed Analysis</h3>
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base prose prose-invert prose-pre:bg-slate-900/70 prose-pre:text-slate-200" dangerouslySetInnerHTML={{ __html: analysis.story.replace(/```(python|pseudocode)?\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>').replace(/\n/g, '<br />').replace(/<br \/>(<pre>)/g, '$1').replace(/(<\/pre>)<br \/>/g, '$1') }}></div>
            </div>
        </div>
    </div>
);

const NextTopicsBlock: React.FC<{ topics: string[], onSelect: (topic: string) => void, disabled: boolean }> = ({ topics, onSelect, disabled }) => (
    <div className="animate-fade-in mt-4 p-4 bg-slate-900/50 border border-sky-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center gap-2"><BrainCircuit size={20}/> Next Research Paths</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topics.map((topic, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(topic)}
                    disabled={disabled}
                    className="p-3 text-left bg-slate-700/50 hover:bg-sky-600/40 rounded-md transition-all duration-200 border border-transparent hover:border-sky-500 disabled:opacity-50 disabled:cursor-wait"
                >
                    {topic}
                </button>
            ))}
        </div>
    </div>
);


export const ContentView: React.FC<ContentViewProps> = ({ analyses, onSelectTopic, isLoading, loadingStage, error }) => {
    const lastAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;

    return (
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 sm:p-6 min-h-[80vh] flex flex-col transition-all duration-500">
          <div className="overflow-y-auto flex-grow">
            {analyses.length === 0 && !isLoading && !error && <InitialState />}

            {analyses.map((analysis, index) => (
                <AnalysisBlock key={index} analysis={analysis} />
            ))}
            
            {lastAnalysis?.nextTopics && !isLoading && (
                <NextTopicsBlock topics={lastAnalysis.nextTopics} onSelect={onSelectTopic} disabled={isLoading} />
            )}

            {isLoading && (
                <div className="mt-8">
                    <Spinner message={loadingStage} />
                </div>
            )}
            {error && (
                <div className="mt-8">
                    <ErrorState message={error} />
                </div>
            )}
          </div>
        </div>
    );
};

// Add fade-in animation to a style tag
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);
