"use client";

import { ShieldCheck } from "lucide-react";

interface TrustEvidence {
  certificate_score: number;
  provenance_score: number;
  ai_score: number;
  seller_score: number;
  total_score: number;
}

interface TrustEvidenceScoreProps {
  trustEvidence: TrustEvidence;
  compact?: boolean; // For GemCard usage
}

function ScoreBar({ label, score, max, icon }: { label: string; score: number; max: number; icon: string }) {
  const pct = Math.min((score / max) * 100, 100);
  
  // Color based on percentage
  let barColor = "bg-red-400";
  if (pct >= 80) barColor = "bg-emerald-500";
  else if (pct >= 60) barColor = "bg-yellow-400";
  else if (pct >= 40) barColor = "bg-orange-400";

  return (
    <div className="flex items-center gap-3">
      <span className="text-[14px]">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-semibold text-neutral-700">{label}</span>
          <span className="text-[11px] font-bold text-neutral-900">{score.toFixed(0)}/{max}</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function getScoreColor(total: number): string {
  if (total >= 80) return "text-emerald-600";
  if (total >= 60) return "text-yellow-600";
  if (total >= 40) return "text-orange-600";
  return "text-red-600";
}

function getScoreBg(total: number): string {
  if (total >= 80) return "bg-emerald-50 border-emerald-200";
  if (total >= 60) return "bg-yellow-50 border-yellow-200";
  if (total >= 40) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

function getScoreLabel(total: number): string {
  if (total >= 80) return "Excellent Evidence";
  if (total >= 60) return "Good Evidence";
  if (total >= 40) return "Moderate Evidence";
  return "Limited Evidence";
}

export default function TrustEvidenceScore({ trustEvidence, compact = false }: TrustEvidenceScoreProps) {
  const total = trustEvidence.total_score;

  // Compact badge for GemCard
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold ${getScoreBg(total)} ${getScoreColor(total)}`}>
        <ShieldCheck className="w-3 h-3" />
        <span>{Math.round(total)}/100</span>
      </div>
    );
  }

  // Full breakdown for gem detail page
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getScoreBg(total)}`}>
            <ShieldCheck className={`w-5 h-5 ${getScoreColor(total)}`} />
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold text-black tracking-wide">Trust Evidence Score</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">Based on available verification evidence</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[28px] font-black ${getScoreColor(total)}`}>
            {Math.round(total)}
          </div>
          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">/100</div>
        </div>
      </div>

      {/* Score label */}
      <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider mb-5 border ${getScoreBg(total)} ${getScoreColor(total)}`}>
        {getScoreLabel(total)}
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <ScoreBar label="Certificate" score={trustEvidence.certificate_score} max={25} icon="📜" />
        <ScoreBar label="Provenance" score={trustEvidence.provenance_score} max={25} icon="🌍" />
        <ScoreBar label="AI Verification" score={trustEvidence.ai_score} max={25} icon="🤖" />
        <ScoreBar label="Seller Reputation" score={trustEvidence.seller_score} max={25} icon="⭐" />
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-neutral-400 mt-5 leading-relaxed italic border-t border-neutral-100 pt-4">
        This score reflects the amount and quality of available evidence — it does not guarantee authenticity.
        Higher scores indicate more comprehensive documentation and verification.
      </p>
    </div>
  );
}
