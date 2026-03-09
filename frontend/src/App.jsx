import React, { useState } from "react";
import { Upload, Activity, Shield, Cpu, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import axios from "axios";

const App = () => {
  const [data, setData] = useState([]);
  const [systemStatus, setSystemStatus] = useState("Idle");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSystemStatus("Analyzing...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/upload", formData);
      if (response.data.error) {
        setSystemStatus("File Error");
      } else {
        setData(response.data);
        setSystemStatus("Active");
      }
    } catch (error) {
      setSystemStatus("Error");
    }
  };

  const hasCriticalAlert = data.some(item => item.Value > 1500);

  // UI Styles
  const containerStyle = { minHeight: "100vh", backgroundColor: "#0f172a", color: "#f1f5f9", padding: "40px", fontFamily: "sans-serif" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155" };
  const statusBox = { 
    backgroundColor: "#1e293b", padding: "10px 20px", borderRadius: "8px", 
    border: `1px solid ${hasCriticalAlert ? "#ef4444" : "#334155"}`,
    transition: "all 0.3s ease"
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Shield size={40} color={hasCriticalAlert ? "#ef4444" : "#60a5fa"} />
            <h1 style={{ fontSize: "32px", margin: 0, fontWeight: "bold" }}>Sentinel Diagnostics</h1>
          </div>
          <div style={statusBox}>
            <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0, textTransform: "uppercase", fontWeight: "bold" }}>System Health</p>
            <p style={{ fontSize: "14px", fontFamily: "monospace", margin: 0, color: hasCriticalAlert ? "#ef4444" : "#10b981" }}>
              {hasCriticalAlert ? "CRITICAL OVERLOAD" : systemStatus}
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div style={{ ...cardStyle, border: "2px dashed #475569", textAlign: "center", marginBottom: "30px", cursor: "pointer" }}>
          <input type="file" onChange={handleFileUpload} style={{ display: "none" }} id="csv-up" />
          <label htmlFor="csv-up" style={{ cursor: "pointer" }}>
            <Upload size={48} color="#94a3b8" style={{ marginBottom: "15px" }} />
            <h2 style={{ fontSize: "20px", margin: "0 0 10px 0" }}>Import Diagnostic Log</h2>
            <p style={{ color: "#94a3b8", margin: 0 }}>Click to select warning_log.csv</p>
          </label>
        </div>

        {/* Chart View */}
        {data.length > 0 && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h3 style={{ fontSize: "18px", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <Activity size={20} color="#10b981" /> Live Threshold Analysis
              </h3>
              {hasCriticalAlert && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#ef4444", fontSize: "12px", fontWeight: "bold" }}>
                  <AlertCircle size={16} /> THRESHOLD VIOLATION DETECTED
                </div>
              )}
            </div>

            <div style={{ height: "400px", width: "100%" }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <XAxis dataKey="Metric Name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff10' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} 
                  />
                  <ReferenceLine y={1500} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'right', value: '1500 limit', fill: '#ef4444', fontSize: 10 }} />
                  <Bar dataKey="Value" radius={[4, 4, 0, 0]} barSize={50}>
                    {data.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.Value > 1500 ? "#ef4444" : "#10b981"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ marginTop: "20px", fontSize: "11px", color: "#64748b", fontStyle: "italic", borderTop: "1px solid #334155", paddingTop: "15px" }}>
              * Sentinel Engine automatically flags metrics exceeding the 1500 safety threshold in 🔴 Red.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;