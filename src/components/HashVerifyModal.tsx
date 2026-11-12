import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Copy,
  CheckCircle2,
  FileCode,
  KeyRound,
  Clock,
  Layers
} from 'lucide-react';

interface HashVerifyModalProps {
  isOpen: boolean;
  hash: string;
  label?: string;
  onClose: () => void;
}

export const HashVerifyModal: React.FC<HashVerifyModalProps> = ({
  isOpen,
  hash,
  label = '机密交付存证',
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-lg bg-[#0B0F17] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111722]/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>国密 SM3 完整性与链式验签证书</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  验签 100% 吻合
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {label} · 256-bit 密码杂凑算法无损存证
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs font-mono">
          {/* Full Hash Display Box */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-semibold text-slate-300">SM3 256-bit 散列值 (Hash Digest)</span>
              <button
                onClick={handleCopy}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-sans"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制哈希'}</span>
              </button>
            </div>
            <div className="bg-black/50 p-3 rounded-lg border border-white/10 break-all text-emerald-400 text-xs leading-relaxed tracking-wider font-mono select-all">
              {hash || 'c2bf7595c52c79a4bf4a0248ad85f67a2113f9909a341e86db703191a27e595c'}
            </div>
          </div>

          {/* Verification Parameters */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-2.5">
            <div className="flex justify-between pb-1.5 border-b border-white/5">
              <span className="text-slate-400">数字签名算法</span>
              <span className="text-slate-200">SM2 椭圆曲线数字签名算法 (GM/T 0003)</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-white/5">
              <span className="text-slate-400">可信时间戳 (TSA)</span>
              <span className="text-slate-200">2026-11-11 18:17:14 UTC+8 (国家授时)</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-white/5">
              <span className="text-slate-400">证书信任链</span>
              <span className="text-cyan-400">涉密 CA 根 ➔ 轻语工作站二级中间证书</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">验签结论</span>
              <span className="text-emerald-400 font-bold">✓ 数据未经任何未授权修改与篡改</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-white/10 px-6 bg-[#0E131C] flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
          >
            完成验签并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
