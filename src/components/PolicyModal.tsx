import React, { useState } from 'react';
import {
  Sliders,
  X,
  Shield,
  Clock,
  Flame,
  CheckCircle2,
  Award,
  AlertTriangle
} from 'lucide-react';
import { SecurityPolicy } from '../types/security';

interface PolicyModalProps {
  isOpen: boolean;
  policy: SecurityPolicy;
  onClose: () => void;
  onSavePolicy: (newPolicy: SecurityPolicy) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  policy,
  onClose,
  onSavePolicy,
}) => {
  const [currentPolicy, setCurrentPolicy] = useState<SecurityPolicy>({ ...policy });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePolicy(currentPolicy);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-2xl bg-[#0B0F17] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111722]/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>涉密防务安全与终端控制策略</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  等保三级基线生效
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                硬件信道异常联锁与高密级工作站沙箱行为准则
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

        {/* Policy Matrix Cards */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Policy 1: Anti Brute Force */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-xs text-white">口令暴力防破解策略</span>
              </div>
              <p className="text-[11px] text-slate-400">
                连续 3 次口令鉴权失败时，硬件工作站将立即锁定 30 分钟，并同步上报安全审计中心。
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={currentPolicy.antiBruteForce}
                onChange={e =>
                  setCurrentPolicy(prev => ({ ...prev, antiBruteForce: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Policy 2: Idle Lock Screen Step Buttons */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs text-white">无操作连续空闲自动锁屏</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>等保三级基线推荐: 15分钟</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              当操作员离开工位或未检测到鼠标键盘交互时，自动切断解密状态并进入2FA锁屏保护。
            </p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[5, 15, 30, 0].map(mins => {
                const label = mins === 0 ? '从不 (高危)' : `${mins} 分钟`;
                const isSelected = currentPolicy.idleLockMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() =>
                      setCurrentPolicy(prev => ({ ...prev, idleLockMinutes: mins }))
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policy 3: Sandbox Auto-Destroy */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-xs text-white">页面离开时会话沙箱即时自毁</span>
              </div>
              <p className="text-[11px] text-slate-400">
                检测到浏览器窗口关闭、切屏离开或网络离线时，内存中的对称加密私钥与临时明文将被即时擦除覆写。
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={currentPolicy.sandboxAutoDestroy}
                onChange={e =>
                  setCurrentPolicy(prev => ({ ...prev, sandboxAutoDestroy: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Policy 4: QBER Physical Channel Thresholds */}
          <div className="bg-[#121824] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-xs text-white">量子误码率 (QBER) 物理熔断基线</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">单光子雪崩态联动</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[11px]">环境扰动预警阈值</span>
                <span className="text-amber-400 font-bold text-sm">QBER &gt; 10.0%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">触发奇偶校验重传与告警</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[11px]">物理窃听硬隔离熔断阈值</span>
                <span className="text-rose-400 font-bold text-sm">QBER &ge; 30.0%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">阻断光路并销毁当前密钥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-white/10 px-6 bg-[#0E131C] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>安全防务策略已固化生效</span>
              </span>
            ) : (
              <span>策略变更将写入只读审计存证区块链</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer shadow-[0_0_12px_rgba(37,99,235,0.4)]"
            >
              保存并固化策略
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
