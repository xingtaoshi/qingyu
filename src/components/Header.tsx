import React from 'react';
import {
  Shield,
  Radio,
  Lock,
  Archive,
  Sliders,
  Activity,
  Zap,
  HardDrive
} from 'lucide-react';
import { QkdMetrics } from '../types/security';

interface HeaderProps {
  metrics: QkdMetrics;
  onOpenTelemetry: () => void;
  onOpenRadar: () => void;
  onOpenAudit: () => void;
  onOpenPolicy: () => void;
  onLockScreen: () => void;
  onOpenOperatorDetails: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onOpenTelemetry,
  onOpenRadar,
  onOpenAudit,
  onOpenPolicy,
  onLockScreen,
  onOpenOperatorDetails,
}) => {
  const getQberColorClass = () => {
    if (metrics.status === 'critical') {
      return 'text-rose-400 bg-rose-950/80 border-rose-500/50';
    }
    if (metrics.status === 'warning') {
      return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
    }
    return 'text-emerald-400 bg-[#101726] border-emerald-500/30';
  };

  const getStatusDotColor = () => {
    if (metrics.status === 'critical') return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
    if (metrics.status === 'warning') return 'bg-amber-400 shadow-[0_0_8px_#f59e0b]';
    return 'bg-emerald-400 shadow-[0_0_8px_#10b981]';
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#0C1017] px-4 flex items-center justify-between text-xs shrink-0 select-none z-20">
      {/* Left zone: Brand and differentiated actions */}
      <div className="flex items-center space-x-3">
        {/* Brand wordmark */}
        <div className="flex items-center space-x-2 font-bold tracking-wider text-sm text-white">
          <div className="w-3 h-3 rounded bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span className="whitespace-nowrap">
            轻语 QINGYU <span className="text-blue-400 font-mono font-normal text-xs">v1.0.3 PRO</span>
          </span>
        </div>

        {/* Action 1: Quantum link status capsule (Click to open QKD Link Telemetry) */}
        <button
          onClick={onOpenTelemetry}
          title="点击查看 QKD 量子密钥分发与物理信道遥测监控"
          className={`flex items-center rounded-full px-3 py-1 space-x-2 border transition-all cursor-pointer hover:brightness-125 ${getQberColorClass()}`}
        >
          <span className={`w-2 h-2 rounded-full ${getStatusDotColor()} animate-pulse`} />
          <span className="text-slate-200 font-medium whitespace-nowrap">
            {metrics.status === 'critical'
              ? '量子信道严重异常'
              : metrics.status === 'warning'
              ? '量子信道扰动预警'
              : '量子信道已建立 (QKD-Lock)'}
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono font-bold whitespace-nowrap">QBER: {metrics.qber.toFixed(1)}%</span>
        </button>

        {/* Action 2: Mesh Radar button (Click to open Ad-hoc Mesh Radar) */}
        <button
          onClick={onOpenRadar}
          title="点击开启局域网自组网与对端雷达探测"
          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:bg-blue-900/50 hover:text-white transition cursor-pointer whitespace-nowrap"
        >
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>自组网雷达</span>
        </button>
      </div>

      {/* Middle zone: Real-time telemetry figures */}
      <div className="hidden lg:flex items-center space-x-6 font-mono text-slate-400 text-xs">
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>剩余量子密钥:</span>
          <span className="text-cyan-300 font-bold tabular-nums">{metrics.keyPoolGbit.toFixed(2)} Gbit</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>实时通量:</span>
          <span className="text-slate-200 tabular-nums">{metrics.throughputKbps.toFixed(1)} kbps</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span>安全密钥池:</span>
          <span className="text-amber-300 tabular-nums">{metrics.poolCapacityPercent.toFixed(1)}%</span>
        </div>
      </div>

      {/* Right zone: Tactical operations */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenPolicy}
          title="涉密安全防务策略"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#131924] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">安全策略</span>
        </button>

        <button
          onClick={onOpenAudit}
          title="密态留存与审计中心"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#131924] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">密态留存中心</span>
        </button>

        <button
          onClick={onLockScreen}
          title="锁定当前安全工作台"
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-white/10 text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-amber-300" />
          <span>锁屏</span>
        </button>

        {/* Operator Badge */}
        <button
          onClick={onOpenOperatorDetails}
          title="点击查看当前坐席身份凭证与证书"
          className="flex items-center space-x-2 pl-2 border-l border-white/10 hover:opacity-80 transition cursor-pointer"
        >
          <div className="w-6 h-6 rounded bg-cyan-700/80 border border-cyan-400/40 flex items-center justify-center font-bold text-white text-[10px]">
            OP
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-mono text-slate-200 text-[11px] leading-tight">operator</span>
            <span className="text-[9px] text-slate-400 leading-tight">Level-3</span>
          </div>
        </button>
      </div>
    </header>
  );
};
