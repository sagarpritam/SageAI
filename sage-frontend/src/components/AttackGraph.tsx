import React from 'react';

interface Node {
  id: string;
  label: string;
  type: 'target' | 'vulnerability';
  severity?: string;
}

interface Edge {
  source: string;
  target: string;
}

interface AttackGraphProps {
  data: {
    nodes: Node[];
    edges: Edge[];
  };
}

const AttackGraph: React.FC<AttackGraphProps> = ({ data }) => {
  if (!data || !data.nodes || data.nodes.length === 0) return null;

  // Simple static visualization for now
  return (
    <div className="mt-8 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        Attack Graph Visualization
      </h3>
      <div className="flex flex-wrap gap-4 items-center justify-center min-h-[200px]">
        {data.nodes.map((node) => (
          <div 
            key={node.id}
            className={`px-4 py-2 rounded-lg border flex flex-col items-center gap-1 transition-all hover:scale-105 ${
              node.type === 'target' 
                ? 'bg-slate-800 border-slate-700 text-slate-100' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{node.type}</span>
            <span className="text-sm font-mono truncate max-w-[150px]">{node.label}</span>
            {node.severity && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white uppercase mt-1">
                {node.severity}
              </span>
            )}
          </div>
        ))}
        {data.edges.length > 0 && (
            <div className="w-full text-center mt-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Nodes mapping: {data.edges.length} connections identified
            </div>
        )}
      </div>
    </div>
  );
};

export default AttackGraph;
