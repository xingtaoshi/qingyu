import React, { useState } from 'react';
import {
  FileText,
  PhoneCall,
  Download,
  CheckCircle,
  Play,
  Pause,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Flame,
  Menu,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { ChatMessage, MessageType } from '../types/security';
import { formatCompactHash } from '../utils/cryptoUtils';

interface MessageStreamProps {
  messages: ChatMessage[];
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  onClearScreen: () => void;
  onExportTranscript: () => void;
  onVerifyHash: (hash: string, fileName: string) => void;
  onOpenPeerDetails: () => void;
}

export const MessageStream: React.FC<MessageStreamProps> = ({
  messages,
  drawerOpen,
  onToggleDrawer,
  onClearScreen,
  onExportTranscript,
  onVerifyHash,
  onOpenPeerDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | MessageType>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      // Stop playback after 3.5 seconds
      setTimeout(() => {
        setPlayingAudioId(prev => (prev === id ? null : prev));
      }, 3500);
    }
  };

  const handleDownloadFile = (fileName?: string) => {
    const targetName = fileName || '保密交付文件.html';
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${targetName}</title></head>` +
        `<body style="background:#0f172a;color:#e2e8f0;font-family:sans-serif;padding:2rem;">` +
        `<h2>轻语安全防御工作站 - 机密交付存证</h2>` +
        `<p>文件名称: ${targetName}</p>` +
        `<p>国密SM3指纹: c2bf7595c52c79a4bf4a0248ad85f67a2113f9909a341e86db703191a27e595c</p>` +
        `<p>交付时间: ${new Date().toLocaleString()}</p>` +
        `<hr style="border-color:#334155;margin:2rem 0;"/>` +
        `<p>本文件已通过QKD量子纠缠密钥信道完成硬件级验签与无损校验。</p>` +
        `</body></html>`
      ],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = targetName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter(msg => {
    if (filterType !== 'all' && msg.type !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentMatch = msg.content.toLowerCase().includes(q);
      const fileMatch = msg.fileName?.toLowerCase().includes(q);
      const hashMatch = msg.sm3Hash?.toLowerCase().includes(q);
      return contentMatch || fileMatch || hashMatch;
    }
    return true;
  });

  return (
    <main className="flex-1 flex flex-col bg-[#090C12] overflow-hidden">
      {/* Station subheader */}
      <div className="h-12 border-b border-white/10 px-4 md:px-6 flex items-center justify-between text-xs bg-[#0C1017]/80 backdrop-blur shrink-0 z-10">
        <div className="flex items-center space-x-3">
          {!drawerOpen && (
            <button
              onClick={onToggleDrawer}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="展开保密序列与演练抽屉"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenPeerDetails}
            className="flex items-center space-x-2 font-bold text-slate-100 hover:text-blue-300 transition text-sm cursor-pointer"
            title="查看 TERMINAL_02 坐席详情"
          >
            <span>TERMINAL_02</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>业务操作员 在线</span>
          </span>

          <span className="hidden xl:inline text-slate-500 text-[11px]">
            固定点对点量子加密管道 · 消息全密态链式存证
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onExportTranscript}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            导出密态记录
          </button>
          <button
            onClick={onClearScreen}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3 text-slate-400" />
            <span>清屏</span>
          </button>
        </div>
      </div>

      {/* Embedded Search and Categorization Filter Bar (Ref Screenshot 12) */}
      <div className="border-b border-white/5 bg-[#0A0E15] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索会话指令、文件名或 SM3 哈希指纹..."
              className="w-full bg-[#111722] border border-white/10 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center bg-[#131924] p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-0.5 rounded text-xs transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white font-medium shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            全部 ({messages.length})
          </button>
          <button
            onClick={() => setFilterType('text')}
            className={`px-3 py-0.5 rounded text-xs transition cursor-pointer ${
              filterType === 'text'
                ? 'bg-blue-600 text-white font-medium shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            文字
          </button>
          <button
            onClick={() => setFilterType('file')}
            className={`px-3 py-0.5 rounded text-xs transition cursor-pointer ${
              filterType === 'file'
                ? 'bg-blue-600 text-white font-medium shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            文档
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-3 py-0.5 rounded text-xs transition cursor-pointer ${
              filterType === 'audio'
                ? 'bg-blue-600 text-white font-medium shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            语音
          </button>
        </div>
      </div>

      {/* Message Timeline Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {filteredMessages.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
            <Search className="w-6 h-6 text-slate-600" />
            <p>未找到符合条件的密态信息记录</p>
          </div>
        ) : (
          filteredMessages.map(msg => {
            // System message layout
            if (msg.type === 'signal') {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="bg-[#111722]/80 border border-blue-500/20 text-blue-300 rounded-full px-4 py-1 text-[11px] font-mono flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>[{msg.timestamp}]</span>
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            const isMe = msg.sender === 'operator';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Sender & timestamp header */}
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 px-1">
                  <span>{msg.senderName}</span>
                  <span>({msg.timestamp})</span>
                  {msg.isEncrypted && (
                    <span className="text-cyan-400 text-[10px] font-mono bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/20">
                      {msg.cipherSuite || 'SM2-Enveloped'}
                    </span>
                  )}
                  {msg.burnAfterSec && (
                    <span className="text-amber-400 text-[10px] font-mono flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{msg.burnAfterSec}s 即焚</span>
                    </span>
                  )}
                </div>

                {/* File Message Card */}
                {msg.type === 'file' && (
                  <div className="w-84 sm:w-96 bg-[#131924] border border-white/10 rounded-xl p-3 flex items-center space-x-3 shadow-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg shrink-0">
                      <FileCode className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {msg.fileName || '几猫国产3A大作_V1.html'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{msg.fileSize || '1.4 MB'}</span>
                        <span className="text-white/20">·</span>
                        <button
                          onClick={() => onVerifyHash(msg.sm3Hash || '', msg.fileName || '')}
                          className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          title="点击查看链式存证国密SM3指纹"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>SM3: {formatCompactHash(msg.sm3Hash || 'c2bf7595c52c79a4bf4a0248ad85f67a2113f9909a341e86db703191a27e595c')}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => handleDownloadFile(msg.fileName)}
                        className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>下载</span>
                      </button>
                      <button
                        onClick={() => onVerifyHash(msg.sm3Hash || '', msg.fileName || '')}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] transition cursor-pointer"
                      >
                        验签
                      </button>
                    </div>
                  </div>
                )}

                {/* Duplex Encrypted Voice Card */}
                {msg.type === 'audio' && (
                  <div className="w-76 sm:w-84 bg-[#131924] border border-white/10 rounded-xl p-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={() => toggleAudio(msg.id)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition cursor-pointer ${
                          playingAudioId === msg.id
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/80'
                        }`}
                        title={playingAudioId === msg.id ? '暂停回放' : '播放语音'}
                      >
                        {playingAudioId === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                          <span>双工保密语音通话</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          时长 {msg.audioDuration || '00:03'} · 16kHz PCM · SM4
                        </div>
                      </div>
                    </div>

                    {/* Mini Waveform visualization */}
                    <div className="flex items-center space-x-0.5 h-5 px-2">
                      {[40, 70, 30, 90, 60, 100, 50, 80, 45].map((h, idx) => (
                        <div
                          key={idx}
                          className={`w-1 rounded-full transition-all duration-200 ${
                            playingAudioId === msg.id
                              ? 'bg-emerald-400'
                              : 'bg-slate-700'
                          }`}
                          style={{
                            height: playingAudioId === msg.id ? `${(h * Math.random()).toFixed(0)}%` : `${h * 0.4}%`,
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => toggleAudio(msg.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer ml-1"
                    >
                      {playingAudioId === msg.id ? '暂停' : '回放'}
                    </button>
                  </div>
                )}

                {/* Regular text message */}
                {msg.type === 'text' && (
                  <div
                    className={`max-w-md p-3 rounded-xl border text-xs leading-relaxed font-sans ${
                      isMe
                        ? 'bg-[#151D2C] border-blue-500/20 text-slate-100'
                        : 'bg-[#10151E] border-white/10 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Delivery & Hardware Channel Status */}
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 px-1">
                  <span>✓✓</span>
                  <span>硬件信道已交付 · 全密态已固化</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};
