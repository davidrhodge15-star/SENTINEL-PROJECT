import React, { useState, useEffect } from 'react';

function App() {
  const [target, setTarget] = useState('');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/scans');
      const data = await response.json();
      setHistory(data);
    } catch (err) { 
      console.error("History offline"); 
    }
  };

  const deleteScan = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:8000/scans/${id}`, { method: 'DELETE' });
      if (res.ok) fetchHistory(); 
    } catch (err) {
      console.error("Failed to delete scan", err);
    }
  };

  const clearAllScans = async () => {
    if (!window.confirm("Are you sure you want to delete ALL scan history?")) return;
    try {
      const res = await fetch('http://localhost:8000/scans', { method: 'DELETE' });
      if (res.ok) fetchHistory();
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const runDiscovery = async () => {
    setLoading(true);
    setError(null);
    const cleanTarget = target.trim();
    if (!cleanTarget) {
      setError("Please enter a target IP address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: cleanTarget }),
      });
      if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.detail?.[0]?.msg || "Validation Error");
      }
      const data = await res.json();
      setResults(data);
      fetchHistory(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">History</h2>
          {history.length > 0 && (
            <button onClick={clearAllScans} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-tighter transition-colors">
              Clear All
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {history.map((s) => (
            <div key={s.id} className="relative group">
              <button 
                onClick={() => setResults({target: s.target, summary: s.result_data})}
                className="w-full text-left p-3 rounded bg-slate-950 border border-slate-800 hover:border-blue-500 transition-all pr-10"
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm font-bold text-blue-400 truncate">{s.target}</div>
                  <div className="flex gap-2 items-center">
                    {/* Status Badge */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">
                      {s.port_count || 0} Ports
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">{new Date(s.scan_time).toLocaleTimeString()}</div>
              </button>
              <button onClick={(e) => deleteScan(s.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-2 transition-opacity">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black mb-8">SENTINEL <span className="text-blue-500">v1.0</span></h1>
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 flex gap-4">
            <input 
              type="text" 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              placeholder="127.0.0.1" 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" 
            />
            <button 
              onClick={runDiscovery} 
              disabled={loading || !target}
              className="bg-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'SCANNING...' : 'RUN DISCOVERY'}
            </button>
          </div>

          {error && <div className="p-4 mb-8 bg-red-900/20 border border-red-900 text-red-400 rounded-lg font-medium">⚠️ {error}</div>}

          {/* Loading State Overlay */}
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-400 font-mono text-sm animate-pulse text-center">
                Scanning target {target}...<br/>
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">Executing Nmap Sequence</span>
              </p>
            </div>
          ) : results && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 font-bold text-blue-400">Target: {results.target}</div>
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider">
                  <tr><th className="p-4">Port</th><th className="p-4">Service</th><th className="p-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.summary?.tcp ? Object.entries(results.summary.tcp).map(([port, info]) => (
                    <tr key={port} className="hover:bg-blue-500/5 transition-colors">
                      <td className="p-4 font-mono text-blue-400">{port}</td>
                      <td className="p-4">{info.name}</td>
                      <td className="p-4"><span className="px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 text-xs font-bold uppercase">{info.state}</span></td>
                    </tr>
                  )) : <tr><td colSpan="3" className="p-8 text-center text-slate-500 italic">No open ports found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;          