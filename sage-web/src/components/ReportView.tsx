"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export interface ScanReport {
  summary: string;
  criticalIssues: string[];
  recommendations: string[];
}

export function ReportView({ report }: { report: ScanReport | null }) {
  if (!report) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950/80 border-emerald-900/50">
        <CardHeader>
          <CardTitle className="text-emerald-400 font-mono flex items-center">
            <Info className="mr-2 h-5 w-5" /> AI Summary Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300 font-mono text-sm leading-relaxed">
            {report.summary}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-950/80 border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400 font-mono flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5" /> Critical Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.criticalIssues.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-red-300 font-mono text-sm">
                {report.criticalIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 font-mono text-sm">No critical issues detected.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/80 border-blue-900/30">
          <CardHeader>
            <CardTitle className="text-blue-400 font-mono flex items-center text-lg">
              <CheckCircle className="mr-2 h-5 w-5" /> Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.recommendations.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-blue-300 font-mono text-sm">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 font-mono text-sm">No specific recommendations.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
