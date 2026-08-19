"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
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
  Positive: "#10b981", // Emerald 500
  Neutral: "#6b7280",  // Gray 500
  Negative: "#ef4444"  // Red 500
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <UploadCloud className="mb-4 h-12 w-12 text-zinc-500" />
        <h3 className="mb-2 text-lg font-semibold text-white">Upload Conversation Transcript</h3>
        <p className="mb-6 text-sm text-zinc-400">Only .txt files are supported for this POC.</p>
        
        <input 
          type="file" 
          accept=".txt" 
          className="hidden" 
          id="file-upload" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition mb-4"
        >
          {file ? file.name : "Select File"}
        </label>
        
        {file && (
          <button 
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Analyzing via Gemini AI..." : "Analyze Transcript"}
          </button>
        )}
        
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Calculate sentiment distribution for the pie chart
  const distribution = data.sentence_analysis.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.keys(distribution).map(key => ({
    name: key,
    value: distribution[key]
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary Card */}
        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">AI Executive Summary</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${data.overall_sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' : 
                data.overall_sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' : 
                'bg-zinc-500/10 text-zinc-400'}`}>
              Overall: {data.overall_sentiment}
            </span>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-6">{data.summary}</p>
          
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Detected Emotions:</h3>
          <div className="flex flex-wrap gap-2">
            {data.emotions.map((emotion, i) => (
              <span key={i} className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 border border-zinc-700">
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {/* Chart Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-2">Sentiment Flow</h2>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Neutral} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(data.kpis).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">{key.replace(/_/g, ' ')}</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{value}</span>
              <span className="text-zinc-500 mb-1">/ 10</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(Number(value) / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Thought Process (CoT) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Agent Thought Process</h2>
        <p className="text-sm text-zinc-400 italic leading-relaxed font-mono">
          {data.thought_process}
        </p>
      </div>

      {/* Sentence Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Sentence Breakdown</h2>
        <div className="space-y-2">
          {data.sentence_analysis.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition">
              <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0
                ${item.sentiment === 'Positive' ? 'bg-emerald-500' : 
                  item.sentiment === 'Negative' ? 'bg-red-500' : 
                  'bg-zinc-500'}`} 
              />
              <p className="text-sm text-zinc-300 leading-relaxed">{item.sentence}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <button 
          onClick={() => { setFile(null); setData(null); }}
          className="text-sm font-medium text-zinc-400 hover:text-white transition"
        >
          Analyze Another Transcript
        </button>
      </div>
    </div>
  );
}
