
import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface LogViewProps {
  logs: LogEntry[];
}

const getLogColor = (type: LogEntry['type']) => {
  switch (type) {
    case 'info':
      return 'text-cyan-400';
    case 'success':
      return 'text-green-400';
    case 'error':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

export const LogView: React.FC<LogViewProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div ref={logContainerRef} className="flex-grow p-4 bg-black/50 overflow-y-auto font-mono text-sm">
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start">
            <span className="text-gray-500 mr-3">{log.timestamp.toLocaleTimeString()}</span>
            <span className={`mr-3 font-bold ${getLogColor(log.type)}`}>[{log.type.toUpperCase()}]</span>
            <p className="flex-1 whitespace-pre-wrap break-words">{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
