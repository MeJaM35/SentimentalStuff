"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
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
};

const COLORS = {
  Positive: "#10B981", // Sage Green
  Neutral: "#D1D5DB",  // Sandstone
  Negative: "#EF4444"  // Terracotta
};

export default function DashboardUI() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalysisData | null>(null);
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
    
    const formData = new FormData();
    formData.append("file", file);

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
        
        <div className="flex flex-col items-center gap-4">
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer border border-brand-border px-8 py-3 text-sm font-semibold text-brand-text hover:bg-brand-bg transition"
          >
            {file ? file.name : "Select File"}
          </label>

          {file && (
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="flex items-center gap-2 bg-brand-accent px-8 py-3 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 transition"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Analyzing sentiment..." : "Read Transcript"}
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

  const distribution = data.sentence_analysis.reduce((acc, curr) => {
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
            <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest">Conversation Summary</h2>
            <span className={`px-4 py-1 text-xs font-semibold border border-brand-border
              ${data.overall_sentiment === 'Positive' ? 'text-brand-positive' : 
                data.overall_sentiment === 'Negative' ? 'text-brand-negative' : 
                'text-brand-muted'}`}>
              {data.overall_sentiment}
            </span>
          </div>
          <p className="text-brand-text text-xl font-serif leading-relaxed mb-8">
            "{data.summary}"
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {data.emotions.map((emotion, i) => (
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
        {Object.entries(data.kpis).map(([key, value]) => (
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

      {/* Thought Process */}
      <div className="border border-brand-border bg-brand-bg p-8 shadow-soft">
        <h2 className="text-xs font-semibold text-brand-text uppercase tracking-widest mb-4">Agentic Rationale</h2>
        <p className="text-sm text-brand-muted leading-relaxed font-mono">
          {data.thought_process}
        </p>
      </div>

      {/* Sentence Breakdown */}
      <div className="border border-brand-border bg-brand-surface p-8 shadow-soft">
        <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-6">Line-by-Line Breakdown</h2>
        <div className="space-y-0">
          {data.sentence_analysis.map((item, i) => (
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
