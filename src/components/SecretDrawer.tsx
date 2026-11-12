import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Usb,
  Cpu,
  RefreshCw,
  ChevronLeft,
  Lock,
  Layers,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { QkdMetrics } from '../types/security';

interface SecretDrawerProps {
  isOpen: boolean;
  metrics: QkdMetrics;
  onClose: () => void;
  onSimulateNoise: () => void;
  onSimulateFuse: () => void;
  onResetBaseline: () => void;
  onManualQberChange: (val: number) => void;
}

export const SecretDrawer: React.FC<SecretDrawerProps> = ({
  isOpen,
  metrics,
  onClose,
  onSimulateNoise,
  onSimulateFuse,
  onResetBaseline,
  onManualQberChange,
}) => {
  const [ukeyPlugged, setUkeyPlugged] = useState<boolean>(true);
  const [activeChannel, setActiveChannel] = useState<'TERMINAL_02' | 'TERMINAL_03'>('TERMINAL_02');
  const [isRecharging, setIsRecharging] = useState<boolean>(false);
  const [rechargeSuccess, setRechargeSuccess] = useState<boolean>(false);

  const handleRechargeUkey = () => {
    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      setRechargeSuccess(true);
      setTimeout(() => setRechargeSuccess(false), 3000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-[#0B0F16] border-r border-white/10 flex flex-col p-4 text-xs space-y-4 shrink-0 overflow-y-auto select-none z-10 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <span className="font-bold text-slate-100 flex items-center gap-2 text-sm">
          <KeyRound className="w-4 h-4 text-blue-400" />
          <span>保密序列与介质管理</span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="收起保密抽屉"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Hardware U-Key Status Card */}
      <div className="bg-[#111722] p-3 rounded-lg border border-white/5 space-y-2.5">
        <div className="flex justify-between items-center text-slate-300">
          <span className="font-medium flex items-center gap-1.5">
            <Usb className="w-3.5 h-3.5 text-blue-400" />
            <span>硬件保密介质 (U-Key)</span>
          </span>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
              ukeyPlugged
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-950/80 text-amber-400 border-amber-500/30'
            }`}
          >
            {ukeyPlugged ? '● 已就绪 (插槽 01)' : '○ 未接入'}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px] text-slate-400 border-t border-white/5 pt-2">
          <div className="flex justify-between">
            <span>芯片型号:</span>
            <span className="text-slate-300">{ukeyPlugged ? 'TCM2.0 专用国密' : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span>硬件指纹:</span>
            <span className="text-slate-300">{ukeyPlugged ? 'UK-SM4-202611-098' : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span>量子随机数池:</span>
            <span className="text-cyan-400">{ukeyPlugged ? '100% (4096-bit)' : '0%'}</span>
          </div>
        </div>

        <div className="pt-1 flex gap-2">
          <button
            onClick={() => setUkeyPlugged(!ukeyPlugged)}
            className="flex-1 py-1.5 px-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition text-center cursor-pointer"
          >
            {ukeyPlugged ? '模拟拔出介质' : '模拟插入 U-Key'}
          </button>

          <button
            onClick={handleRechargeUkey}
            disabled={!ukeyPlugged || isRecharging}
            className="flex-1 py-1.5 px-2 rounded bg-blue-900/40 hover:bg-blue-800/50 border border-blue-500/30 text-blue-300 disabled:opacity-40 transition text-center cursor-pointer"
          >
            {isRecharging ? '充能中...' : rechargeSuccess ? '✓ 已离线充能' : '量子离线充能'}
          </button>
        </div>
      </div>

      {/* Channel attack and QBER simulation */}
      <div className="bg-[#111722] p-3 rounded-lg border border-white/5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-100 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>物理信道攻防演练</span>
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
              metrics.status === 'critical'
                ? 'bg-rose-950 text-rose-400 border-rose-500/30'
                : metrics.status === 'warning'
                ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
            }`}
          >
            QBER {metrics.qber.toFixed(1)}%
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          测试光纤微弯扰动、单光子偏振态坍缩与光路窃听阻断机制。
        </p>

        {/* QBER visual bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>安全基准 (≤10%)</span>
            <span>预警 (15%)</span>
            <span>物理熔断 (≥30%)</span>
          </div>
          <div className="w-full h-2 rounded bg-slate-900 overflow-hidden relative border border-white/10">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.status === 'critical'
                  ? 'bg-rose-500'
                  : metrics.status === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (metrics.qber / 40) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tactical drill triggers */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSimulateNoise}
              className="py-2 px-2.5 rounded bg-amber-950/40 border border-amber-600/30 text-amber-300 hover:bg-amber-900/50 hover:text-white transition font-medium text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>模拟扰动 (15%)</span>
            </button>

            <button
              onClick={onSimulateFuse}
              className="py-2 px-2.5 rounded bg-rose-950/40 border border-rose-600/30 text-rose-300 hover:bg-rose-900/50 hover:text-white transition font-medium text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>硬隔离熔断 (35%)</span>
            </button>
          </div>

          <button
            onClick={onResetBaseline}
            className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
            <span>恢复安全基线 (QBER: 1.2%)</span>
          </button>
        </div>
      </div>

      {/* Cryptography Parameters Card */}
      <div className="bg-[#111722] p-3 rounded-lg border border-white/5 space-y-2">
        <span className="font-bold text-slate-200 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>商用国密体系与参数</span>
        </span>
        <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
          <div className="flex justify-between items-center">
            <span>非对称鉴权:</span>
            <span className="text-slate-200">SM2 (256-bit 椭圆曲线)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>摘要完整性:</span>
            <span className="text-slate-200">SM3 (256-bit 哈希)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>会话流加密:</span>
            <span className="text-slate-200">SM4-GCM (一次一密)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>工作密钥倒计时:</span>
            <span className="text-emerald-400 font-bold">04:38</span>
          </div>
        </div>
      </div>

      {/* Target Channel Selector */}
      <div className="bg-[#111722] p-3 rounded-lg border border-white/5 space-y-2">
        <span className="font-bold text-slate-200 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          <span>可用点对点量子管道</span>
        </span>
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveChannel('TERMINAL_02')}
            className={`w-full p-2 rounded text-left border flex items-center justify-between transition cursor-pointer ${
              activeChannel === 'TERMINAL_02'
                ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div>
              <div className="font-semibold text-xs">TERMINAL_02 (指挥枢纽)</div>
              <div className="text-[10px] text-slate-400 font-mono">192.168.1.108 · 纠缠锁定</div>
            </div>
            <span className="text-emerald-400 text-xs">● 活动信道</span>
          </button>

          <button
            onClick={() => setActiveChannel('TERMINAL_03')}
            className={`w-full p-2 rounded text-left border flex items-center justify-between transition cursor-pointer ${
              activeChannel === 'TERMINAL_03'
                ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div>
              <div className="font-semibold text-xs">TERMINAL_03 (战术移动侦察)</div>
              <div className="text-[10px] text-slate-400 font-mono">192.168.1.134 · 备用链路</div>
            </div>
            <span className="text-slate-500 text-xs">待命</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
