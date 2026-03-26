"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

// Next.js doesn't support SSR for react-force-graph-2d out of the box
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export interface GraphData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: { id: string; name: string; val: number; color?: string; type: string; data?: any }[];
  links: { source: string; target: string }[];
}

export function AttackGraph({ data }: { data: GraphData }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 600, // Fixed height for graph
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 600,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card className="bg-black border-emerald-900/50 overflow-hidden relative" ref={containerRef}>
      <CardContent className="p-0 relative">
        <ForceGraph2D
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="name"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodeColor={(node: any) => node.color || (node.type === "vuln" ? "#ef4444" : "#10b981")}
          linkColor={() => "#064e3b"}
          backgroundColor="#000000"
          nodeRelSize={4}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={(node) => setSelectedNode(node)}
        />
        {selectedNode && selectedNode.data && (
          <div className="absolute top-4 right-4 w-96 bg-black/95 text-emerald-400 border border-emerald-900/50 p-4 rounded-xl text-xs overflow-y-auto max-h-[90%] shadow-[0_0_30px_rgba(6,78,59,0.3)] z-50">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-900/50">
              <h3 className="font-bold font-mono text-sm text-emerald-300 uppercase truncate pr-4" title={selectedNode.name}>
                {selectedNode.name}
              </h3>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono leading-relaxed">
              {JSON.stringify(selectedNode.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
