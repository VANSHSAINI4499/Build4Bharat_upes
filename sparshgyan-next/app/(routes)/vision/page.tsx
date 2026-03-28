'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  CameraOff,
  AlertCircle,
  Eye,
  Layers,
  BrainCircuit,
  Loader2,
  Play,
  Square,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function VisionPage() {
  const gestureActive = useAppStore((s) => s.gestureActive);
  const gestureStatus = useAppStore((s) => s.gestureStatus);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<any>(null);
  const tmModuleRef = useRef<any>(null);
  const predictionRafRef = useRef<number | null>(null);
  const loadedModelBaseRef = useRef('');
  const smoothedScoresRef = useRef<Record<string, number>>({});
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [tmBaseUrl, setTmBaseUrl] = useState('/my_model/');
  const [tmLoading, setTmLoading] = useState(false);
  const [tmActive, setTmActive] = useState(false);
  const [tmError, setTmError] = useState('');
  const [tmPredictions, setTmPredictions] = useState<
    Array<{ className: string; probability: number }>
  >([]);

  const SMOOTHING_ALPHA = 0.18;

  const stopTeachableMachine = useCallback(() => {
    setTmActive(false);
    if (predictionRafRef.current) {
      window.cancelAnimationFrame(predictionRafRef.current);
      predictionRafRef.current = null;
    }
  }, []);

  const normalizedModelBase = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return '/my_model/';
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  }, []);

  const ensureTeachableMachine = useCallback(async () => {
    if (tmModuleRef.current) return tmModuleRef.current;

    await import('@tensorflow/tfjs');
    const tmImage = await import('@teachablemachine/image');
    tmModuleRef.current = tmImage;
    return tmImage;
  }, []);

  const startTeachableMachine = useCallback(async () => {
    setTmError('');

    if (!cameraOn || !videoRef.current) {
      setTmError('Start the camera first, then start model inference.');
      return;
    }

    const base = normalizedModelBase(tmBaseUrl);
    const modelURL = `${base}model.json`;
    const metadataURL = `${base}metadata.json`;

    try {
      setTmLoading(true);
      const tmImage = await ensureTeachableMachine();
      if (!modelRef.current || loadedModelBaseRef.current !== base) {
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        loadedModelBaseRef.current = base;
      }
      smoothedScoresRef.current = {};
      setTmPredictions([]);
      setTmActive(true);
    } catch {
      setTmError(
        'Could not initialize Teachable Machine. Check internet connection once, then verify model.json, metadata.json, and weights in public/my_model.',
      );
    } finally {
      setTmLoading(false);
    }
  }, [cameraOn, ensureTeachableMachine, normalizedModelBase, tmBaseUrl]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      const e = err as { name?: string };
      setCameraError(
        e?.name === 'NotAllowedError'
          ? 'Camera access denied. Allow camera in browser settings.'
          : 'Could not start camera. Check device settings.',
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopTeachableMachine();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, [stopTeachableMachine]);

  useEffect(() => {
    if (!tmActive) return;
    if (!cameraOn || !videoRef.current || !modelRef.current) return;

    let cancelled = false;

    const runPrediction = async () => {
      if (cancelled || !videoRef.current || !modelRef.current) return;

      try {
        const prediction = await modelRef.current.predict(videoRef.current);
        const smoothed = (
          prediction as Array<{ className: string; probability: number }>
        ).map((item) => {
          const prev =
            smoothedScoresRef.current[item.className] ?? item.probability;
          const next = prev + SMOOTHING_ALPHA * (item.probability - prev);
          smoothedScoresRef.current[item.className] = next;
          return { className: item.className, probability: next };
        });

        // Keep class order stable to avoid visual jumpiness from frequent re-sorting.
        setTmPredictions(smoothed);
      } catch {
        setTmError('Prediction failed. Restart camera or model inference.');
        setTmActive(false);
      }

      if (!cancelled) {
        predictionRafRef.current = window.requestAnimationFrame(runPrediction);
      }
    };

    predictionRafRef.current = window.requestAnimationFrame(runPrediction);

    return () => {
      cancelled = true;
      if (predictionRafRef.current) {
        window.cancelAnimationFrame(predictionRafRef.current);
        predictionRafRef.current = null;
      }
    };
  }, [cameraOn, tmActive]);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopTeachableMachine();
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-black text-white">Vision Assist</h1>
            {gestureActive && (
              <Badge variant="success">
                <span className="mr-1">●</span> Gesture Service Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-white/40">
            Webcam gesture recognition powered by your local Python service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Camera preview */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl border border-white/8 bg-black overflow-hidden">
              {/* Video element */}
              <video
                ref={videoRef}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  cameraOn ? 'opacity-100' : 'opacity-0',
                )}
                autoPlay
                playsInline
                muted
              />

              {/* Overlay when camera off */}
              {!cameraOn && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <CameraOff className="h-7 w-7 text-white/25" />
                  </div>
                  <p className="text-white/30 text-sm">Camera starting…</p>
                </div>
              )}

              {/* Error overlay */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-950/20">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <p className="text-red-300 text-sm max-w-xs text-center">
                    {cameraError}
                  </p>
                  <Button size="sm" onClick={startCamera}>
                    Retry Camera
                  </Button>
                </div>
              )}

              {/* Camera-on indicator */}
              {cameraOn && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-black/60 backdrop-blur-sm px-3 py-1 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Camera Live
                  </span>
                </div>
              )}

              {/* Gesture overlay hints */}
              {gestureActive && cameraOn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4 flex flex-col gap-2"
                >
                  {[
                    { label: '✌️ Two fingers', action: 'Open panel' },
                    { label: '☝️ Index up', action: 'Click' },
                  ].map(({ label, action }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs"
                    >
                      <span className="text-white/60">{label}</span>
                      <span className="text-white/30 mx-1.5">→</span>
                      <span className="text-white/50">{action}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Camera controls */}
            <div className="flex items-center gap-3">
              {cameraOn ? (
                <Button variant="outline" onClick={stopCamera} size="sm">
                  <CameraOff className="h-3.5 w-3.5" />
                  Stop Camera
                </Button>
              ) : (
                <Button onClick={startCamera} size="sm">
                  <Camera className="h-3.5 w-3.5" />
                  Start Camera
                </Button>
              )}
            </div>

            {/* Teachable Machine panel */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                    <BrainCircuit className="h-4.5 w-4.5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Teachable Machine Classifier
                    </p>
                    <p className="text-xs text-white/45">
                      Runs in-browser on your live camera stream
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {tmActive ? 'Inference Live' : 'Idle'}
                </Badge>
              </div>

              <div className="space-y-2">
                <label htmlFor="tm-url" className="text-xs text-white/50">
                  Model base URL
                </label>
                <input
                  id="tm-url"
                  value={tmBaseUrl}
                  onChange={(e) => setTmBaseUrl(e.target.value)}
                  placeholder="/my_model/"
                  className="w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                />
                <p className="text-[11px] text-white/35">
                  Default path expects files in{' '}
                  <span className="text-white/60">public/my_model/</span>.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {tmActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopTeachableMachine}
                  >
                    <Square className="h-3.5 w-3.5" />
                    Stop Inference
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={startTeachableMachine}
                    disabled={tmLoading || !cameraOn}
                  >
                    {tmLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {tmLoading ? 'Loading Model...' : 'Start Inference'}
                  </Button>
                )}
                {!cameraOn && (
                  <span className="text-xs text-amber-300/80">
                    Camera must be on
                  </span>
                )}
              </div>

              {tmError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {tmError}
                </div>
              )}
            </div>

            {/* Feature explanation cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Eye,
                  label: 'Object Detection',
                  desc: 'MediaPipe-powered hand landmarks',
                  color: 'text-cyan-400',
                },
                {
                  icon: Layers,
                  label: 'Screen Overlay',
                  desc: 'Magnifier & focus ring',
                  color: 'text-purple-400',
                },
                {
                  icon: Camera,
                  label: '30fps Processing',
                  desc: 'Real-time local inference',
                  color: 'text-green-400',
                },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/6 bg-white/3 p-3 space-y-1.5"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <p className="text-xs font-semibold text-white/80">{label}</p>
                  <p className="text-[11px] text-white/35 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Gesture control + service status */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-white/80">
                  Live Predictions
                </p>
                <Badge variant="outline">{tmActive ? 'Live' : 'Idle'}</Badge>
              </div>
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {(tmPredictions.length
                  ? tmPredictions
                  : [{ className: 'No predictions yet', probability: 0 }]
                ).map((item) => (
                  <div
                    key={item.className}
                    className="rounded-lg border border-white/8 bg-black/30 px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/75">{item.className}</span>
                      <span className="text-cyan-300">
                        {(item.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-400/80 transition-all duration-200"
                        style={{
                          width: `${Math.max(0, Math.min(100, item.probability * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup instructions */}
            <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
              <p className="text-sm font-semibold text-white mb-3">
                Setup Required
              </p>
              <ol className="space-y-2.5">
                {[
                  'Install Python 3.10+ with pip',
                  'cd virtual-Mouse && pip install -r requirements.txt',
                  'Start gesture service: python app.py',
                  'Then click "Start Gesture Control" above',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-[10px] text-purple-400 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Service status */}
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="text-xs text-white/30 mb-2">Flask Service</p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    gestureStatus === 'running'
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-white/15',
                  )}
                />
                <span className="text-xs text-white/50">
                  {gestureStatus === 'running'
                    ? 'http://localhost:5000 — running'
                    : 'Not connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
