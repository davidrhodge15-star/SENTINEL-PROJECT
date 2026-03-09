import React, { useState, useRef } from 'react';
import { Upload, Activity, Shield, Cpu, TrendingUp, CheckCircle, FileText, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  const [data, setData] = useState([
    { name: 'Node-01', amount: 45 },
    { name: 'Node-02', amount: 82 },
    { name: 'Node-03', amount: 35 },
  ]);
  const [integrityScore, setIntegrityScore] = useState(4300);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Constants for Diagnostic Thresholds
  const WARNING_THRESHOLD = 1500;

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/upload', formData);
      if (response.data.status === "success") {
        setData(response.data.chart_data);
        setIntegrityScore(response.data.total_balance);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Diagnostic Backend Offline. Ensure main.py is active.");
    } finally {
      setUploading(false);
      event.target.value = null; 
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); 
    doc.text("Sentinel: Advanced Diagnostic Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`System Integrity Value: ${integrityScore.toLocaleString()}`, 20, 32);
    doc.text(`Analysis Timestamp: ${new Date().toLocaleString()}`, 20, 39);

    const tableRows = data.map(item => [item.name, item.amount.toFixed(2)]);
    autoTable(doc, {
      startY: 50,
      head: [['Data Node', 'Diagnostic Value']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontStyle: 'bold' },
      styles: { cellPadding: 5, fontSize: 10 }
    });

    doc.save(`Sentinel_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="text-emerald-400 w-8 h-8" /> Sentinel Diagnostics
            </h1>
            <p className="text-slate-400 mt-1">Full-Stack Data Analysis & Integrity Engine</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={generatePDF}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-xl border border-slate-800 transition-all active:scale-95 shadow-lg"
            >
              <FileText className="w-4 h-4 text-emerald-400" /> Generate Report
            </button>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-2xl min-w-[200px]">
              <Zap className="text-emerald-400" />
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {integrityScore.toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        {/* System Status Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <Activity className="text-emerald-500 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Engine Status</p>
              <p className="text-sm font-semibold">Active / Monitoring</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <Cpu className="text-blue-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Process Logic</p>
              <p className="text-sm font-semibold">Pandas v3.1 Engine</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <TrendingUp className="text-purple-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Data Integrity</p>
              <p className="text-sm font-semibold">99.8% Optimized</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Card */}
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`bg-slate-900 border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${uploading ? 'border-emerald-500 animate-pulse' : 'border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/50'}`}
          >
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".csv" />
            <div className="bg-slate-800 p-6 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
              {uploading ? <Activity className="w-10 h-10 text-emerald-400 animate-spin" /> : <Upload className="w-10 h-10 text-emerald-400" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">{uploading ? 'Analyzing Stream...' : 'Import Dataset'}</h3>
            <p className="text-slate-500 text-center text-sm max-w-xs">Drop your .csv logs here to trigger the Python diagnostic pipeline.</p>
          </div>

          {/* Visualization Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-auto shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Metric Distribution
              </h3>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Real-Time</span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', radius: 4}} 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} 
                  />
                  <ReferenceLine y={WARNING_THRESHOLD} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Threshold', fill: '#ef4444', fontSize: 10 }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.amount > WARNING_THRESHOLD ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-slate-500 italic">
              * Bars automatically flag Red when data metrics exceed the defined safety threshold.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;