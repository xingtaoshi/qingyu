import React, { useState, useRef } from 'react';
import {
  Send,
  Zap,
  Paperclip,
  Mic,
  Video,
  Smile,
  Flame,
  CheckSquare,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import { tacticalPhrases, tacticalSymbols } from '../data/mockSecurityData';
import { generateMockSm3Digest } from '../utils/cryptoUtils';

interface ComposerBarProps {
  onSendMessage: (params: {
    content: string;
    isEncrypted: boolean;
    cipherSuite: 'SM2-Enveloped' | 'Plaintext';
    burnAfterSec?: number;
    forcedReceipt: boolean;
  }) => void;
  onSendFile: (fileName: string, fileSize: string, sm3Hash: string) => void;
  onSendVoice: () => void;
  onOpenVideoCall: () => void;
}

export const ComposerBar: React.FC<ComposerBarProps> = ({
  onSendMessage,
  onSendFile,
  onSendVoice,
  onOpenVideoCall,
}) => {
  const [content, setContent] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [burnAfter, setBurnAfter] = useState(false);
  const [forcedReceipt, setForcedReceipt] = useState(true);
  const [showPhrases, setShowPhrases] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage({
      content: content.trim(),
      isEncrypted,
      cipherSuite: isEncrypted ? 'SM2-Enveloped' : 'Plaintext',
      burnAfterSec: burnAfter ? 30 : undefined,
      forcedReceipt,
    });
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertPhrase = (phraseText: string) => {
    setContent(prev => (prev ? `${prev} ${phraseText}` : phraseText));
    setShowPhrases(false);
  };

  const insertSymbol = (char: string) => {
    setContent(prev => `${prev}${char}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const generatedHash = generateMockSm3Digest(file.name + file.size + Date.now());
    onSendFile(file.name, sizeStr, generatedHash);
    e.target.value = '';
  };

  return (
    <div className="border-t border-white/10 bg-[#0C1017] p-3 space-y-2 shrink-0 select-none relative z-10">
      {/* Tactical Phrase Selector Popup (截图 9) */}
      {showPhrases && (
        <div className="absolute bottom-full left-4 mb-2 w-96 max-h-72 bg-[#121824] border border-blue-500/40 rounded-xl p-3 shadow-2xl overflow-y-auto space-y-3 z-30">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>保密业务常用短语库</span>
            </span>
            <button
              onClick={() => setShowPhrases(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {['信道调度', '巡检汇报', '应急指令'].map(cat => (
              <div key={cat} className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-semibold">{cat}</div>
                <div className="space-y-1">
                  {tacticalPhrases
                    .filter(p => p.category === cat)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => insertPhrase(item.text)}
                        className="w-full text-left px-2.5 py-1.5 rounded bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-slate-200 text-xs transition cursor-pointer"
                      >
                        {item.text}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tactical Symbol / Emoji Selector Popup (截图 10) */}
      {showSymbols && (
        <div className="absolute bottom-full left-20 mb-2 w-64 bg-[#121824] border border-blue-500/40 rounded-xl p-3 shadow-2xl space-y-2 z-30">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-slate-100 text-xs">战术状态符号</span>
            <button
              onClick={() => setShowSymbols(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {tacticalSymbols.map((item, idx) => (
              <button
                key={idx}
                onClick={() => insertSymbol(item.char)}
                title={item.label}
                className="w-10 h-10 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg hover:scale-110 transition cursor-pointer"
              >
                {item.char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top row: Mode and Security Constraints */}
      <div className="flex flex-wrap items-center justify-between text-xs px-1 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex rounded-md bg-[#161D29] p-0.5 border border-white/10">
            <button
              onClick={() => setIsEncrypted(true)}
              className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                isEncrypted
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3 text-cyan-300" />
              <span>密态信封 (SM2)</span>
            </button>
            <button
              onClick={() => setIsEncrypted(false)}
              className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                !isEncrypted
                  ? 'bg-amber-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3 h-3" />
              <span>常规明文</span>
            </button>
          </div>

          <span className="text-white/20">|</span>

          <span className="text-slate-400 text-xs hidden sm:inline">授权角色:</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200 font-mono text-[11px]">
            业务操作员 (Level-3)
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={burnAfter}
              onChange={e => setBurnAfter(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>阅后即焚 (30s)</span>
            </span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={forcedReceipt}
              onChange={e => setForcedReceipt(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-blue-400" />
              <span>强制安全回执</span>
            </span>
          </label>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={2}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="在此输入密态指令或文字消息，按 Enter 发送，Shift+Enter 换行..."
          className="w-full bg-[#131924] border border-white/10 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
        />
      </div>

      {/* Bottom Tool Row & Send Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2 text-slate-400 text-xs">
          <button
            onClick={() => {
              setShowPhrases(!showPhrases);
              setShowSymbols(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-white/5 hover:text-blue-400 transition cursor-pointer"
            title="快捷短语库"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>常用短语</span>
          </button>

          <button
            onClick={() => {
              setShowSymbols(!showSymbols);
              setShowPhrases(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-white/5 hover:text-blue-400 transition cursor-pointer"
            title="战术状态符号"
          >
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            <span>战术符号</span>
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-white/5 hover:text-blue-400 transition cursor-pointer"
            title="上传密盘保密文件并自动生成 SM3 存证指纹"
          >
            <Paperclip className="w-3.5 h-3.5 text-slate-300" />
            <span>密盘文件</span>
          </button>

          <button
            onClick={onSendVoice}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-white/5 hover:text-emerald-400 transition cursor-pointer"
            title="发起双工保密语音通话"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>双工语音</span>
          </button>

          <button
            onClick={onOpenVideoCall}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-white/5 hover:text-indigo-400 transition cursor-pointer"
            title="发起加密视频终端握手"
          >
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>视频直连</span>
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-semibold tracking-wide transition shadow-[0_0_12px_rgba(37,99,235,0.4)] flex items-center gap-1.5 cursor-pointer"
        >
          <span>发送密文</span>
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
