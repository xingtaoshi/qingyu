import React, { useEffect, useRef, useState } from 'react';
import {
  Radio,
  X,
  RefreshCw,
  Lock,
  Wifi,
  ShieldCheck,
  Check,
  Navigation
} from 'lucide-react';
import { PeerNode } from '../types/security';

interface RadarModalProps {
  isOpen: boolean;
  nodes: PeerNode[];
  onClose: () => void;
  onLockNode: (nodeId: string) => void;
}

export const RadarModal: React.FC<RadarModalProps> = ({
  isOpen,
  nodes,
  onClose,
  onLockNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('TERMINAL_02');
  const animationFrameId = useRef<number | null>(null);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 24;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw concentric rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      const ringLabels = ['0.5km', '1.0km', '2.0km', '3.0km 广播域'];

      rings.forEach((ratio, i) => {
        const r = maxRadius * ratio;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = i === rings.length - 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash(i === rings.length - 1 ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '9px monospace';
        ctx.fillText(ringLabels[i], centerX + 6, centerY - r + 10);
      });

      // 2. Axes & Crosshairs
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.stroke();

      // Azimuth ticks
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg * Math.PI) / 180;
        const x1 = centerX + Math.cos(rad) * (maxRadius - 4);
        const y1 = centerY + Math.sin(rad) * (maxRadius - 4);
        const x2 = centerX + Math.cos(rad) * maxRadius;
        const y2 = centerY + Math.sin(rad) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.stroke();

        if (deg % 90 === 0) {
          const textX = centerX + Math.cos(rad) * (maxRadius + 14);
          const textY = centerY + Math.sin(rad) * (maxRadius + 14);
          ctx.fillStyle = '#60a5fa';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${deg}°`, textX, textY);
        }
      }

      // 3. Rotating beam
      angleRef.current = (angleRef.current + 0.05) % (Math.PI * 2);
      const sweepAngle = angleRef.current;

      const sweepSteps = 20;
      for (let j = 0; j < sweepSteps; j++) {
        const stepAngle = sweepAngle - (j * 0.02);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, maxRadius, stepAngle, stepAngle + 0.025);
        ctx.closePath();
        const alpha = Math.max(0, (1 - j / sweepSteps) * 0.25);
        ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Center Node
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Blip Nodes
      nodes.forEach(node => {
        if (node.isCurrent) return;

        const rad = (node.azimuthDeg * Math.PI) / 180;
        const normDist = Math.min(1, node.distanceKm / 3.0);
        const nodeX = centerX + Math.cos(rad) * (maxRadius * normDist);
        const nodeY = centerY + Math.sin(rad) * (maxRadius * normDist);

        const isSelected = selectedNodeId === node.id;
        const isLocked = node.qkdStatus === 'locked';

        ctx.beginPath();
        ctx.arc(nodeX, nodeY, isSelected ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isLocked ? '#10b981' : '#f59e0b';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nodeX, nodeY, isSelected ? 12 : 9, 0, Math.PI * 2);
        ctx.strokeStyle = isLocked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(node.id, nodeX + 8, nodeY + 3);
      });
    };

    drawFrame();
    const intervalId = setInterval(drawFrame, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen, nodes, selectedNodeId]);

  if (!isOpen) return null;

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-4xl bg-[#0B0F17] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111722]/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>战术自组网与对端雷达探测</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
                  360° 全向扫描中
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                基于局域广播域单光子偏振探测与对端信令协商机制
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRescan}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>重新探测广播</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Canvas Radar (Left) + Peer Nodes (Right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Radar Canvas Viewport */}
          <div className="md:col-span-7 p-6 flex flex-col items-center justify-center bg-[#070A10] border-b md:border-b-0 md:border-r border-white/10 relative">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="rounded-full shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            />
            <div className="mt-4 flex items-center space-x-6 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>TERMINAL_01 (本机)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>量子纠缠锁定</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>协商待命</span>
              </div>
            </div>
          </div>

          {/* Node Topology List */}
          <div className="md:col-span-5 p-5 bg-[#0D121B] flex flex-col space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold pb-1 border-b border-white/10">
              <span>探测到对端节点 ({nodes.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">跳数: 1 Hop</span>
            </div>

            <div className="space-y-2.5">
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isLocked = node.qkdStatus === 'locked';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#151D2A] border-blue-500/50 shadow-md'
                        : 'bg-[#101622] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isLocked ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <span className="font-bold text-xs text-white">{node.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{node.ip}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-400 bg-black/30 p-2 rounded-lg">
                      <div>
                        <span className="text-slate-500 block">距离 / 方位</span>
                        <span className="text-slate-200">
                          {node.distanceKm}km / {node.azimuthDeg}°
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">信号 (RSSI)</span>
                        <span className="text-emerald-400">{node.rssi} dBm</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">通联状态</span>
                        <span className={isLocked ? 'text-emerald-400' : 'text-amber-400'}>
                          {isLocked ? '已纠缠锁定' : '待命探测'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">{node.role}</span>
                      {!node.isCurrent && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onLockNode(node.id);
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                            isLocked
                              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>纠缠中</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>发起量子配对</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-white/10 px-6 bg-[#0E131C] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>自组网加密模式: 无中心自愈 / 动态密钥树</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
          >
            完成拓扑配置
          </button>
        </div>
      </div>
    </div>
  );
};
