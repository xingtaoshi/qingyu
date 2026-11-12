import React, { useState } from 'react';
import {
  UserCheck,
  X,
  ShieldCheck,
  Activity,
  KeyRound,
  Network,
  RefreshCw,
  Clock,
  Cpu
} from 'lucide-react';

interface PeerAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminalId?: string;
  isSelf?: boolean;
}

export const PeerAgentModal: React.FC<PeerAgentModalProps> = ({
  isOpen,
  onClose,
  terminalId = 'TERMINAL_02',
  isSelf = false,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult('心跳正常 · 往返延迟: 0.8ms · 密钥偏振态保持良好');
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-lg bg-[#0B0F17] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111722]/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isSelf ? '本机操作员坐席凭据' : '对端值守坐席状态与信令拓扑'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  双因子鉴权已通过
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {terminalId} · SM2 根证书实体身份绑定
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

        {/* Content Body: Key-Value Grid */}
        <div className="p-6 space-y-4 text-xs font-mono">
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">坐席身份与级别</span>
              <span className="text-slate-100 font-semibold">
                {isSelf ? 'operator / 主控操作员 (Level-3)' : 'operator / 业务操作员 (Level-3)'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">硬件接入 IP</span>
              <span className="text-blue-300 font-semibold">
                {isSelf ? '192.168.1.101 (本机)' : '192.168.1.108 (对端)'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">2FA 活体认证</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>离线人脸识别 (已锁定操作员)</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">信道物理介质</span>
              <span className="text-slate-200">G.652 单模量子通信光纤 (42° 方位角)</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">国密 SM2 公钥摘要</span>
              <span className="text-cyan-400 truncate max-w-[200px]">
                04a91bf283...328f41e0a8
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">信令会话保持</span>
              <span className="text-slate-200">持续 00:33:19 · 延迟 0.8ms</span>
            </div>
          </div>

          {pingResult && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
              {pingResult}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-white/10 px-6 bg-[#0E131C] flex items-center justify-between text-xs">
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="px-3.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 border border-blue-500/30 text-blue-300 transition cursor-pointer flex items-center gap-1.5"
          >
            <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? '探测中...' : '信道心跳 Ping'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition cursor-pointer"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
};
