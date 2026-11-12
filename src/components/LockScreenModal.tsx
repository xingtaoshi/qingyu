import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ScanFace,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { validateSecurityPassword } from '../utils/cryptoUtils';

interface LockScreenModalProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isLocked,
  onUnlock,
}) => {
  const [authMethod, setAuthMethod] = useState<'face' | 'password'>('face');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [faceVerified, setFaceVerified] = useState(false);

  const unlockRef = React.useRef(onUnlock);
  unlockRef.current = onUnlock;

  useEffect(() => {
    if (!isLocked) {
      setFaceScanProgress(0);
      setFaceVerified(false);
      setPassword('');
      setErrorMsg(null);
      return;
    }

    if (authMethod === 'face') {
      setFaceScanProgress(0);
      setFaceVerified(false);
      const interval = setInterval(() => {
        setFaceScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setFaceVerified(true);
            setTimeout(() => {
              unlockRef.current();
            }, 800);
            return 100;
          }
          return prev + 20;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isLocked, authMethod]);

  if (!isLocked) return null;

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSecurityPassword(password);
    if (!validation.valid) {
      setErrorMsg(validation.message || '口令错误');
      return;
    }

    // Default mock password or any >= 6 chars
    setErrorMsg(null);
    onUnlock();
  };

  return (
    <div className="fixed inset-0 bg-[#06080E]/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-md bg-[#0F141E] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_60px_rgba(37,99,235,0.25)] space-y-5 text-center">
        {/* Lock icon header */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-blue-900/60 to-slate-900 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            轻语涉密防御工作站已锁定
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            TERMINAL_01 · 当前操作员 operator (Level-3)
          </p>
        </div>

        {/* 2FA Tabs */}
        <div className="flex bg-[#161D2A] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setAuthMethod('face')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'face'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>离线人脸 2FA 鉴权</span>
          </button>

          <button
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'password'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>国密授权口令</span>
          </button>
        </div>

        {/* Tab 1: Face Biometric Scanner */}
        {authMethod === 'face' && (
          <div className="space-y-4">
            <div className="w-48 h-48 mx-auto rounded-xl bg-black/60 border-2 border-blue-500/40 relative overflow-hidden flex items-center justify-center shadow-inner">
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {/* Scanning laser beam */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] transition-all duration-100"
                style={{ top: `${faceScanProgress}%` }}
              />

              {/* Silhouette outline */}
              <ScanFace className="w-24 h-24 text-blue-500/30" />

              {faceVerified && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur flex flex-col items-center justify-center text-emerald-400 space-y-1">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                  <span className="text-xs font-mono font-bold">2FA 人脸活体鉴权通过</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 px-4">
                <span>特征点云匹配度</span>
                <span className="text-cyan-400 font-bold">{faceScanProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${faceScanProgress}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              本地离线深度模型比对 · 绝无生物特征外泄风险
            </p>
          </div>
        )}

        {/* Tab 2: Password Input */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordUnlock} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-xs text-slate-300 font-medium">国密口令 (SM3 认证)</label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="请输入操作员解锁口令 (预设: 123456)"
                className="w-full bg-[#131924] border border-white/10 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                autoFocus
              />
              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>验证口令并解密工作台</span>
            </button>
          </form>
        )}

        {/* Security Baseline Note */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>连续输入错误 3 次将自动冻结 30 分钟</span>
        </div>
      </div>
    </div>
  );
};
