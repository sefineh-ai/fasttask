import React, { useState } from 'react';
import { PYTHON_FASTAPI_FILES, PythonFileTemplate } from '../fastapi_spec/pythonCodeTemplates';
import { Copy, Check, Download, FileCode, BookOpen, Cpu, Terminal, ArrowRight } from 'lucide-react';

export const FastAPICodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileTemplate>(PYTHON_FASTAPI_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                Python 3.10+
              </span>
              <h2 className="text-xl font-bold text-neutral-900">
                Production FastAPI Architecture
              </h2>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
              Explore the complete backend codebase structured according to FastAPI best practices.
              Featuring asynchronous route handlers, Pydantic V2 data validation, and SQLAlchemy 2.0 async sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {selectedFile.filename}</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-4">
          {PYTHON_FASTAPI_FILES.map((file) => {
            const isSelected = selectedFile.filename === file.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                <span>{file.filename}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Display Container */}
      <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden shadow-lg">
        {/* Code Bar Header */}
        <div className="bg-neutral-900/90 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="font-mono text-neutral-200 font-medium">{selectedFile.filename}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 text-[11px]">{selectedFile.description}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>{selectedFile.code.split('\n').length} lines</span>
          </div>
        </div>

        {/* Code Lines with line numbers */}
        <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <tbody>
              {selectedFile.code.split('\n').map((line, idx) => (
                <tr key={idx} className="hover:bg-neutral-900/50">
                  <td className="w-10 pr-4 text-right text-neutral-600 select-none text-[11px] font-mono tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="text-neutral-200 whitespace-pre">
                    {/* Basic syntax coloring for Python keywords */}
                    {formatPythonLine(line)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900 text-xs">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Asynchronous Event Loop</span>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            FastAPI builds on Starlette and uvloop, allowing thousands of concurrent task requests per second without blocking thread pools.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900 text-xs">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Pydantic V2 Type Safety</span>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Data models automatically validate request payloads, deserialize dates, and power interactive OpenAPI docs without duplicate code.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900 text-xs">
            <Terminal className="w-4 h-4 text-neutral-800" />
            <span>Dependency Injection</span>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Modular <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">Depends()</code> guarantees database sessions, user auth, and rate limiters are cleanly composed.
          </p>
        </div>
      </div>
    </div>
  );
};

function formatPythonLine(line: string) {
  if (line.trim().startsWith('#') || line.trim().startsWith('"""')) {
    return <span className="text-neutral-500 italic">{line}</span>;
  }
  return line;
}
