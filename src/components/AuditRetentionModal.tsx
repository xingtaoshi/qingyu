import React, { useState } from 'react';
import {
  Archive,
  X,
  Search,
  Filter,
  Download,
  CheckCircle,
  Copy,
  Play,
  Pause,
  FileText,
  PhoneCall,
  HardDrive,
  FileCode,
  ShieldCheck,
  Calendar,
  UserCheck
} from 'lucide-react';
import { AuditRecord, MediaRecord, VoiceRecord } from '../types/security';
import { formatCompactHash } from '../utils/cryptoUtils';

interface AuditRetentionModalProps {
  isOpen: boolean;
  auditRecords: AuditRecord[];
  voiceRecords: VoiceRecord[];
  mediaRecords: MediaRecord[];
  onClose: () => void;
  onVerifyHash: (hash: string, label: string) => void;
}

export const AuditRetentionModal: React.FC<AuditRetentionModalProps> = ({
  isOpen,
  auditRecords,
  voiceRecords,
  mediaRecords,
  onClose,
  onVerifyHash,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'voice' | 'media'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const toggleVoicePlayback = (id: string) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      setTimeout(() => {
        setPlayingVoiceId(prev => (prev === id ? null : prev));
      }, 3500);
    }
  };

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'ID,Timestamp,Operator,Terminal,ActionType,Description,SM3_Hash,Result,IP\n' +
      auditRecords
        .map(
          r =>
            `"${r.id}","${r.timestamp}","${r.operator}","${r.terminalId}","${r.actionType}","${r.description}","${r.sm3Hash}","${r.result}","${r.ipAddress}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `轻语密态审计留存报告_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('✓ 国密审计留存报告已安全导出 (CSV)');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-5xl bg-[#0B0F17] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111722]/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>涉密审计与密态全周期留存中心</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
                  不可篡改存证库 (WORM)
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                满足等保三级与商用密码应用安全性评估 (密评) 要求
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportReport}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出加密报告 (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher & Search bar */}
        <div className="border-b border-white/10 bg-[#0E141E] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-1 bg-[#131B27] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>操作日志审计 ({auditRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'voice'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>通话音频留存 ({voiceRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'media'
                  ? 'bg-blue-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>密态媒体归档 ({mediaRecords.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {exportNotice && (
              <span className="text-emerald-400 text-xs font-mono animate-pulse">
                {exportNotice}
              </span>
            )}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索操作人、哈希或事件..."
                className="w-56 bg-[#131924] border border-white/10 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Pro DataGrid - Audit Logs */}
        {activeTab === 'audit' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0D121B]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141C28] text-slate-400 font-mono text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">存证序号</th>
                    <th className="py-2.5 px-4 font-semibold">记录时间</th>
                    <th className="py-2.5 px-4 font-semibold">操作坐席</th>
                    <th className="py-2.5 px-4 font-semibold">业务动作</th>
                    <th className="py-2.5 px-4 font-semibold">业务详情说明</th>
                    <th className="py-2.5 px-4 font-semibold">SM3 国密存证指纹</th>
                    <th className="py-2.5 px-4 font-semibold">执行状态</th>
                    <th className="py-2.5 px-4 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                  {auditRecords
                    .filter(r => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        r.operator.toLowerCase().includes(q) ||
                        r.description.toLowerCase().includes(q) ||
                        r.sm3Hash.toLowerCase().includes(q)
                      );
                    })
                    .map(rec => (
                      <tr key={rec.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-bold text-slate-200">{rec.id}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {rec.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-blue-300 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {rec.operator}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">{rec.actionType}</td>
                        <td className="py-3 px-4 text-slate-300 font-sans max-w-xs truncate">
                          {rec.description}
                        </td>
                        <td className="py-3 px-4 text-emerald-400">
                          <button
                            onClick={() => handleCopyHash(rec.sm3Hash)}
                            className="flex items-center gap-1 hover:underline cursor-pointer"
                            title="点击复制完整 256 位哈希"
                          >
                            <span>{formatCompactHash(rec.sm3Hash, 4, 4)}</span>
                            {copiedHash === rec.sm3Hash ? (
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 hover:text-slate-200" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                            ✓ {rec.result}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onVerifyHash(rec.sm3Hash, rec.actionType)}
                            className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-sans"
                          >
                            验签详情
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Voice Call Retention */}
        {activeTab === 'voice' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {voiceRecords.map(call => (
                <div
                  key={call.id}
                  className="bg-[#111723] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-blue-500/30 transition shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-100">{call.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{call.timestamp}</div>
                      </div>
                    </div>

                    <span className="font-mono text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
                      时长: {call.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-black/30 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">通联坐席</span>
                      <span className="text-slate-200">
                        {call.operator} ➔ {call.targetTerminal}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">加密校验码 (SM4)</span>
                      <span className="text-emerald-400 truncate block">
                        {formatCompactHash(call.sm4Checksum, 6, 6)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => toggleVoicePlayback(call.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                        playingVoiceId === call.id
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60'
                      }`}
                    >
                      {playingVoiceId === call.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>停止播放</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>解密回放音频</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onVerifyHash(call.sm4Checksum, '双工保密音频')}
                      className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      存证验签
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Encrypted Media Archive */}
        {activeTab === 'media' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0D121B]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141C28] text-slate-400 font-mono text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">交付文件名称</th>
                    <th className="py-2.5 px-4 font-semibold">密级分类</th>
                    <th className="py-2.5 px-4 font-semibold">文件大小</th>
                    <th className="py-2.5 px-4 font-semibold">归档时间</th>
                    <th className="py-2.5 px-4 font-semibold">SM3 链上指纹</th>
                    <th className="py-2.5 px-4 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                  {mediaRecords.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-400" />
                        <span>{item.fileName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                            item.classification === '机密'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.classification}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.fileSize}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{item.timestamp}</td>
                      <td className="py-3 px-4 text-emerald-400">
                        {formatCompactHash(item.sm3Signature, 6, 6)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onVerifyHash(item.sm3Signature, item.fileName)}
                          className="px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-xs cursor-pointer font-sans"
                        >
                          存证验签
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-12 border-t border-white/10 px-6 bg-[#0E131C] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>哈希链式存证校验机制激活中 (SM3+SM2数字信封)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition cursor-pointer"
          >
            返回工作台
          </button>
        </div>
      </div>
    </div>
  );
};
