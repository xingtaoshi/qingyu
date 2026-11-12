import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Maximize2,
  Lock
} from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminalName?: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  terminalName = 'TERMINAL_02 (指挥枢纽对端)',
}) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-3xl bg-[#090D15] border border-blue-500/30 rounded-2xl shadow-[0_0_60px_rgba(37,99,235,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-white/10 px-5 flex items-center justify-between bg-[#0F141E]">
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">{terminalName}</span>
            <span className="text-slate-500 font-mono">|</span>
            <span className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>SM4-GCM 端到端加密通话</span>
            </span>
          </div>

          <div className="font-mono text-xs text-slate-400">
            通话时长: 00:14
          </div>
        </div>

        {/* Video Viewport Area */}
        <div className="h-96 bg-[#04060A] relative flex items-center justify-center overflow-hidden">
          {camOn ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {/* Simulated camera feed representation with high-tech grid */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="w-32 h-32 rounded-full bg-blue-950/60 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Video className="w-14 h-14" />
              </div>
              <span className="text-xs font-mono text-slate-300 mt-3">
                对端视频流同步中 · 1080P 60FPS · 延迟: 1.4ms
              </span>

              {/* PiP self preview */}
              <div className="absolute bottom-4 right-4 w-36 h-24 bg-slate-900/90 border border-white/20 rounded-lg flex flex-col items-center justify-center shadow-lg">
                <span className="text-[10px] font-mono text-slate-400">本机操作员 (Level-3)</span>
                <span className="text-[9px] text-emerald-400 font-mono mt-0.5">● 离线人脸已锁定</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 space-y-2">
              <VideoOff className="w-12 h-12 text-slate-600" />
              <span className="text-xs font-mono">摄像头已关闭</span>
            </div>
          )}
        </div>

        {/* Call Controls Dock */}
        <div className="h-16 border-t border-white/10 px-6 bg-[#0D121B] flex items-center justify-center space-x-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
              micOn ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-rose-950 text-rose-400 border border-rose-500/40'
            }`}
            title={micOn ? '静音' : '取消静音'}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCamOn(!camOn)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
              camOn ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-rose-950 text-rose-400 border border-rose-500/40'
            }`}
            title={camOn ? '关闭摄像头' : '开启摄像头'}
          >
            {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wider transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          >
            <PhoneOff className="w-4 h-4" />
            <span>挂断保密通话</span>
          </button>
        </div>
      </div>
    </div>
  );
};
