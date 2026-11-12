import React from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Radio,
  RefreshCw,
  XCircle,
  PowerOff
} from 'lucide-react';

interface AlertModalProps {
  alertType: 'noise' | 'fuse' | null;
  onClose: () => void;
  onEmergencyIsolate: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  alertType,
  onClose,
  onEmergencyIsolate,
}) => {
  if (!alertType) return null;

  if (alertType === 'fuse') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-alert-strobe">
        <div className="w-full max-w-lg bg-[#14080A] border-2 border-rose-600 rounded-2xl p-6 text-center shadow-[0_0_80px_rgba(244,63,94,0.4)] space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-950 flex items-center justify-center text-rose-500 text-3xl border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
            <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 text-[11px] font-mono font-bold tracking-wider mb-1">
              CRITICAL HARDWARE FUSE TRIGGERED
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              物理光纤窃听入侵与硬隔离熔断
            </h2>
          </div>

          <div className="bg-black/50 p-4 rounded-xl border border-rose-500/30 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between text-rose-300">
              <span>异常触发类型:</span>
              <span className="font-bold">单光子量子态非连续坍缩</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>瞬时量子误码率 (QBER):</span>
              <span className="font-bold text-white bg-rose-900/60 px-2 py-0.5 rounded">
                35.0% (熔断阈值 ≥ 30.0%)
              </span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>处置机制:</span>
              <span>光路开路器强制弹开 · 工作密钥即刻擦除</span>
            </div>
          </div>

          <p className="text-xs text-rose-200/80 leading-relaxed font-mono">
            检测到物理信道遭受高精度宏弯分光或光电探头刺入。为防止机密信令外泄，通信接口已置于高阻物理隔离状态！
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onEmergencyIsolate}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2"
            >
              <PowerOff className="w-4 h-4" />
              <span>启动硬隔离应急防御处置</span>
            </button>

            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 text-xs font-mono transition cursor-pointer"
            >
              忽略告警并复位
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Noise 15% Warning Modal
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-md bg-[#130E06] border-2 border-amber-500/80 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-950 flex items-center justify-center text-amber-400 text-2xl border border-amber-500/40">
          <AlertTriangle className="w-7 h-7 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
            WARNING: NOISE OVERFLOW
          </div>
          <h2 className="text-base font-bold text-white tracking-wide">
            量子信道微弱扰动预警
          </h2>
        </div>

        <div className="bg-black/40 p-3 rounded-lg border border-amber-500/20 text-left font-mono text-xs space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">当前误码率 (QBER):</span>
            <span className="text-amber-400 font-bold">15.0% (基线 ≤ 10.0%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">系统应对状态:</span>
            <span className="text-emerald-400">前向纠错 (FEC) 自动纠偏激活</span>
          </div>
        </div>

        <p className="text-xs text-amber-200/80 leading-relaxed font-mono">
          可能由环境温差漂移或接头微振引起。系统正自动提高纠错码率，暂未触发物理硬隔离。
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs tracking-wider transition cursor-pointer"
          >
            知悉并保持信道观察
          </button>
        </div>
      </div>
    </div>
  );
};
