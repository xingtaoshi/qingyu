import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Radio,
  X,
  Gauge,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Cpu
} from 'lucide-react';
import { QkdMetrics } from '../types/security';

interface QkdTelemetryModalProps {
  isOpen: boolean;
  metrics: QkdMetrics;
  onClose: () => void;
  onRecalibrate: () => void;
}

export const QkdTelemetryModal: React.FC<QkdTelemetryModalProps> = ({
  isOpen,
  metrics,
  onClose,
  onRecalibrate,
}) => {
  const [isCalibrating, setIsCalibrating] = useState(false);

  if (!isOpen) return null;

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      onRecalibrate();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-3xl bg-[#0B0F17] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111722]/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>QKD 量子信道物理层遥测与偏振校准</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  BB84 偏振协议就绪
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                单光子雪崩探测器 (SPAD) 实时偏振基对齐与误码率监控
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#121824] p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">量子误码率 (QBER)</span>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {metrics.qber.toFixed(2)}%
              </div>
              <span className="text-[10px] text-slate-500 block">安全阈值 ≤ 10.0%</span>
            </div>

            <div className="bg-[#121824] p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">量子纠缠密钥池</span>
              <div className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
                {metrics.keyPoolGbit.toFixed(2)} <span className="text-xs font-normal">Gb</span>
              </div>
              <span className="text-[10px] text-slate-500 block">容量使用率 {metrics.poolCapacityPercent}%</span>
            </div>

            <div className="bg-[#121824] p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">基底对齐效率</span>
              <div className="text-xl font-bold font-mono text-blue-400 tabular-nums">
                {metrics.basisReconciliation}%
              </div>
              <span className="text-[10px] text-slate-500 block">四维偏振态对准</span>
            </div>

            <div className="bg-[#121824] p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">光纤信道衰减</span>
              <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                {metrics.fiberAttenuationDbKm} <span className="text-xs font-normal">dB/km</span>
              </div>
              <span className="text-[10px] text-slate-500 block">标准 G.652 单模光纤</span>
            </div>
          </div>

          {/* SPAD Single Photon Detectors */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>超导单光子探测器 (SSPD) 阵列状态</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">深冷温区: 0.8K (超导态)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>探测通道 APD-01 (水平/垂直基)</span>
                  <span className="text-emerald-400 font-bold">{metrics.photonCountApd1.toLocaleString()} cps</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-emerald-400" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>暗计数率: 12 cps</span>
                  <span>偏振抖动: 0.04 rad</span>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>探测通道 APD-02 (斜向偏振基)</span>
                  <span className="text-emerald-400 font-bold">{metrics.photonCountApd2.toLocaleString()} cps</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-blue-400" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>暗计数率: 14 cps</span>
                  <span>偏振抖动: 0.03 rad</span>
                </div>
              </div>
            </div>
          </div>

          {/* QBER Historical Curve Visualization (SVG) */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 font-mono">QBER 实时误码扰动时序波形 (近60秒)</span>
              <span className="text-[10px] font-mono text-slate-400">采样频率: 1000 Hz</span>
            </div>

            <div className="h-28 w-full bg-black/40 rounded-lg p-2 relative flex items-end overflow-hidden border border-white/5">
              {/* Threshold line */}
              <div className="absolute top-1/4 left-0 right-0 border-b border-rose-500/30 border-dashed" />
              <span className="absolute top-1.5 right-2 text-[9px] text-rose-400 font-mono">
                物理窃听红线 (30%)
              </span>

              <div className="absolute top-1/2 left-0 right-0 border-b border-amber-500/20 border-dashed" />
              <span className="absolute top-1/2 right-2 text-[9px] text-amber-400 font-mono -translate-y-4">
                环境扰动预警 (10%)
              </span>

              {/* Dynamic waveform */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path
                  d="M0,45 Q10,43 20,44 T40,42 T60,45 T80,43 T100,44"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-white/10 px-6 bg-[#0E131C] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>量子不可克隆定理硬件防护有效</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCalibrate}
              disabled={isCalibrating}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>{isCalibrating ? '正在校准偏振基准...' : '执行单光子态重对齐'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
