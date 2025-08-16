
import React, { useState, useCallback } from 'react';
import { TopicList } from './components/TopicList';
import { ContentView } from './components/ContentView';
import { LogView } from './components/LogView';
import { QUANTUM_BANKING_TOPICS } from './constants';
import { generateStoryContent, generateStoryImage } from './services/geminiService';
import type { StoryContent, LogEntry } from './types';
import { Terminal, Download, FileText, X, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [sessionAnalyses, setSessionAnalyses] = useState<StoryContent[]>([]);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prevLogs => [...prevLogs, { timestamp: new Date(), message, type }]);
  }, []);

  const handleSelectTopic = useCallback(async (topic: string) => {
    if (isLoading) return;

    setIsLoading(true);
    if (!sessionStarted) {
      setSessionStarted(true);
    }
    setError(null);
    addLog(`Analysis initiated for: "${topic}"`);

    try {
      // Step 1: Generate Story & Next Topics
      setLoadingStage('Synthesizing quantum data...');
      const contentWithoutImage = await generateStoryContent(topic, sessionAnalyses);
      addLog(`Text analysis and topic generation successful for: "${topic}"`, 'success');

      // Add partial content to show text while image loads
      setSessionAnalyses(prev => [...prev, { ...contentWithoutImage, imageUrl: '' }]);

      // Step 2: Generate Image
      setLoadingStage('Visualizing quantum circuits...');
      const imageBase64 = await generateStoryImage(contentWithoutImage.story);
      addLog(`Image generation successful for topic: "${topic}"`, 'success');

      const finalContent = { ...contentWithoutImage, imageUrl: `data:image/jpeg;base64,${imageBase64}` };
      
      // Replace the last item (the one without image) with the full content
      setSessionAnalyses(prev => [...prev.slice(0, -1), finalContent]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(`Failed to generate analysis. ${errorMessage}`);
      addLog(`Error during generation: ${errorMessage}`, 'error');
      // Remove the placeholder analysis that was added temporarily
      setSessionAnalyses(prev => prev.filter(a => a.imageUrl !== ''));
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  }, [isLoading, addLog, sessionAnalyses, sessionStarted]);

  const downloadStoryAsHtml = () => {
    if (sessionAnalyses.length === 0) return;
    addLog('HTML download initiated.');

    const analysesHtml = sessionAnalyses.map(analysis => `
      <div class="analysis-block">
        <h1>${analysis.title}</h1>
        <p><strong>Topic:</strong> ${analysis.topic}</p>
        <img src="${analysis.imageUrl}" alt="Generated image for ${analysis.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;">
        <h2>Table of Contents</h2>
        <ul>
          ${analysis.tableOfContents.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <h2>Detailed Analysis</h2>
        <div class="story-content">${analysis.story.replace(/```(python|pseudocode)?\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>').replace(/\n/g, '<br />').replace(/<br \/>(<pre>)/g, '$1').replace(/(<\/pre>)<br \/>/g, '$1')}</div>
      </div>
    `).join('<hr class="session-divider">');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quantum Code Architect - Session Report</title>
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; background-color: #f8fafc; color: #020617; padding: 2rem; max-width: 800px; margin: auto; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
          h2 { color: #1e293b; margin-top: 2rem; }
          img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
          ul { list-style-type: disc; padding-left: 2rem; }
          pre { background-color: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; }
          code { font-family: 'Roboto Mono', monospace; }
          .analysis-block { margin-bottom: 3rem; padding-bottom: 2rem; }
          .session-divider { margin: 3rem 0; border: none; border-top: 2px dashed #cbd5e1; }
        </style>
      </head>
      <body>
        ${analysesHtml}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qca-session-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  (window as any).__APP_LOGS__ = logs;

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8 text-slate-300 selection:bg-sky-300 selection:text-slate-900">
      <header className="text-center mb-8 border-b border-slate-700 pb-4">
        <div className="flex justify-center items-center gap-4">
            <BrainCircuit className="text-sky-400" size={40} />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-sky-400">Quantum Code Architect</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-400 mt-2">AI-Powered Technical Analysis for Quantum Finance Developers</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        <aside className="lg:col-span-1 h-full">
          <TopicList
            topics={QUANTUM_BANKING_TOPICS}
            onSelectTopic={handleSelectTopic}
            disabled={isLoading || sessionStarted}
          />
        </aside>

        <section className="lg:col-span-2">
          <ContentView
            analyses={sessionAnalyses}
            onSelectTopic={handleSelectTopic}
            isLoading={isLoading}
            loadingStage={loadingStage}
            error={error}
          />
        </section>
      </main>

      <footer className="fixed bottom-4 right-4 flex items-center gap-3">
        {sessionAnalyses.length > 0 && (
           <button onClick={downloadStoryAsHtml} title="Download Session as HTML" className="p-2 bg-slate-700 hover:bg-sky-600 border border-slate-600 rounded-full transition-all duration-300 text-sky-300 hover:text-white">
             <FileText size={20} />
           </button>
        )}
        <button onClick={() => setShowLogs(!showLogs)} title="View Activity Log" className="p-2 bg-slate-700 hover:bg-sky-600 border border-slate-600 rounded-full transition-all duration-300 text-sky-300 hover:text-white">
          <Terminal size={20} />
        </button>
      </footer>

      {showLogs && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[80vh] bg-slate-800/90 border border-sky-500/50 rounded-lg shadow-2xl shadow-sky-500/10 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-sky-500/30">
              <h2 className="text-xl font-bold text-sky-300">Activity Log</h2>
              <div className="flex gap-2">
                <button onClick={() => { addLog('Log download initiated.'); downloadLogs(); }} title="Download Logs" className="p-2 text-slate-300 hover:bg-slate-600 rounded-full transition-colors">
                  <Download size={18} />
                </button>
                <button onClick={() => setShowLogs(false)} title="Close" className="p-2 text-slate-300 hover:bg-red-500/50 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            <LogView logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for downloading logs
const downloadLogs = () => {
    const logState = (window as any).__APP_LOGS__;
    if (!logState || logState.length === 0) return;

    const logText = logState.map((log: LogEntry) => `[${new Date(log.timestamp).toISOString()}] [${log.type.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qca-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default App;
