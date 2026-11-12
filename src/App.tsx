/**
 * 轻语安全防御工作站 PRO (Qingyu Tactical Security Station Pro)
 * Commercial-Grade Tactical Enterprise Workstation
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SecretDrawer } from './components/SecretDrawer';
import { MessageStream } from './components/MessageStream';
import { ComposerBar } from './components/ComposerBar';
import { RadarModal } from './components/RadarModal';
import { QkdTelemetryModal } from './components/QkdTelemetryModal';
import { AuditRetentionModal } from './components/AuditRetentionModal';
import { PolicyModal } from './components/PolicyModal';
import { LockScreenModal } from './components/LockScreenModal';
import { PeerAgentModal } from './components/PeerAgentModal';
import { AlertModal } from './components/AlertModal';
import { HashVerifyModal } from './components/HashVerifyModal';
import { VideoCallModal } from './components/VideoCallModal';

import {
  initialAuditRecords,
  initialMediaRecords,
  initialMessages,
  initialPeerNodes,
  initialQkdMetrics,
  initialSecurityPolicy,
  initialVoiceRecords,
} from './data/mockSecurityData';
import {
  AuditRecord,
  ChatMessage,
  MediaRecord,
  PeerNode,
  QkdMetrics,
  SecurityPolicy,
  VoiceRecord,
} from './types/security';
import {
  evaluateQber,
  formatTimeOnly,
  generateMockSm3Digest,
} from './utils/cryptoUtils';

export default function App() {
  // Global Station States
  const [metrics, setMetrics] = useState<QkdMetrics>(initialQkdMetrics);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [peerNodes, setPeerNodes] = useState<PeerNode[]>(initialPeerNodes);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(initialAuditRecords);
  const [voiceRecords, setVoiceRecords] = useState<VoiceRecord[]>(initialVoiceRecords);
  const [mediaRecords, setMediaRecords] = useState<MediaRecord[]>(initialMediaRecords);
  const [policy, setPolicy] = useState<SecurityPolicy>(initialSecurityPolicy);

  // UI Drawer & Modal Overlays
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showRadar, setShowRadar] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPeerDetails, setShowPeerDetails] = useState(false);
  const [showSelfDetails, setShowSelfDetails] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [alertType, setAlertType] = useState<'noise' | 'fuse' | null>(null);
  const [verifyModal, setVerifyModal] = useState<{ hash: string; label: string } | null>(null);

  const handleUnlock = React.useCallback(() => {
    setIsLocked(false);
  }, []);

  // Periodic key consumption & slight throughput jitter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => {
        const consumed = 0.002;
        const newPool = Math.max(800, prev.keyPoolGbit - consumed);
        const jitter = (Math.random() - 0.5) * 1.5;
        const newThroughput = Math.max(5.0, Math.min(30.0, prev.throughputKbps + jitter));
        return {
          ...prev,
          keyPoolGbit: Number(newPool.toFixed(2)),
          throughputKbps: Number(newThroughput.toFixed(1)),
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Idle lock timer
  useEffect(() => {
    if (policy.idleLockMinutes === 0) return;
    let idleTimeout: NodeJS.Timeout;

    const resetIdle = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        setIsLocked(true);
      }, policy.idleLockMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();

    return () => {
      clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
    };
  }, [policy.idleLockMinutes]);

  // Handle QBER and Drills
  const handleSimulateNoise = () => {
    const newQber = 15.0;
    const status = evaluateQber(newQber, policy.qberThresholdWarning, policy.qberThresholdFuse);
    setMetrics(prev => ({
      ...prev,
      qber: newQber,
      status,
    }));
    setAlertType('noise');

    // Add audit record
    const newAudit: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      operator: 'operator',
      terminalId: 'TERMINAL_01',
      actionType: 'POLICY_CHANGE',
      description: '仿真注入 15% 物理信道光纤宏弯环境扰动',
      sm3Hash: generateMockSm3Digest(`NOISE_15_${Date.now()}`),
      result: 'WARNING',
      ipAddress: '192.168.1.101',
    };
    setAuditRecords(prev => [newAudit, ...prev]);
  };

  const handleSimulateFuse = () => {
    const newQber = 35.0;
    const status = evaluateQber(newQber, policy.qberThresholdWarning, policy.qberThresholdFuse);
    setMetrics(prev => ({
      ...prev,
      qber: newQber,
      status,
    }));
    setAlertType('fuse');

    const newAudit: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      operator: 'SYSTEM_HARDWARE',
      terminalId: 'TERMINAL_01',
      actionType: 'POLICY_CHANGE',
      description: '检测到物理信道单光子窃听坍缩 (QBER 35.0%)，触发硬件开路隔离',
      sm3Hash: generateMockSm3Digest(`FUSE_35_${Date.now()}`),
      result: 'REJECTED',
      ipAddress: '192.168.1.101',
    };
    setAuditRecords(prev => [newAudit, ...prev]);
  };

  const handleResetBaseline = () => {
    const newQber = 1.2;
    const status = evaluateQber(newQber, policy.qberThresholdWarning, policy.qberThresholdFuse);
    setMetrics(prev => ({
      ...prev,
      qber: newQber,
      status,
    }));
    setAlertType(null);
  };

  // Chat message handlers
  const handleSendMessage = ({
    content,
    isEncrypted,
    cipherSuite,
    burnAfterSec,
    forcedReceipt,
  }: {
    content: string;
    isEncrypted: boolean;
    cipherSuite: 'SM2-Enveloped' | 'Plaintext';
    burnAfterSec?: number;
    forcedReceipt: boolean;
  }) => {
    const timeStr = formatTimeOnly();
    const digest = generateMockSm3Digest(content + timeStr);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'operator',
      senderName: 'operator',
      timestamp: timeStr,
      type: 'text',
      content,
      isEncrypted,
      cipherSuite,
      burnAfterSec,
      remainingBurnSec: burnAfterSec,
      deliveryStatus: 'delivered',
      receiptVerified: forcedReceipt,
    };

    setMessages(prev => [...prev, newMsg]);

    // Append to audit
    const newAudit: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      operator: 'operator',
      terminalId: 'TERMINAL_01',
      actionType: 'SM2_SESSION_INIT',
      description: `下发密态信令: ${content.slice(0, 20)}...`,
      sm3Hash: digest,
      result: 'SUCCESS',
      ipAddress: '192.168.1.101',
    };
    setAuditRecords(prev => [newAudit, ...prev]);

    // Simulated peer automatic response after 2.5s
    setTimeout(() => {
      const peerMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'peer',
        senderName: 'TERMINAL_02',
        timestamp: formatTimeOnly(),
        type: 'text',
        content: `TERMINAL_02 已接收指令并验签通过。工作密钥已单向刷新，回执已交付存证。`,
        isEncrypted: true,
        cipherSuite: 'SM2-Enveloped',
        deliveryStatus: 'delivered',
        receiptVerified: true,
      };
      setMessages(prev => [...prev, peerMsg]);
    }, 2500);
  };

  const handleSendFile = (fileName: string, fileSize: string, sm3Hash: string) => {
    const timeStr = formatTimeOnly();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'operator',
      senderName: 'operator',
      timestamp: timeStr,
      type: 'file',
      content: `涉密交付文档传输完成，SM3哈希已固化。`,
      fileName,
      fileSize,
      sm3Hash,
      isEncrypted: true,
      cipherSuite: 'SM2-Enveloped',
      deliveryStatus: 'delivered',
      receiptVerified: true,
    };
    setMessages(prev => [...prev, newMsg]);

    // Add to media archive & audit
    const newMedia: MediaRecord = {
      id: `MED-${Date.now().toString().slice(-3)}`,
      fileName,
      fileSize,
      uploader: 'operator',
      timestamp: new Date().toLocaleString(),
      sm3Signature: sm3Hash,
      fileType: fileName.endsWith('.html') ? 'HTML5 Package' : 'Encrypted Document',
      classification: '机密',
    };
    setMediaRecords(prev => [newMedia, ...prev]);

    const newAudit: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      operator: 'operator',
      terminalId: 'TERMINAL_01',
      actionType: 'FILE_DEPOSIT',
      description: `分发保密文件: ${fileName} (${fileSize})`,
      sm3Hash,
      result: 'SUCCESS',
      ipAddress: '192.168.1.101',
    };
    setAuditRecords(prev => [newAudit, ...prev]);
  };

  const handleSendVoice = () => {
    const timeStr = formatTimeOnly();
    const mockCipher = generateMockSm3Digest(`VOICE_STREAM_${Date.now()}`);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'operator',
      senderName: 'operator',
      timestamp: timeStr,
      type: 'audio',
      content: '加密双工语音通联会话',
      audioDuration: '00:04',
      sm4Cipher: mockCipher,
      isEncrypted: true,
      cipherSuite: 'SM4-GCM',
      deliveryStatus: 'delivered',
      receiptVerified: true,
    };
    setMessages(prev => [...prev, newMsg]);

    const newVoice: VoiceRecord = {
      id: `VOICE-${Date.now().toString().slice(-3)}`,
      timestamp: new Date().toLocaleString(),
      operator: 'operator',
      targetTerminal: 'TERMINAL_02',
      duration: '00:04',
      bitrate: '16kHz PCM / 64kbps',
      sm4Checksum: mockCipher,
      sizeKb: 32,
    };
    setVoiceRecords(prev => [newVoice, ...prev]);

    const newAudit: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      operator: 'operator',
      terminalId: 'TERMINAL_01',
      actionType: 'VOICE_CALL',
      description: '发起端到端SM4双工保密语音，会话时长 00:04',
      sm3Hash: mockCipher,
      result: 'SUCCESS',
      ipAddress: '192.168.1.101',
    };
    setAuditRecords(prev => [newAudit, ...prev]);
  };

  const handleClearScreen = () => {
    if (window.confirm('确定要清空当前工作台屏幕显示的内容吗？（后端密态存证记录不受影响）')) {
      setMessages([]);
    }
  };

  const handleExportTranscript = () => {
    const transcriptText = JSON.stringify(messages, null, 2);
    const blob = new Blob([transcriptText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `轻语工作台密态会话留存_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLockPeerNode = (nodeId: string) => {
    setPeerNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          return { ...n, qkdStatus: 'locked' };
        }
        return n;
      })
    );
  };

  return (
    <div className="h-screen w-screen bg-[#080B10] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      {/* 1. Top Global Navigation & Telemetry Bar */}
      <Header
        metrics={metrics}
        onOpenTelemetry={() => setShowTelemetry(true)}
        onOpenRadar={() => setShowRadar(true)}
        onOpenAudit={() => setShowAudit(true)}
        onOpenPolicy={() => setShowPolicy(true)}
        onLockScreen={() => setIsLocked(true)}
        onOpenOperatorDetails={() => setShowSelfDetails(true)}
      />

      {/* 2. Middle Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Secret Drawer */}
        <SecretDrawer
          isOpen={drawerOpen}
          metrics={metrics}
          onClose={() => setDrawerOpen(false)}
          onSimulateNoise={handleSimulateNoise}
          onSimulateFuse={handleSimulateFuse}
          onResetBaseline={handleResetBaseline}
          onManualQberChange={val =>
            setMetrics(prev => ({
              ...prev,
              qber: val,
              status: evaluateQber(val, policy.qberThresholdWarning, policy.qberThresholdFuse),
            }))
          }
        />

        {/* Center Communication Stream and Tactical Composer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageStream
            messages={messages}
            drawerOpen={drawerOpen}
            onToggleDrawer={() => setDrawerOpen(true)}
            onClearScreen={handleClearScreen}
            onExportTranscript={handleExportTranscript}
            onVerifyHash={(hash, fileName) => setVerifyModal({ hash, label: fileName })}
            onOpenPeerDetails={() => setShowPeerDetails(true)}
          />

          <ComposerBar
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onSendVoice={handleSendVoice}
            onOpenVideoCall={() => setShowVideoCall(true)}
          />
        </div>
      </div>

      {/* 3. Dedicated Interactive Modals */}
      {/* A. Ad-hoc Mesh Radar Modal */}
      <RadarModal
        isOpen={showRadar}
        nodes={peerNodes}
        onClose={() => setShowRadar(false)}
        onLockNode={handleLockPeerNode}
      />

      {/* B. Quantum QKD Channel Telemetry & Calibration Modal */}
      <QkdTelemetryModal
        isOpen={showTelemetry}
        metrics={metrics}
        onClose={() => setShowTelemetry(false)}
        onRecalibrate={handleResetBaseline}
      />

      {/* C. Audit and Encrypted Retention Center Modal (3 Tabs) */}
      <AuditRetentionModal
        isOpen={showAudit}
        auditRecords={auditRecords}
        voiceRecords={voiceRecords}
        mediaRecords={mediaRecords}
        onClose={() => setShowAudit(false)}
        onVerifyHash={(hash, label) => setVerifyModal({ hash, label })}
      />

      {/* D. Security Policy Settings Modal */}
      <PolicyModal
        isOpen={showPolicy}
        policy={policy}
        onClose={() => setShowPolicy(false)}
        onSavePolicy={newPol => setPolicy(newPol)}
      />

      {/* E. High Security Workstation Lock Screen */}
      <LockScreenModal
        isLocked={isLocked}
        onUnlock={handleUnlock}
      />

      {/* F. Peer Agent & Operator Credential Details */}
      <PeerAgentModal
        isOpen={showPeerDetails}
        onClose={() => setShowPeerDetails(false)}
        terminalId="TERMINAL_02"
        isSelf={false}
      />

      <PeerAgentModal
        isOpen={showSelfDetails}
        onClose={() => setShowSelfDetails(false)}
        terminalId="TERMINAL_01"
        isSelf={true}
      />

      {/* G. Channel Alert & Hard Fuse Modal */}
      <AlertModal
        alertType={alertType}
        onClose={() => setAlertType(null)}
        onEmergencyIsolate={() => {
          setAlertType(null);
          setIsLocked(true);
        }}
      />

      {/* H. SM3 Cryptographic Hash Certificate Verification */}
      {verifyModal && (
        <HashVerifyModal
          isOpen={Boolean(verifyModal)}
          hash={verifyModal.hash}
          label={verifyModal.label}
          onClose={() => setVerifyModal(null)}
        />
      )}

      {/* I. Point-to-Point Encrypted Video Handshake */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        terminalName="TERMINAL_02 (指挥枢纽对端)"
      />
    </div>
  );
}
