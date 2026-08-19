"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, Code } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type AnalysisData = {
  thought_process: string;
  overall_sentiment: string;
  summary: string;
  emotions: string[];
  sentence_analysis: { sentence: string; sentiment: string }[];
  kpis: {
    Agent_Empathy_Score: number;
    Customer_Frustration_Index: number;
    Resolution_Likelihood: number;
  };
  eval_score?: number;
  eval_iterations?: number;
  total_tokens?: number;
  total_cost?: number;
};

const COLORS = {
  Positive: "#10B981", // Sage Green
  Neutral: "#D1D5DB",  // Sandstone
  Negative: "#EF4444"  // Terracotta
};

export default function DashboardUI() {
  const [file, setFile] = useState<File | null>(null);
  const [enableEval, setEnableEval] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    setLoading(true);
    setError("");
    setShowRaw(false);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("threshold", enableEval ? threshold.toString() : "0");

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        if (res.status === 401) router.push("/");
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-brand-border bg-brand-surface p-20 text-center transition hover:border-brand-accent/50 shadow-soft">
        <h3 className="mb-4 text-4xl font-serif text-brand-text">Drop a conversation here.</h3>
        <p className="mb-10 text-sm text-brand-muted">.txt transcript files only.</p>
        
        <input 
          type="file" 
          accept=".txt" 
          className="hidden" 
          id="file-upload" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer border border-brand-border px-8 py-3 text-sm font-semibold text-brand-text hover:bg-brand-bg transition w-full"
          >
            {file ? file.name : "Select File"}
          </label>

          {file && (
            <div className="w-full text-left space-y-4 border border-brand-border p-4 bg-brand-bg/50">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-text">
                <input 
                  type="checkbox" 
                  checked={enableEval} 
                  onChange={(e) => setEnableEval(e.target.checked)}
                  className="w-4 h-4 accent-brand-accent cursor-pointer"
                />
                Enable QA Agent Self-Correction
              </label>

              {enableEval && (
                <div className="space-y-2 mt-4 pt-4 border-t border-brand-border">
                  <label className="flex justify-between text-xs font-semibold text-brand-muted uppercase tracking-widest">
                    <span>Self-Eval Threshold</span>
                    <span className="text-brand-accent font-bold">{threshold} / 10</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={threshold} 
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full accent-brand-accent"
                  />
                  <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                    The AI will grade its own output. If it scores below {threshold}, it will reflect on its mistakes and re-generate a new analysis up to 3 times.
                  </p>
                </div>
              )}
            </div>
          )}

          {file && (
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-brand-accent px-8 py-4 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 transition w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Agent actively reasoning..." : "Read Transcript"}
            </button>
          )}
        </div>
        
        {error && (
          <div className="mt-8 flex items-center gap-2 text-brand-negative text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  const distribution = (data.sentence_analysis || []).reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.keys(distribution).map(key => ({
    name: key,
    value: distribution[key]
  }));

  return (
    <div className="space-y-8">
      {/* Top Row: AI Summary & Flow */}
      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Executive Summary (Human element serif) */}
        <div className="md:col-span-2 border border-brand-border bg-brand-surface p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest">Conversation Summary</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center gap-1 text-xs border border-brand-border px-3 py-1 hover:bg-brand-bg text-brand-text transition"
              >
                <Code className="w-3 h-3" /> {showRaw ? "Hide Raw Data" : "View Raw JSON"}
              </button>
              <span className={`px-4 py-1 text-xs font-semibold border border-brand-border
                ${data.overall_sentiment === 'Positive' ? 'text-brand-positive' : 
                  data.overall_sentiment === 'Negative' ? 'text-brand-negative' : 
                  'text-brand-muted'}`}>
                {data.overall_sentiment}
              </span>
            </div>
          </div>

          {showRaw && (
            <div className="mb-6 p-4 bg-brand-bg border border-brand-border overflow-auto max-h-96">
              <pre className="text-[10px] text-brand-muted font-mono whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          <p className="text-brand-text text-xl font-serif leading-relaxed mb-8">
            "{data.summary}"
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {(data.emotions || []).map((emotion, i) => (
              <span key={i} className="border border-brand-border px-3 py-1 text-xs text-brand-text">
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {/* Sentiment Chart */}
        <div className="border border-brand-border bg-brand-surface p-8 flex flex-col shadow-soft">
          <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-6">Sentiment Flow</h2>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  stroke="var(--brand-surface)"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Neutral} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--brand-text)', borderColor: 'var(--brand-text)', color: 'var(--brand-bg)', borderRadius: '0px' }}
                  itemStyle={{ color: 'var(--brand-bg)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-8 md:grid-cols-3">
        {Object.entries(data.kpis || {}).map(([key, value]) => (
          <div key={key} className="border border-brand-border bg-brand-surface p-8 shadow-soft">
            <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-4">{key.replace(/_/g, ' ')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-brand-text">{value}</span>
              <span className="text-brand-muted font-serif italic">/ 10</span>
            </div>
            <div className="mt-6 h-1 w-full bg-brand-bg">
              <div 
                className="h-full bg-brand-accent" 
                style={{ width: `${(Number(value) / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Agent Rationale & Evaluation */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Thought Process */}
        <div className="md:col-span-2 border border-brand-border bg-brand-bg p-8 shadow-soft">
          <h2 className="text-xs font-semibold text-brand-text uppercase tracking-widest mb-4">Agentic Rationale</h2>
          <p className="text-sm text-brand-muted leading-relaxed font-mono">
            {data.thought_process}
          </p>
        </div>

        {/* Evaluation Metrics */}
        <div className="border border-brand-border bg-brand-surface p-8 shadow-soft flex flex-col space-y-6">
          <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2">Agent Evaluation</h2>
          
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <span className="text-sm text-brand-text">Evaluation Score</span>
            <span className="font-bold text-brand-accent">{data.eval_score ?? "N/A"} / 10</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <span className="text-sm text-brand-text">Tokens Consumed</span>
            <span className="font-mono text-brand-muted text-sm">{data.total_tokens?.toLocaleString() ?? 0}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <span className="text-sm text-brand-text">Inference Cost</span>
            <span className="font-mono text-brand-muted text-sm">${data.total_cost?.toFixed(6) ?? "0.000000"}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-text">Reflection Loops</span>
            <span className="font-mono text-brand-muted text-sm">{data.eval_iterations ?? 1}</span>
          </div>
        </div>
      </div>

      {/* Sentence Breakdown */}
      <div className="border border-brand-border bg-brand-surface p-8 shadow-soft">
        <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-6">Line-by-Line Breakdown</h2>
        <div className="space-y-0">
          {(data.sentence_analysis || []).map((item, i) => (
            <div key={i} className="flex items-start gap-6 border-b border-brand-border last:border-0 py-4">
              <div className={`mt-2 h-2 w-2 flex-shrink-0
                ${item.sentiment === 'Positive' ? 'bg-brand-positive' : 
                  item.sentiment === 'Negative' ? 'bg-brand-negative' : 
                  'bg-brand-neutral'}`} 
              />
              <p className="text-brand-text font-serif text-lg leading-relaxed">{item.sentence}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-16">
        <button 
          onClick={() => { setFile(null); setData(null); }}
          className="text-xs font-semibold text-brand-accent uppercase tracking-widest hover:opacity-70 transition"
        >
          Analyze Another Transcript
        </button>
      </div>
    </div>
  );
}
