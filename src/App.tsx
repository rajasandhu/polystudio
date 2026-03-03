import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Layers, Settings, Grid3X3, Waves, Music, Dices, Trash2, 
  Volume2, Activity, Drum, Disc, Circle, Zap, Mic, Undo2, CircleDot,
  ArrowBigUp, ArrowBigDown, ChevronLeft, ChevronRight, FolderOpen, Save
} from 'lucide-react';

const TRACK_ICONS: Record<string, any> = {
  'drum-1': Circle, 'drum-2': Drum, 'drum-3': Disc, 'drum-4': Disc,
  'synth-1': Waves, 'synth-2': Music, 'synth-3': Zap, 'sample-1': Layers
};

const SIDEBAR_WIDTH = 372; 

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_TYPES = {
  'Major': [0, 2, 4, 5, 7, 9, 11], 'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9], 'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10], 'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

function getScaleNotes(root: string, type: keyof typeof SCALE_TYPES): string[] {
  const rootIdx = ROOT_NOTES.indexOf(root);
  const intervals = SCALE_TYPES[type];
  return intervals.map(interval => ROOT_NOTES[(rootIdx + interval) % 12]);
}

const PRESETS: Record<string, Record<string, any>> = {
  'drum-1': { 'Punch': { pitch: 55, decay: 0.3, snap: 0.8 }, 'Analog': { pitch: 50, decay: 0.7, snap: 0.4 }, 'Heavy': { pitch: 45, decay: 0.5, snap: 0.9 } },
  'drum-2': { 'Tight': { pitch: 180, decay: 0.15, snap: 0.9 }, 'OldSkool': { pitch: 220, decay: 0.3, snap: 0.5 }, 'Dry': { pitch: 200, decay: 0.1, snap: 0.7 } },
  'drum-3': { 'Titanium': { pitch: 8000, decay: 0.05, snap: 0.8 }, 'Open': { pitch: 6000, decay: 0.3, snap: 0.4 }, 'Classic': { pitch: 7000, decay: 0.1, snap: 0.6 } },
  'drum-4': { 'Power': { pitch: 120, decay: 0.4, snap: 0.6 }, 'Deep': { pitch: 80, decay: 0.6, snap: 0.4 }, 'Mid': { pitch: 100, decay: 0.3, snap: 0.5 } },
  'synth-1': { 'SubSurface': { cutoff: 250, resonance: 2, attack: 0.08, decay: 0.8, waveform: 'sin' }, 'Acid': { cutoff: 800, resonance: 15, attack: 0.01, decay: 0.2, waveform: 'saw' } },
  'synth-2': { 'ProSaw': { cutoff: 2200, resonance: 2, attack: 0.01, decay: 0.4, waveform: 'saw' }, 'FM-Bell': { cutoff: 1500, resonance: 4, attack: 0.01, decay: 1.2, waveform: 'sin' }, 'LeadPulse': { cutoff: 3000, resonance: 1, attack: 0.05, decay: 0.6, waveform: 'sqr' } },
  'synth-3': { 'Organic': { cutoff: 1200, resonance: 4, attack: 0.01, decay: 0.2, waveform: 'saw' }, 'Dream': { cutoff: 2500, resonance: 2, attack: 0.4, decay: 1.5, waveform: 'sin' }, 'Metal': { cutoff: 4000, resonance: 8, attack: 0.01, decay: 0.1, waveform: 'sqr' } },
  'sample-1': { 'Default': { pitch: 1.0, decay: 1.0 } }
};

function Knob({ label, value, min, max, onChange, color = "blue", size = "normal" }: { 
  label: string, value: number, min: number, max: number, onChange: (val: number) => void, color?: "blue" | "purple" | "orange", size?: "normal" | "mini"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); startY.current = e.clientY; startValue.current = value; document.body.style.cursor = 'ns-resize'; };
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = startY.current - e.clientY;
      const range = max - min;
      const nextValue = Math.min(max, Math.max(min, startValue.current + delta * (range / 200)));
      onChange(nextValue);
    };
    const handleMouseUp = () => { setIsDragging(false); document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, max, min, onChange]);
  const angle = ((value - min) / (max - min)) * 270 - 135;
  const colorHex = color === "blue" ? "#3b82f6" : color === "purple" ? "#a855f7" : "#f97316";
  const glowClass = color === "blue" ? "shadow-[0_0_8px_rgba(59,130,246,0.4)]" : color === "purple" ? "shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "shadow-[0_0_8px_rgba(249,115,22,0.4)]";
  const isMini = size === "mini";

  return (
    <div className={`flex flex-col items-center select-none group ${isMini ? 'gap-0.5' : 'gap-1'}`}>
      <span className={`${isMini ? 'text-[5px]' : 'text-[6px]'} font-black text-neutral-500 uppercase tracking-[0.1em] mb-1`}>{label}</span>
      <div onMouseDown={handleMouseDown} className={`relative rounded-full bg-neutral-800 border border-neutral-700 shadow-lg cursor-ns-resize flex items-center justify-center hover:border-neutral-500 transition-colors ${isMini ? 'w-6 h-6' : 'w-8 h-8'}`}>
        <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-neutral-700/10 to-neutral-900/40 pointer-events-none" />
        <div className={`${isMini ? 'w-[1.5px] h-2.5' : 'w-0.5 h-3'} rounded-full absolute top-0.5 origin-bottom ${glowClass}`} style={{ transform: `rotate(${angle}deg)`, backgroundColor: colorHex }} />
      </div>
      <span className={`${isMini ? 'text-[6px]' : 'text-[7px]'} font-mono font-bold bg-black px-1 rounded border border-neutral-800 min-w-[16px] text-center`} style={{ color: colorHex }}>{Math.round(value)}</span>
    </div>
  );
}

function SynthEngineUI({ activeTrack, tracks, updateParam, setTracks }: any) {
  const track = tracks.find((t: any) => t.id === activeTrack);
  const p = track?.params || {};

  return (
    <div className="flex-1 flex flex-col gap-1.5 overflow-hidden h-full">
      <div className="flex gap-2 shrink-0 h-28">
        <div className="flex-[2.5] bg-[#14161f] border border-neutral-800 rounded p-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-bold text-blue-400 uppercase tracking-widest">Model:</span>
              <div className="flex gap-1">
                {['sub', 'fm', 'acid'].map(m => (
                  <button key={m} onClick={() => setTracks((prev: any) => prev.map((t: any) => t.id === activeTrack ? {...t, synthModel: m} : t))}
                    className={`px-2 py-0.5 rounded border text-[6px] uppercase ${track?.synthModel === m ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_5px_#2563eb]' : 'bg-black/40 border-neutral-800 text-neutral-600'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-bold text-purple-400 uppercase tracking-widest">Wave:</span>
              <div className="flex gap-1">
                {['saw', 'sqr', 'sin', 'tri', 'nz'].map(w => (
                  <button key={w} onClick={() => updateParam(activeTrack, 'waveform', w)}
                    className={`px-1.5 py-0.5 rounded border text-[5px] uppercase ${p.waveform === w ? 'bg-purple-600 text-white border-purple-500' : 'bg-black/40 border-neutral-800 text-neutral-600'}`}>{w}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-black/30 border border-neutral-800/50 rounded flex items-center justify-between px-3">
             <div className="flex flex-col gap-0.5">
               <span className="text-[5px] text-neutral-500 uppercase font-black">Osc 1</span>
               <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#a855f7] ${p.waveform === 'nz' ? 'bg-white' : 'bg-purple-500'}`} />
                 <span className="text-[8px] font-bold uppercase text-neutral-300">{p.waveform === 'nz' ? 'Noise Generator' : 'Analog Source'}</span>
               </div>
             </div>
             <div className="flex gap-4">
                <Knob label="Pitch" value={p.pitch || 0} onChange={(v) => updateParam(activeTrack, 'pitch', v)} min={-24} max={24} size="mini" color="purple" />
                <Knob label="Fine" value={p.fine || 0} onChange={(v) => updateParam(activeTrack, 'fine', v)} min={-100} max={100} size="mini" color="purple" />
                <Knob label="Gain" value={(p.level ?? 1) * 100} onChange={(v) => updateParam(activeTrack, 'level', v/100)} min={0} max={100} size="mini" color="purple" />
             </div>
          </div>
        </div>
        <div className="flex-1 bg-[#14161f] border border-neutral-800 rounded p-2 flex flex-col">
          <span className="text-[6px] font-black text-neutral-600 uppercase mb-2">Modulation</span>
          <div className="flex items-center justify-between gap-1 flex-1">
            <Knob label="FM Amt" value={p.fmAmount || 0} onChange={(v) => updateParam(activeTrack, 'fmAmount', v)} min={0} max={2000} size="mini" color="purple" />
            <Knob label="FM Frq" value={p.fmRatio || 2} onChange={(v) => updateParam(activeTrack, 'fmRatio', v)} min={0.5} max={12} size="mini" color="purple" />
            <Knob label="Ring" value={p.ringMod || 0} onChange={(v) => updateParam(activeTrack, 'ringMod', v)} min={0} max={100} size="mini" color="orange" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 h-20 shrink-0">
        <div className="flex-1 bg-[#14161f] border border-neutral-800 rounded p-1.5 flex items-center gap-4">
          <div className="w-14 h-full bg-black/40 border border-neutral-800 rounded flex flex-col p-1 shrink-0">
             <span className="text-[5px] text-blue-500 font-bold uppercase">Filter Unit</span>
             <div className="flex-1 border-b border-l border-blue-500/20 rounded-bl mt-1" />
          </div>
          <div className="flex-1 grid grid-cols-4 gap-2">
            <Knob label="Cutoff" value={p.cutoff || 1000} onChange={(v) => updateParam(activeTrack, 'cutoff', v)} min={20} max={10000} size="mini" color="blue" />
            <Knob label="Res" value={p.resonance || 1} onChange={(v) => updateParam(activeTrack, 'resonance', v)} min={0.1} max={20} size="mini" color="blue" />
            <Knob label="Env" value={p.filterEnvAmount || 0} onChange={(v) => updateParam(activeTrack, 'filterEnvAmount', v)} min={0} max={8000} size="mini" color="blue" />
            <Knob label="Drive" value={p.drive || 0} onChange={(v) => updateParam(activeTrack, 'drive', v)} min={0} max={100} size="mini" color="blue" />
          </div>
        </div>
        <div className="w-56 bg-[#14161f] border border-neutral-800 rounded p-1.5 flex flex-col">
          <span className="text-[6px] font-black text-neutral-600 uppercase mb-1">Performance Map</span>
          <div className="flex justify-around items-center flex-1 gap-2">
             <div className="flex flex-col items-center gap-1">
                <Knob label="Expression" value={p.expression || 0} onChange={(v) => updateParam(activeTrack, 'expression', v)} min={0} max={100} size="mini" color="orange" />
                <span className="text-[4px] text-neutral-700 uppercase font-bold tracking-tighter">Vibrato</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <Knob label="Texture" value={p.texture || 0} onChange={(v) => updateParam(activeTrack, 'texture', v)} min={0} max={100} size="mini" color="orange" />
                <span className="text-[4px] text-neutral-700 uppercase font-bold tracking-tighter">Detune</span>
             </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 h-[104px] overflow-hidden">
        <div className="flex-1 bg-[#14161f] border border-neutral-800 rounded p-1.5 flex flex-col">
          <div className="flex items-center justify-between border-b border-neutral-800/50 pb-0.5 mb-1">
            <span className="text-[6px] font-black text-purple-400 uppercase tracking-widest">Master Amp Envelope</span>
          </div>
          <div className="flex-1 flex gap-3 items-center">
             <div className="flex-1 h-16 border border-black/60 bg-black/40 rounded relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="env-grad-violet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`M 0 40 L 15 5 L 45 15 L 75 15 L 100 40`} stroke="#a855f7" fill="url(#env-grad-violet)" strokeWidth="1.5" ></p>
                  <circle cx="15" cy="5" r="2.5" fill="#a855f7" />
                  <circle cx="45" cy="15" r="2.5" fill="#a855f7" />
                  <circle cx="75" cy="15" r="2.5" fill="#a855f7" />
                </svg>
             </div>
             <div className="flex gap-1.5">
               <Knob label="A" value={(p.attack || 0.01)*100} onChange={(v) => updateParam(activeTrack, 'attack', v/100)} min={0.1} max={100} size="mini" color="purple" />
               <Knob label="D" value={(p.decay || 0.3)*100} onChange={(v) => updateParam(activeTrack, 'decay', v/100)} min={1} max={100} size="mini" color="purple" />
               <Knob label="S" value={(p.sustain ?? 0.5)*100} onChange={(v) => updateParam(activeTrack, 'sustain', v/100)} min={0} max={100} size="mini" color="purple" />
               <Knob label="R" value={(p.release || 0.4)*100} onChange={(v) => updateParam(activeTrack, 'release', v/100)} min={1} max={100} size="mini" color="purple" />
             </div>
          </div>
        </div>
        <div className="w-48 bg-[#14161f] border border-neutral-800 rounded p-1.5 flex flex-col">
          <span className="text-[6px] font-black text-neutral-600 uppercase mb-1">Dynamics Control</span>
          <div className="flex-1 flex gap-1">
             {['Strike', 'Glide', 'Slide', 'Press'].map((l) => (
               <div key={l} className="flex-1 border border-black/40 bg-black/20 rounded p-1 flex flex-col items-center justify-between">
                  <div className="flex-1 w-full border-b border-l border-green-500/10" />
                  <span className="text-[4px] text-neutral-700 uppercase">{l}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type StepState = { active: boolean; velocity: number; notes: string[]; locked: boolean; };
type TrackParams = { 
  pitch?: number; decay?: number; cutoff?: number; resonance?: number; 
  attack?: number; sustain?: number; release?: number; waveform?: string; 
  snap?: number; filterAttack?: number; filterDecay?: number; filterSustain?: number; 
  filterRelease?: number; filterEnvAmount?: number; drive?: number;
  fmAmount?: number; fmRatio?: number; ringMod?: number; 
  expression?: number; texture?: number; fine?: number; level?: number; pan?: number;
  macro1?: number; macro2?: number;
};
type Track = { id: string; name: string; type: 'drum' | 'synth'; synthModel?: 'sub' | 'fm' | 'acid'; color: string; volume: number; muted: boolean; soloed: boolean; locked: boolean; fxSend: boolean; probability: number; activePreset: string; params: TrackParams; steps: StepState[]; isPlayingLane: boolean; playbackDirection: 'forward' | 'reverse'; stepSpeed: 0.5 | 1 | 2 | 4; };

export default function PolyStudioGroovebox() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<Track[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(128);
  const [numSteps, setNumSteps] = useState(32);
  const [zoom, setZoom] = useState(1);
  const [rootNote, setRootNote] = useState('F');
  const [scaleType, setScaleType] = useState<keyof typeof SCALE_TYPES>('Minor');
  const [activeTrack, setActiveTrack] = useState('drum-1');
  const [editingStep, setEditingStep] = useState<{ trackId: string, index: number } | null>(null);
  const [keyboardOctave, setKeyboardOctave] = useState(3);
  const [activeTab, setActiveTab] = useState<'engine' | 'sampler'>('engine');
  const [sampleParams, setSampleParams] = useState({ start: 0, end: 1, pitch: 1.0, slices: 1, attack: 0.01, decay: 0.5, sustain: 0.7, release: 0.4, filterCutoff: 5000 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStepTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const schedulerTimerRef = useRef<number | null>(null);
  const tracksRef = useRef<Track[]>([]);
  const activeTrackRef = useRef(activeTrack);
  const isRecordingRef = useRef(isRecording);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { const data = localStorage.getItem('polystudio_saved_songs'); if (data) setSavedSongs(JSON.parse(data)); }, []);
  const [samplerBuffer, setSamplerBuffer] = useState<AudioBuffer | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [songName, setSongName] = useState('');
  const [savedSongs, setSavedSongs] = useState<any[]>([]);
  const [masterDelay, setMasterDelay] = useState({ time: 0.375, feedback: 0.4, mix: 30, enabled: false, type: 'Stereo' });
  const [masterReverb, setMasterReverb] = useState({ roomSize: 0.7, dampening: 3000, mix: 20, enabled: false, type: 'Hall' });
  const [masterComp, setMasterComp] = useState({ threshold: -24, ratio: 4, attack: 0.003, release: 0.25, enabled: false, type: 'Soft' });

  const masterBusRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const delayWetRef = useRef<GainNode | null>(null);
  const reverbWetRef = useRef<GainNode | null>(null);
  const compNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const masterOutRef = useRef<GainNode | null>(null);

  const [tracks, setTracks] = useState<Track[]>([
    { id: 'drum-1', name: 'KICK', type: 'drum', color: '#ff4b2b', volume: 0.6, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Studio Punch', params: { pitch: 55, decay: 0.3, snap: 0.5 }, steps: Array(256).fill(null).map((_, i) => ({ active: i % 4 === 0, velocity: 100, notes: ['C1'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'drum-2', name: 'SNARE', type: 'drum', color: '#ff416c', volume: 0.5, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Studio Tight', params: { pitch: 180, decay: 0.15, snap: 0.9 }, steps: Array(256).fill(null).map((_, i) => ({ active: i % 8 === 4, velocity: 100, notes: ['C3'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'drum-3', name: 'HATS', type: 'drum', color: '#feb47b', volume: 0.4, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Titanium', params: { pitch: 8000, decay: 0.05, snap: 0.8 }, steps: Array(256).fill(null).map((_, i) => ({ active: i % 2 === 0, velocity: 100, notes: ['C5'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'drum-4', name: 'TOM', type: 'drum', color: '#fbbf24', volume: 0.5, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Power Tom', params: { pitch: 120, decay: 0.4, snap: 0.6 }, steps: Array(256).fill(null).map(() => ({ active: false, velocity: 100, notes: ['C2'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'synth-1', name: 'BASS', type: 'synth', synthModel: 'sub', color: '#4facfe', volume: 0.45, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Heavy Analog', params: { cutoff: 250, resonance: 2, attack: 0.1, decay: 0.6, waveform: 'sin', pitch: 0, drive: 0 }, steps: Array(256).fill(null).map((_, i) => ({ active: i % 16 === 0, velocity: 100, notes: ['F1'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'synth-2', name: 'LEAD', type: 'synth', synthModel: 'fm', color: '#00f2fe', volume: 0.4, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Pro Saw', params: { cutoff: 2200, resonance: 1, attack: 0.01, decay: 0.4, waveform: 'saw', pitch: 0, drive: 0 }, steps: Array(256).fill(null).map(() => ({ active: false, velocity: 100, notes: ['C4'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'synth-3', name: 'PLUCKS', type: 'synth', synthModel: 'sub', color: '#a78bfa', volume: 0.4, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Organic Pluck', params: { cutoff: 1200, resonance: 4, attack: 0.01, decay: 0.2, waveform: 'saw', pitch: 0, drive: 0 }, steps: Array(256).fill(null).map((_, i) => ({ active: i % 16 === 8, velocity: 100, notes: ['F4'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
    { id: 'sample-1', name: 'SAMPLES', type: 'drum', color: '#f472b6', volume: 0.5, muted: false, soloed: false, locked: false, fxSend: false, probability: 1.0, activePreset: 'Default', params: { pitch: 1.0, decay: 1.0 }, steps: Array(256).fill(null).map(() => ({ active: false, velocity: 100, notes: ['C3'], locked: false })), isPlayingLane: false, playbackDirection: 'forward', stepSpeed: 1 },
  ]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); audioContextRef.current = ctx;
      const mB = ctx.createGain(); const dN = ctx.createDelay(2.0); const dF = ctx.createGain(); 
      const dW = ctx.createGain(); const rW = ctx.createGain(); const cN = ctx.createDynamicsCompressor(); const mO = ctx.createGain();
      const length = ctx.sampleRate * 2; const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); for (let i = 0; i < length; i++) { data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2); } }
      const reverbNode = ctx.createConvolver(); reverbNode.buffer = buffer;
      mB.connect(cN); cN.connect(mO); mB.connect(dN); dN.connect(dF); dF.connect(dN); dN.connect(dW); dW.connect(mO); cN.connect(reverbNode); reverbNode.connect(rW); rW.connect(mO); mO.connect(ctx.destination);
      masterBusRef.current = mB; delayNodeRef.current = dN; delayFeedbackRef.current = dF; delayWetRef.current = dW; reverbWetRef.current = rW; compNodeRef.current = cN; masterOutRef.current = mO;
    }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
  };

  const pushH = (st: Track[]) => setHistory(prev => [JSON.parse(JSON.stringify(st)), ...prev].slice(0, 20));
  const undo = () => { if (history.length === 0) return; const prev = history[0]; setTracks(prev); setHistory(h => h.slice(1)); };
  const saveSong = (name: string) => { const newSong = { name, id: Date.now().toString(), bpm, numSteps, rootNote, scaleType, tracks: tracks.map(t => ({ ...t, steps: t.steps.slice(0, 256) })) }; const updated = [...savedSongs, newSong]; setSavedSongs(updated); localStorage.setItem('polystudio_saved_songs', JSON.stringify(updated)); setShowSaveModal(false); setSongName(''); };
  const loadSong = (id: string) => { const song = savedSongs.find(s => s.id === id); if (song) { setIsPlaying(false); setBpm(song.bpm || 128); setNumSteps(song.numSteps || 32); setRootNote(song.rootNote || 'F'); setScaleType(song.scaleType || 'Minor'); setTracks(song.tracks); setShowPatternLibrary(false); } };
  const noteToFreq = (note: string) => { const nM: Record<string, number> = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 }; const m = note.match(/([A-G]#?)(\d)/); if (!m) return 440; const midi = (parseInt(m[2], 10) + 1) * 12 + nM[m[1]]; return 440 * Math.pow(2, (midi - 69) / 12); };

  const playKick = (t: number, v: number, p: TrackParams, fx: boolean = false) => {
    initAudio(); const ctx = audioContextRef.current!; const osc = ctx.createOscillator(); const gain = ctx.createGain(); const clk = ctx.createOscillator(); const cg = ctx.createGain();
    const bF = p.pitch || 55; osc.frequency.setValueAtTime(bF * 2, t); osc.frequency.exponentialRampToValueAtTime(bF, t + 0.05); osc.frequency.exponentialRampToValueAtTime(0.01, t + (p.decay || 0.3));
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(v * 1.5, t + 0.002); gain.gain.exponentialRampToValueAtTime(0.001, t + (p.decay || 0.3));
    clk.frequency.setValueAtTime(1000, t); cg.gain.setValueAtTime((p.snap || 0.5) * v, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    const dest = (fx && masterBusRef.current) ? masterBusRef.current : (masterOutRef.current || ctx.destination);
    osc.connect(gain); gain.connect(dest); clk.connect(cg); cg.connect(dest); osc.start(t); clk.start(t); osc.stop(t + (p.decay || 0.3)); clk.stop(t + 0.02);
  };
  const playSnare = (t: number, v: number, p: TrackParams, fx: boolean = false) => {
    initAudio(); const ctx = audioContextRef.current!; const nz = ctx.createBufferSource(); const ng = ctx.createGain(); const nf = ctx.createBiquadFilter();
    const bS = ctx.sampleRate * 0.5; const buf = ctx.createBuffer(1, bS, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < bS; i++) d[i] = Math.random() * 2 - 1;
    nz.buffer = buf; nf.type = 'highpass'; nf.frequency.setValueAtTime(1000, t); ng.gain.setValueAtTime(v * 0.4, t); ng.gain.exponentialRampToValueAtTime(0.001, t + (p.decay || 0.2));
    const dest = (fx && masterBusRef.current) ? masterBusRef.current : (masterOutRef.current || ctx.destination);
    nz.connect(nf); nf.connect(ng); ng.connect(dest); nz.start(t); nz.stop(t + (p.decay || 0.2));
  };
  const playHiHat = (t: number, v: number, p: TrackParams, fx: boolean = false) => {
    initAudio(); const ctx = audioContextRef.current!; const nz = ctx.createBufferSource(); const ng = ctx.createGain(); const nf = ctx.createBiquadFilter();
    const bS = ctx.sampleRate * 0.5; const buf = ctx.createBuffer(1, bS, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < bS; i++) d[i] = Math.random() * 2 - 1;
    nz.buffer = buf; nf.type = 'highpass'; nf.frequency.setValueAtTime(p.pitch || 8000, t); ng.gain.setValueAtTime(v * 0.6, t); ng.gain.exponentialRampToValueAtTime(0.001, t + (p.decay || 0.05));
    const dest = (fx && masterBusRef.current) ? masterBusRef.current : (masterOutRef.current || ctx.destination);
    nz.connect(nf); nf.connect(ng); ng.connect(dest); nz.start(t); nz.stop(t + (p.decay || 0.05));
  };
  const playTom = (t: number, v: number, p: TrackParams, fx: boolean = false) => {
    initAudio(); const ctx = audioContextRef.current!; const osc = ctx.createOscillator(); const gain = ctx.createGain();
    const bF = p.pitch || 120; osc.frequency.setValueAtTime(bF * 1.5, t); osc.frequency.exponentialRampToValueAtTime(bF, t + 0.1);
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(v * 0.8, t + 0.005); gain.gain.exponentialRampToValueAtTime(0.001, t + (p.decay || 0.4));
    const dest = (fx && masterBusRef.current) ? masterBusRef.current : (masterOutRef.current || ctx.destination);
    osc.connect(gain); gain.connect(dest); osc.start(t); osc.stop(t + (p.decay || 0.4));
  };

  const playSynthModel = (t: number, f: number, v: number, track: Track) => {
    initAudio(); const ctx = audioContextRef.current!; const gain = ctx.createGain(); const filter = ctx.createBiquadFilter(); 
    const p = track.params; const model = track.synthModel || 'sub'; const fx = track.fxSend; const dest = (fx && masterBusRef.current) ? masterBusRef.current : (masterOutRef.current || ctx.destination);
    const a = p.attack || 0.01; const d = p.decay || 0.3; const s = p.sustain ?? 0.5; const r = p.release || 0.4;
    const semitones = Math.round(p.pitch || 0); const fine = (p.fine || 0) / 100; const finalFreq = f * Math.pow(2, (semitones + fine) / 12);
    let src: OscillatorNode | AudioBufferSourceNode;
    const texture = p.texture || 0;
    
    if (p.waveform === 'nz') { 
      const bS = ctx.sampleRate * 1.5; const buf = ctx.createBuffer(1, bS, ctx.sampleRate); const data = buf.getChannelData(0); for (let i = 0; i < bS; i++) data[i] = Math.random() * 2 - 1; const sNode = ctx.createBufferSource(); sNode.buffer = buf; src = sNode; 
    }
    else { 
      const osc = ctx.createOscillator(); const waveMap: Record<string, OscillatorType> = { 'saw': 'sawtooth', 'sqr': 'square', 'sin': 'sine', 'tri': 'triangle' }; 
      osc.type = waveMap[p.waveform || 'saw'] || 'sawtooth'; 
      osc.frequency.setValueAtTime(finalFreq, t); 
      src = osc; 
      if (texture > 0) { 
        const detuneOsc = ctx.createOscillator(); detuneOsc.type = osc.type; detuneOsc.frequency.setValueAtTime(finalFreq * (1 + texture/5000), t); const detuneGain = ctx.createGain(); detuneGain.gain.value = texture/200; detuneOsc.connect(detuneGain); (src as OscillatorNode).detune.setValueAtTime(texture * 2, t); detuneGain.connect(gain); detuneOsc.start(t); detuneOsc.stop(t + a + d + r + 0.1); 
      } 
    }

    if (model === 'fm' && src instanceof OscillatorNode) { 
      const mod = ctx.createOscillator(); const modG = ctx.createGain(); 
      mod.frequency.setValueAtTime(finalFreq * (p.fmRatio || 2), t); 
      modG.gain.setValueAtTime(p.fmAmount || 1000, t); 
      mod.connect(modG); modG.connect(src.frequency); 
      src.type = 'sine'; 
      mod.start(t); mod.stop(t + a + d + r + 0.1); 
    }

    filter.type = 'lowpass';
    const bC = p.cutoff || 2000; 
    const eA = p.filterEnvAmount || 0; 
    filter.frequency.setValueAtTime(bC, t);
    if (eA !== 0) {
      filter.frequency.exponentialRampToValueAtTime(Math.min(20000, Math.max(20, bC + eA)), t + 0.04);
      filter.frequency.exponentialRampToValueAtTime(bC, t + a + d);
    }
    
    if (model === 'acid' && src instanceof OscillatorNode) { 
      src.type = 'sawtooth'; 
      filter.Q.setValueAtTime((p.resonance || 1) * 2 + 12 + (texture/5), t); 
    } else { 
      filter.Q.setValueAtTime(p.resonance || 1, t); 
    }

    let signalChain: AudioNode = src; 
    if (p.ringMod && p.ringMod > 0) { 
      const ringOsc = ctx.createOscillator(); ringOsc.frequency.setValueAtTime(440 + (texture * 10), t); const mult = ctx.createGain(); mult.gain.value = 0; src.connect(mult); ringOsc.connect(mult.gain); const wet = ctx.createGain(); wet.gain.value = p.ringMod / 100; const dry = ctx.createGain(); dry.gain.value = 1 - (p.ringMod / 100); mult.connect(wet); src.connect(dry); const out = ctx.createGain(); wet.connect(out); dry.connect(out); ringOsc.start(t); ringOsc.stop(t + a + d + r + 0.1); signalChain = out; 
    }

    const expression = p.expression || 0; 
    if (expression > 0 && src instanceof OscillatorNode) { 
      const lfo = ctx.createOscillator(); const lfoG = ctx.createGain(); lfo.frequency.setValueAtTime(6, t); lfoG.gain.setValueAtTime(expression / 2, t); lfo.connect(lfoG); lfoG.connect(src.frequency); lfo.start(t); lfo.stop(t + a + d + r + 0.1); 
    }

    gain.gain.setValueAtTime(0, t); 
    gain.gain.linearRampToValueAtTime(v * 0.4, t + a); 
    gain.gain.linearRampToValueAtTime(v * 0.4 * s, t + a + d); 
    gain.gain.exponentialRampToValueAtTime(0.001, t + a + d + r);

    const driveAmt = (p.drive || 0) + (texture / 2); 
    if (driveAmt > 0) { 
      const shaper = ctx.createWaveShaper(); shaper.curve = ((amt) => { const k = amt; const n = 44100; const c = new Float32Array(n); for (let i = 0; i < n; ++i) { const x = (i * 2) / n - 1; c[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x)); } return c; })(driveAmt); 
      signalChain.connect(filter); filter.connect(shaper); shaper.connect(gain); 
    } else { 
      signalChain.connect(filter); filter.connect(gain); 
    }
    gain.connect(dest); 
    if (src instanceof OscillatorNode) src.start(t); else (src as AudioBufferSourceNode).start(t);
    src.stop(t + a + d + r + 0.1);
  };

  const triggerTrack = (tId: string, f?: number) => { const tr = tracksRef.current.find(x => x.id === tId); if (!tr) return; const t = audioContextRef.current ? audioContextRef.current.currentTime : 0; const aF = f || (editingStep && editingStep.trackId === tId ? (tr.steps[editingStep.index].notes.length > 0 ? noteToFreq(tr.steps[editingStep.index].notes[0]) : undefined) : undefined); if (tId === 'drum-1') playKick(t, tr.volume, tr.params, tr.fxSend); else if (tId === 'drum-2') playSnare(t, tr.volume, tr.params, tr.fxSend); else if (tId === 'drum-3') playHiHat(t, tr.volume, tr.params, tr.fxSend); else if (tId === 'drum-4') playTom(t, tr.volume, tr.params, tr.fxSend); else playSynthModel(t, aF || 440, tr.volume, tr); };
  const handleNoteInput = (tId: string, sI: number, n: string) => { setTracks(prev => prev.map(x => { if (x.id === tId) { const ns = [...x.steps]; const notes = ns[sI].notes.includes(n) ? ns[sI].notes.filter(y => y !== n) : [...ns[sI].notes, n].slice(-6); ns[sI] = { ...ns[sI], notes, active: notes.length > 0 }; return { ...x, steps: ns }; } return x; })); };

  useEffect(() => {
    const keyMap: Record<string, string> = {
      'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B', 'k': 'C'
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || ['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        const oct = e.key.toLowerCase() === 'k' ? keyboardOctave + 1 : keyboardOctave;
        const fn = `${note}${oct}`;
        if (editingStep) handleNoteInput(editingStep.trackId, editingStep.index, fn);
        else triggerTrack(activeTrackRef.current, noteToFreq(fn));
        if (isRecordingRef.current) handleNoteInput(activeTrackRef.current, currentStepRef.current, fn);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardOctave, editingStep]);

  useEffect(() => { if (!navigator.requestMIDIAccess) return; const onMM = (m: any) => { const c = m.data[0]; const n = m.data[1]; const v = m.data[2]; if ((c & 0xF0) === 0x90 && v > 0) { const nn = ROOT_NOTES[n % 12]; const oct = Math.floor(n / 12) - 1; const fn = `${nn}${oct}`; if (editingStep) handleNoteInput(editingStep.trackId, editingStep.index, fn); else triggerTrack(activeTrackRef.current, noteToFreq(fn)); if (isRecordingRef.current) handleNoteInput(activeTrackRef.current, currentStepRef.current, fn); } }; navigator.requestMIDIAccess().then(a => { for (const i of a.inputs.values()) i.onmidimessage = onMM; }); }, [editingStep]);
  useEffect(() => { activeTrackRef.current = activeTrack; isRecordingRef.current = isRecording; tracksRef.current = tracks; if (delayWetRef.current) delayWetRef.current.gain.setTargetAtTime(masterDelay.enabled ? masterDelay.mix / 100 : 0, 0, 0.05); if (delayFeedbackRef.current) delayFeedbackRef.current.gain.setTargetAtTime(masterDelay.enabled ? 0.4 : 0, 0, 0.05); if (delayNodeRef.current) delayNodeRef.current.delayTime.setTargetAtTime(masterDelay.time, 0, 0.05); if (reverbWetRef.current) reverbWetRef.current.gain.setTargetAtTime(masterReverb.enabled ? masterReverb.mix / 100 : 0, 0, 0.05); if (compNodeRef.current) { compNodeRef.current.threshold.setTargetAtTime(masterComp.enabled ? masterComp.threshold : 0, 0, 0.05); compNodeRef.current.ratio.setTargetAtTime(masterComp.enabled ? masterComp.ratio : 1, 0, 0.05); } }, [activeTrack, isRecording, tracks, masterDelay, masterReverb, masterComp]);

  useEffect(() => {
    const isAnyLanePlaying = tracks.some(t => t.isPlayingLane);
    if (isPlaying || isAnyLanePlaying) {
      initAudio(); const ctx = audioContextRef.current!; nextStepTimeRef.current = ctx.currentTime;
      const scheduler = () => { const cT = tracksRef.current; if (!isPlaying && !cT.some(t => t.isPlayingLane)) return; while (nextStepTimeRef.current < ctx.currentTime + 0.1) { const t = nextStepTimeRef.current; cT.forEach(tr => { if ((isPlaying || tr.isPlayingLane) && !tr.muted) { const speedFactor = tr.stepSpeed; const raw = Math.floor(currentStepRef.current / speedFactor) % numSteps; const idx = tr.playbackDirection === 'forward' ? raw : (numSteps - 1) - raw; if (currentStepRef.current % speedFactor === 0) { const st = tr.steps[idx]; if (st && st.active && Math.random() < tr.probability) { st.notes.forEach(note => { triggerTrack(tr.id, noteToFreq(note)); }); } } } }); nextStepTimeRef.current += (60.0 / bpm / 4.0); currentStepRef.current = (currentStepRef.current + 1) % numSteps; setCurrentStep(currentStepRef.current); } schedulerTimerRef.current = window.setTimeout(scheduler, 25); };
      scheduler();
    } else { if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current); } return () => { if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current); };
  }, [isPlaying, tracks.some(t => t.isPlayingLane), bpm, numSteps]);

  const toggleMasterPlay = () => { initAudio(); const next = !isPlaying; setIsPlaying(next); if (!next) setTracks(prev => prev.map(t => ({ ...t, isPlayingLane: false }))); };
  const updateNumSteps = (nV: number) => { if (nV > numSteps) { const r = nV / numSteps; setTracks(tracks.map(tr => { const oS = tr.steps.slice(0, numSteps); const nTr = [...tr.steps]; for (let i = 1; i < r; i++) { for (let j = 0; j < numSteps; j++) nTr[i * numSteps + j] = { ...oS[j], locked: false }; } return { ...tr, steps: nTr }; })); } setNumSteps(nV); };
  const updateParam = (tId: string, p: keyof TrackParams, v: any) => setTracks(tracks.map(t => t.id === tId ? { ...t, params: { ...t.params, [p]: v } } : t));
  const toggleStep = (tId: string, sI: number) => { setActiveTrack(tId); setTracks(tracks.map(t => { if (t.id === tId) { const ns = [...t.steps]; ns[sI].active = !ns[sI].active; if (ns[sI].active) setEditingStep({ trackId: tId, index: sI }); else if (editingStep?.index === sI && editingStep?.trackId === tId) setEditingStep(null); return { ...t, steps: ns }; } return t; })); };
  const nudgeTrack = (tI: string, d: number) => { pushH(tracks); setTracks(prev => prev.map(t => { if (t.id === tI) { const ns = [...t.steps]; const sl = ns.slice(0, numSteps); if (d > 0) { const l = sl.pop()!; sl.unshift(l); } else { const f = sl.shift()!; sl.push(f); } for (let i = 0; i < numSteps; i++) ns[i] = sl[i]; return { ...t, steps: ns }; } return t; })); };
  const shiftTrackOctave = (tI: string, delta: number) => { pushH(tracks); setTracks(prev => prev.map(t => { if (t.id === tI) { return { ...t, steps: t.steps.map(s => ({ ...s, notes: s.notes.map(n => { const m = n.match(/([A-G]#?)(\d)/); if (m) return `${m[1]}${Math.max(0, Math.min(8, parseInt(m[2]) + delta))}`; return n; }) })) }; } return t; })); };
  const applyPreset = (tId: string, pN: string) => { const p = PRESETS[tId]?.[pN]; if (p) setTracks(tracks.map(t => t.id === tId ? { ...t, activePreset: pN, params: { ...t.params, ...p } } : t)); };

  const randomizeAll = () => { pushH(tracks); const sN = getScaleNotes(rootNote, scaleType); setTracks(prev => prev.map(tr => { const isKick = tr.id === 'drum-1'; const isSnare = tr.id === 'drum-2'; const isHats = tr.id === 'drum-3'; const isMelodic = tr.type === 'synth'; return { ...tr, stepSpeed: 1, steps: tr.steps.map((s, i) => { let active = false; let notes = tr.type === 'drum' ? (isKick ? ['C1'] : ['C3']) : [`${sN[0]}2`]; if (isKick) active = i % 4 === 0; else if (isSnare) active = i % 8 === 4; else if (isHats) active = Math.random() < 0.6; else if (isMelodic) { active = Math.random() < 0.2; notes = [`${sN[Math.floor(Math.random() * sN.length)]}${tr.id === 'synth-1' ? '1' : '3'}`]; } else active = Math.random() < 0.15; return { ...s, active, notes }; }) }; })); };
  const randomizeTrack = (tId: string) => { pushH(tracks); const sN = getScaleNotes(rootNote, scaleType); setTracks(prev => prev.map(tr => { if (tr.id !== tId) return tr; const isKick = tr.id === 'drum-1'; const isSnare = tr.id === 'drum-2'; const isHats = tr.id === 'drum-3'; const isMelodic = tr.type === 'synth'; return { ...tr, stepSpeed: 1, steps: tr.steps.map((s, i) => { let active = false; let notes = tr.type === 'drum' ? (isKick ? ['C1'] : ['C3']) : [`${sN[0]}2`]; if (isKick) active = i % 4 === 0; else if (isSnare) active = i % 8 === 4; else if (isHats) active = Math.random() < 0.6; else if (isMelodic) { active = Math.random() < 0.25; notes = [`${sN[Math.floor(Math.random() * sN.length)]}${tr.id === 'synth-1' ? '1' : '3'}`]; } else active = Math.random() < 0.2; return { ...s, active, notes }; }) }; })); };

  const clearTrack = (tId: string) => {
    pushH(tracks);
    setTracks(prev => prev.map(t => t.id === tId ? { ...t, steps: t.steps.map(s => ({ ...s, active: false, notes: [] })) } : t));
  };

  const MiniKeyboard = () => { 
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; 
    const hasBlack = ['C', 'D', 'F', 'G', 'A']; 
    const octaves = [keyboardOctave - 1, keyboardOctave, keyboardOctave + 1]; 
    return ( 
      <div className="flex items-center gap-2 ml-4">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => setKeyboardOctave(Math.min(7, keyboardOctave + 1))} className="w-5 h-4 flex items-center justify-center rounded bg-neutral-800 border border-neutral-700 hover:text-white text-neutral-500 text-[10px] font-bold">+</button>
          <button onClick={() => setKeyboardOctave(Math.max(0, keyboardOctave - 1))} className="w-5 h-4 flex items-center justify-center rounded bg-neutral-800 border border-neutral-700 hover:text-white text-neutral-500 text-[10px] font-bold">-</button>
        </div>
        <div className="flex bg-black/80 p-1 rounded-lg border border-neutral-800 w-[420px] h-10 select-none overflow-hidden"> 
          {octaves.map(oct => ( 
            <div key={oct} className="flex-1 flex relative h-full gap-[1px] border-r border-neutral-800/50 last:border-r-0"> 
              {whiteNotes.map((name) => { 
                const fn = `${name}${oct}`; 
                const bn = `${name}#${oct}`; 
                const isS = editingStep && tracks.find(t => t.id === editingStep.trackId)?.steps[editingStep.index].notes.includes(fn); 
                const isBS = editingStep && tracks.find(t => t.id === editingStep.trackId)?.steps[editingStep.index].notes.includes(bn); 
                return ( 
                  <div key={fn} className="flex-1 relative h-full"> 
                    <button onMouseDown={() => { triggerTrack(activeTrack, noteToFreq(fn)); if(editingStep) handleNoteInput(editingStep.trackId, editingStep.index, fn); }} className={`w-full h-full bg-neutral-800 rounded-sm transition-all active:bg-neutral-600 flex items-end justify-center pb-0.5 ${isS ? 'bg-blue-500' : ''}`}><span className="text-[5px] font-bold text-neutral-500 pointer-events-none">{name}</span></button> 
                    {hasBlack.includes(name) && <button onMouseDown={(e) => { e.stopPropagation(); triggerTrack(activeTrack, noteToFreq(bn)); if(editingStep) handleNoteInput(editingStep.trackId, editingStep.index, bn); }} className={`absolute top-0 right-0 translate-x-1/2 w-[70%] h-[60%] bg-black z-10 rounded-b-[1px] active:bg-neutral-800 flex items-end justify-center pb-0.5 ${isBS ? 'bg-blue-400' : ''}`}><span className="text-[4px] font-bold text-neutral-400 pointer-events-none">#</span></button>} 
                  </div> 
                ); 
              })} 
            </div> 
          ))} 
        </div> 
      </div>
    ); 
  };
  const SamplerView = () => ( <div className="flex-1 flex gap-6 p-4 overflow-hidden"> <div className="flex-1 flex flex-col gap-3"> <div className="flex-1 bg-black/40 rounded-xl border border-neutral-800 p-3 flex flex-col relative min-h-[140px] shadow-inner"> {!samplerBuffer && <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 pointer-events-none animate-pulse"><Mic size={20} className="mb-3 opacity-40" /><span className="text-[9px] uppercase tracking-[0.3em] font-bold">Drop Audio Clip</span></div>} <canvas ref={waveformCanvasRef} width={800} height={120} className="w-full h-full rounded-lg" /> <div className="absolute inset-y-0 bg-blue-500/20 pointer-events-none border-x border-blue-500" style={{ left: `${sampleParams.start * 100}%`, width: `${(sampleParams.end - sampleParams.start) * 100}%` }} /> </div> <div className="flex items-center gap-4 bg-black/30 p-2 rounded-lg border border-neutral-800"> <Knob label="Start" value={sampleParams.start * 100} onChange={(v) => setSampleParams({...sampleParams, start: v/100})} min={0} max={100} color="orange" /> <Knob label="End" value={sampleParams.end * 100} onChange={(v) => setSampleParams({...sampleParams, end: v/100})} min={0} max={100} color="orange" /> <Knob label="Pitch" value={sampleParams.pitch} onChange={(v) => setSampleParams({...sampleParams, pitch: v})} min={0.5} max={2.0} color="blue" /> <Knob label="Slices" value={sampleParams.slices} onChange={(v) => setSampleParams({...sampleParams, slices: Math.round(v)})} min={1} max={16} color="purple" /> <div className="h-10 w-[1px] bg-neutral-800 mx-2" /> <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-[10px] uppercase font-bold hover:bg-blue-500 transition-all">Auto-Slice</button> <button className="px-4 py-1.5 bg-neutral-800 text-neutral-400 rounded text-[10px] uppercase font-bold hover:text-white transition-all">Chop All</button> </div> </div> <div className="w-64 flex flex-col gap-4"> <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-xl border border-neutral-800"> <span className="text-[7px] font-bold text-orange-400 uppercase tracking-widest">Envelope & Filter</span> <div className="grid grid-cols-2 gap-4"> <Knob label="Atk" value={sampleParams.attack * 100} onChange={(v) => setSampleParams({...sampleParams, attack: v/100})} min={0} max={100} color="blue" /> <Knob label="Dcy" value={sampleParams.decay * 100} onChange={(v) => setSampleParams({...sampleParams, decay: v/100})} min={1} max={100} color="blue" /> <Knob label="Sus" value={sampleParams.sustain * 100} onChange={(v) => setSampleParams({...sampleParams, sustain: v/100})} min={0} max={100} color="blue" /> <Knob label="Rel" value={sampleParams.release * 100} onChange={(v) => setSampleParams({...sampleParams, release: v/100})} min={1} max={100} color="blue" /> </div> <Knob label="Filter" value={sampleParams.filterCutoff} onChange={(v) => setSampleParams({...sampleParams, filterCutoff: v})} min={20} max={20000} color="blue" /> </div> </div> </div> );

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 font-sans selection:bg-orange-500/30">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-black/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-6"><img src="https://storage.googleapis.com/producer-app-public/producer/94263ece-7b6c-448f-9844-4402eff56712" alt="Sequinox" className="h-6 w-auto" /></div>
        <div className="ml-auto"><span className="text-[10px] font-mono text-green-500 tracking-[0.2em] font-bold">A Raja Sandhu Project v3.4.6</span></div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <section className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-900 border-b border-neutral-800">
            <div className="flex gap-4 items-center">
              <button className="text-[9px] font-normal text-orange-500 uppercase tracking-widest border-b-2 border-orange-500 pb-0.5">Sequencer</button>
              <MiniKeyboard />
              <div className="flex flex-col items-center ml-2"><span className="text-[5px] text-neutral-500 uppercase">Key</span><div className="flex gap-1"><select value={rootNote} onChange={e => setRootNote(e.target.value)} className="bg-transparent border border-neutral-800 rounded px-1 text-[9px] font-mono outline-none text-blue-400 h-6 uppercase">{ROOT_NOTES.map(n => <option key={n} value={n} className="bg-black">{n}</option>)}</select><select value={scaleType} onChange={e => setScaleType(e.target.value as any)} className="bg-transparent border border-neutral-800 rounded px-1 text-[9px] font-mono outline-none text-blue-400 h-6 uppercase">{Object.keys(SCALE_TYPES).map(t => <option key={t} value={t} className="bg-black">{t}</option>)}</select></div></div>
            </div>
            <div className="flex items-center gap-3"><span className="text-[8px] text-neutral-600 uppercase">Zoom</span><input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-16 accent-orange-500 h-1" /></div>
          </div>
          <div className="flex-1 overflow-auto bg-black scrollbar-hide" ref={scrollContainerRef}>
            <div className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-800 flex items-center h-12 shadow-inner">
              <div className="flex items-center gap-2 px-4 h-full border-r border-neutral-800 shrink-0" style={{ width: `${SIDEBAR_WIDTH}px` }}>
                <button onClick={() => setShowPatternLibrary(!showPatternLibrary)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-orange-500"><FolderOpen size={14} /></button>
                <button onClick={() => setShowSaveModal(true)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-blue-500"><Save size={14} /></button>
                <button onClick={() => setIsRecording(!isRecording)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-transparent text-neutral-500 hover:text-neutral-300'}`}><CircleDot size={12} fill={isRecording ? "currentColor" : "none"} /></button>
                <button onClick={toggleMasterPlay} className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isPlaying ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'}`}>{isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}</button>
                <button onClick={undo} disabled={history.length === 0} className="p-1.5 rounded-full text-neutral-500 hover:text-white disabled:opacity-30"><Undo2 size={14} /></button>
                <button onClick={randomizeAll} className="p-1.5 rounded-full text-neutral-500 hover:text-orange-500 transition-colors"><Dices size={14} /></button>
                <div className="h-6 w-[1px] bg-neutral-800 mx-1" />
                <div className="flex flex-col items-center"><span className="text-[5px] text-neutral-500 uppercase">BPM</span><div className="flex items-center gap-1"><button onClick={() => setBpm(b => b - 1)} className="text-[10px] text-neutral-500 hover:text-white">-</button><input type="number" value={bpm} onChange={e => setBpm(parseInt(e.target.value))} className="bg-transparent text-[10px] font-mono text-orange-400 w-7 outline-none text-center" /><button onClick={() => setBpm(b => b + 1)} className="text-[10px] text-neutral-500 hover:text-white">+</button></div></div>
                <div className="flex flex-col items-center"><span className="text-[5px] text-neutral-500 uppercase">Steps</span><select value={numSteps} onChange={(e) => updateNumSteps(parseInt(e.target.value))} className="bg-transparent border-none text-[10px] font-mono outline-none text-neutral-300 h-4">{[4, 8, 12, 16, 32, 64, 128, 256].map(s => <option key={s} value={s} className="bg-black">{s}</option>)}</select></div>
              </div>
              <div className="flex-1 h-full flex items-end pb-1 overflow-hidden">
                <div className="flex items-start gap-[1px]">{Array.from({length: numSteps}).map((_, i) => (<div key={i} className="flex flex-col items-center relative shrink-0" style={{ width: `${22 * zoom}px` }}><span className={`text-[9px] font-mono font-bold mb-1 ${((i + 1) % 4 === 1) ? 'text-white' : 'text-neutral-600'}`}>{i + 1}</span><div className={`w-[1px] h-2 ${i % 4 === 0 ? 'bg-neutral-500' : 'bg-neutral-800'} ${currentStep === i && (isPlaying || tracks.some(t => t.isPlayingLane)) ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : ''}`} /></div>))}</div>
              </div>
            </div>
            <div className="min-w-max p-2 py-4 flex flex-col gap-1 relative">
              {tracks.map(track => {
                const IconComp = TRACK_ICONS[track.id] || Music;
                return (
                    <div className={`flex items-start gap-1 px-1 group relative transition-all rounded-md py-1 ${activeTrack === track.id ? 'bg-white/5' : ''}`} key={track.id} onClick={() => setActiveTrack(track.id)}>
                    <div className="flex items-start gap-1 shrink-0" style={{ width: `${SIDEBAR_WIDTH - 8}px` }}>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); setActiveTrack(track.id); triggerTrack(track.id); }} className="w-11 h-11 flex items-center justify-center bg-black border border-neutral-800 rounded-md shrink-0 shadow-lg hover:border-orange-500/50 transition-all"><IconComp size={18} className={activeTrack === track.id ? 'text-orange-500' : 'text-neutral-500'} /></button>
                        <div className="relative h-4 w-11 flex items-center bg-black/60 border border-neutral-800 rounded px-0.5 overflow-hidden"><span className="text-[5px] font-bold uppercase text-neutral-400 truncate">{track.activePreset.slice(0,6)}</span><select value={track.activePreset} onClick={(e) => e.stopPropagation()} onChange={(e) => applyPreset(track.id, e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">{Object.keys(PRESETS[track.id] || {}).map(p => (<option key={p} value={p}>{p}</option>))}</select></div>
                      </div>
                      <div className={`w-44 h-[60px] flex flex-col bg-black border px-2 py-1 rounded-md shrink-0 transition-all ${activeTrack === track.id ? 'border-orange-500' : 'border-neutral-800'}`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[8px] font-bold uppercase text-white truncate w-20">{track.name}</span>
                          <div className="flex gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); setTracks(tracks.map(t => t.id === track.id ? {...t, fxSend: !t.fxSend} : t)) }} className={`px-1 h-3 flex items-center rounded text-[6px] font-black border transition-all ${track.fxSend ? 'bg-blue-500 border-blue-500 text-white' : 'border-neutral-800 text-neutral-600'}`}>FX</button>
                            <button onClick={(e) => { e.stopPropagation(); setTracks(tracks.map(t => t.id === track.id ? {...t, muted: !t.muted} : t)) }} className={`px-1 h-3 flex items-center rounded text-[6px] font-black border transition-all ${track.muted ? 'bg-red-500 border-red-500 text-white' : 'border-neutral-800 text-neutral-600'}`}>M</button>
                            <button onClick={(e) => { e.stopPropagation(); setTracks(tracks.map(t => t.id === track.id ? {...t, soloed: !t.soloed} : t)) }} className={`px-1 h-3 flex items-center rounded text-[6px] font-black border transition-all ${track.soloed ? 'bg-orange-500 border-orange-500 text-black' : 'border-neutral-800 text-neutral-600'}`}>S</button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-auto">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between px-0.5">
                              <span className="text-[5px] text-neutral-500 uppercase font-black">Volume</span>
                              <span className="text-[5px] font-mono text-neutral-400">{Math.round(track.volume * 100)}%</span>
                            </div>
                            <div className="flex-1 relative h-2 bg-neutral-950 border border-neutral-900 rounded-sm flex items-center px-0.5">
                              <div className="absolute inset-y-[1px] left-[1px] rounded-sm" style={{ width: `calc(${track.volume * 100}% - 2px)`, backgroundColor: track.color, opacity: 0.3 }} />
                              <div className="absolute top-1/2 -translate-y-1/2 w-1 h-1.5 bg-white rounded-sm shadow-[0_0_3px_white] z-10" style={{ left: `calc(${track.volume * 100}% - 2px)` }} />
                              <input type="range" min="0" max="1" step="0.01" value={track.volume} onClick={(e) => e.stopPropagation()} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? {...t, volume: parseFloat(e.target.value)} : t))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between px-0.5">
                              <span className="text-[5px] text-neutral-500 uppercase font-black">Probability</span>
                              <span className="text-[5px] font-mono text-orange-500/80">{Math.round(track.probability * 100)}%</span>
                            </div>
                            <div className="flex-1 relative h-2 bg-neutral-950 border border-neutral-900 rounded-sm flex items-center px-0.5">
                              <div className="absolute inset-y-[1px] left-[1px] rounded-sm bg-orange-500/20" style={{ width: `calc(${track.probability * 100}% - 2px)` }} />
                              <div className="absolute top-1/2 -translate-y-1/2 w-1 h-1.5 bg-orange-500 rounded-sm z-10" style={{ left: `calc(${track.probability * 100}% - 2px)` }} />
                              <input type="range" min="0" max="1" step="0.01" value={track.probability} onClick={(e) => e.stopPropagation()} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? {...t, probability: parseFloat(e.target.value)} : t))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[2px] shrink-0">
                        <div className="flex gap-[2px]">
                          <button onClick={(e) => { e.stopPropagation(); nudgeTrack(track.id, -1); }} className="w-5 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded text-neutral-500 hover:text-white transition-all"><ChevronLeft size={10} /></button>
                          <button onClick={(e) => { e.stopPropagation(); shiftTrackOctave(track.id, 1); }} className="w-5 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded text-neutral-500 hover:text-white transition-all"><ArrowBigUp size={10} /></button>
                          <button onClick={(e) => { e.stopPropagation(); randomizeTrack(track.id); }} className="w-10 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded text-neutral-500 hover:text-orange-500 transition-colors"><Dices size={10} /></button>
                        </div>
                        <div className="flex gap-[2px]">
                          <button onClick={(e) => { e.stopPropagation(); nudgeTrack(track.id, 1); }} className="w-5 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded text-neutral-500 hover:text-white transition-all"><ChevronRight size={10} /></button>
                          <button onClick={(e) => { e.stopPropagation(); shiftTrackOctave(track.id, -1); }} className="w-5 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded text-neutral-500 hover:text-white transition-all"><ArrowBigDown size={10} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setTracks(prev => prev.map(t => t.id === track.id ? {...t, stepSpeed: t.stepSpeed === 1 ? 2 : t.stepSpeed === 2 ? 4 : t.stepSpeed === 4 ? 0.5 : 1} : t)) }} className="w-10 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded text-[6px] text-neutral-600 leading-none">{track.stepSpeed === 1 ? '1/16' : track.stepSpeed === 2 ? '1/8' : track.stepSpeed === 4 ? '1/4' : '1/32'}</button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); clearTrack(track.id); }} className="w-21 h-[13px] flex items-center justify-center bg-black border border-neutral-800 rounded hover:text-red-500 transition-all text-neutral-600"><Trash2 size={9} /></button>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0"><button onClick={(e) => { e.stopPropagation(); setTracks(tracks.map(t => t.id === track.id ? {...t, isPlayingLane: !t.isPlayingLane} : t)) }} className={`w-11 h-[60px] flex items-center justify-center border rounded transition-all bg-transparent border-neutral-800`}>{track.isPlayingLane ? <Square size={12} fill="#ff4b2b" className="text-[#ff4b2b]" /> : <Play size={12} fill="#22c55e" className="text-[#22c55e]" />}</button></div>
                    </div>
                    <div className="flex items-start gap-[1px] relative">{track.steps.slice(0, numSteps).map((step, i) => { const isSelected = editingStep?.trackId === track.id && editingStep?.index === i; return (<div key={i} onClick={(e) => { e.stopPropagation(); toggleStep(track.id, i); }} className={`rounded-[1px] cursor-pointer h-11 transition-all relative ${step.active ? '' : i % 4 === 0 ? 'bg-neutral-800/80 hover:bg-neutral-700' : 'bg-neutral-900/60 hover:bg-neutral-800'} ${currentStep === i && (isPlaying || track.isPlayingLane) ? 'after:content-[""] after:absolute after:inset-0 after:bg-orange-500/20 after:pointer-events-none' : ''} ${isSelected ? 'ring-2 ring-blue-500 shadow-[0_0_10px_#3b82f6] z-10' : ''}`} style={{ width: `${22 * zoom}px`, backgroundColor: step.active ? track.color : undefined, opacity: track.muted ? 0.3 : 1 }}>{currentStep === i && (isPlaying || track.isPlayingLane) && <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-orange-500/60 blur-[1px] z-50 pointer-events-none" />}</div>); })}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-[420px] border-t border-neutral-800 bg-neutral-900/95 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-4 mb-6 shrink-0"><div className="flex flex-col"><span className="text-[8px] font-normal text-orange-500 uppercase tracking-widest">Editing Track</span><h2 className="text-base font-normal uppercase leading-none tracking-tight">{tracks.find(t => t.id === activeTrack)?.name}</h2></div><div className="flex bg-black/40 border border-neutral-800 rounded-lg p-0.5 ml-8"><button onClick={() => setActiveTab('engine')} className={`px-6 py-1 text-[10px] rounded-md transition-all ${activeTab === 'engine' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}>Engine</button><button onClick={() => setActiveTab('sampler')} className={`px-6 py-1 text-[10px] rounded-md transition-all ${activeTab === 'sampler' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}>Sampler</button></div></div>
            <div className="flex-1 flex gap-12 items-start justify-start">{activeTab === 'engine' ? (<SynthEngineUI activeTrack={activeTrack} tracks={tracks} updateParam={updateParam} setTracks={setTracks} />) : <SamplerView />}<div className="flex flex-col gap-4 border-l border-neutral-800 pl-10 shrink-0"><div className="flex flex-col gap-1"><span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Stereo Multi-Engine Architecture</span><div className="flex items-center gap-3"><span className="text-[7px] font-bold text-purple-400 uppercase tracking-[0.2em]">Effects Rack</span><button onClick={() => setTracks(prev => prev.map(t => t.id === activeTrack ? {...t, fxSend: !t.fxSend} : t))} className={`px-2 py-0.5 rounded border text-[6px] uppercase transition-all ${tracks.find(t => t.id === activeTrack)?.fxSend ? 'bg-blue-500 text-white border-blue-500' : 'bg-black border-neutral-800 text-neutral-500'}`}>Send Active</button></div></div><div className="flex flex-col gap-2"><div className="flex items-center bg-black/30 px-2 py-1 rounded border border-purple-500/20 h-11 w-[450px] gap-4"><button onClick={() => setMasterDelay(d => ({...d, enabled: !d.enabled}))} className={`w-12 py-0.5 rounded border text-[5px] uppercase shrink-0 ${masterDelay.enabled ? 'bg-purple-500 text-black border-purple-500' : 'bg-black border-neutral-800 text-neutral-500'}`}>Delay</button><select value={masterDelay.type} onChange={e => setMasterDelay({...masterDelay, type: e.target.value})} className="bg-transparent text-[5px] uppercase outline-none text-purple-400 w-14 bg-black rounded border border-neutral-800">{['Stereo', 'PingPong', 'Analog', 'Tape'].map(t => <option key={t} value={t} className="bg-black">{t}</option>)}</select><div className="flex gap-4 items-center flex-1 justify-between"><Knob label="Mix" value={masterDelay.mix} onChange={(v) => setMasterDelay({...masterDelay, mix: v})} min={0} max={100} color="purple" size="mini" /><Knob label="Time" value={masterDelay.time * 1000} onChange={(v) => setMasterDelay({...masterDelay, time: v/1000})} min={10} max={1000} color="purple" size="mini" /><Knob label="Feed" value={masterDelay.feedback * 100} onChange={(v) => setMasterDelay({...masterDelay, feedback: v/100})} min={0} max={100} color="purple" size="mini" /></div></div><div className="flex items-center bg-black/30 px-2 py-1 rounded border border-orange-500/20 h-11 w-[450px] gap-4"><button onClick={() => setMasterReverb(r => ({...r, enabled: !r.enabled}))} className={`w-12 py-0.5 rounded border text-[5px] uppercase shrink-0 ${masterReverb.enabled ? 'bg-orange-500 text-black border-orange-500' : 'bg-black border-neutral-800 text-neutral-500'}`}>Reverb</button><select value={masterReverb.type} onChange={e => setMasterReverb({...masterReverb, type: e.target.value})} className="bg-transparent text-[5px] uppercase outline-none text-orange-400 w-14 bg-black rounded border border-neutral-800">{['Room', 'Hall', 'Stadium', 'Plate'].map(t => <option key={t} value={t} className="bg-black">{t}</option>)}</select><div className="flex gap-4 items-center flex-1 justify-between"><Knob label="Mix" value={masterReverb.mix} onChange={(v) => setMasterReverb({...masterReverb, mix: v})} min={0} max={100} color="orange" size="mini" /><Knob label="Size" value={masterReverb.roomSize * 100} onChange={(v) => setMasterReverb({...masterReverb, roomSize: v/100})} min={0} max={100} color="orange" size="mini" /><Knob label="Damp" value={masterReverb.dampening / 100} onChange={(v) => setMasterReverb({...masterReverb, dampening: v*100})} min={1} max={100} color="orange" size="mini" /></div></div><div className="flex items-center bg-black/30 px-2 py-1 rounded border border-green-500/20 h-11 w-[450px] gap-4"><button onClick={() => setMasterComp(c => ({...c, enabled: !c.enabled}))} className={`w-12 py-0.5 rounded border text-[5px] uppercase shrink-0 ${masterComp.enabled ? 'bg-green-500 text-black border-green-500' : 'bg-black border-neutral-800 text-neutral-600'}`}>Limiter</button><select value={masterComp.type} onChange={e => setMasterComp({...masterComp, type: e.target.value})} className="bg-transparent text-[5px] uppercase outline-none text-green-400 w-14 bg-black rounded border border-neutral-800">{['Soft', 'Hard', 'Vintage', 'Peak'].map(t => <option key={t} value={t} className="bg-black">{t}</option>)}</select><div className="flex gap-4 items-center flex-1 justify-between"><Knob label="Thresh" value={masterComp.threshold} onChange={(v) => setMasterComp({...masterComp, threshold: v})} min={-60} max={0} color="blue" size="mini" /><Knob label="Ratio" value={masterComp.ratio} onChange={(v) => setMasterComp({...masterComp, ratio: v})} min={1} max={20} color="blue" size="mini" /><Knob label="Att" value={masterComp.attack * 1000} onChange={(v) => setMasterComp({...masterComp, attack: v/1000})} min={0.1} max={100} color="blue" size="mini" /></div></div></div></div></div></div></section></main>
      {showSaveModal && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div className="bg-neutral-900 border border-blue-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4"><h3 className="text-blue-400 font-bold uppercase tracking-widest text-sm">Save Pattern</h3><input type="text" value={songName} onChange={e => setSongName(e.target.value)} placeholder="Pattern name..." className="bg-black border border-neutral-800 rounded-lg p-3 text-white outline-none focus:border-blue-500" autoFocus /><div className="flex gap-2 justify-end"><button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-[10px] uppercase font-bold text-neutral-500 hover:text-white">Cancel</button><button onClick={() => saveSong(songName)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[10px] uppercase font-bold hover:bg-blue-500">Save</button></div></div></div>)}
      {showPatternLibrary && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div className="bg-neutral-900 border border-orange-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col gap-4 max-h-[80vh]"><div className="flex items-center justify-between"><h3 className="text-orange-400 font-bold uppercase tracking-widest text-sm">Pattern Library</h3><button onClick={() => setShowPatternLibrary(false)} className="text-neutral-500 hover:text-white"><Square size={16} /></button></div><div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">{savedSongs.length === 0 ? (<div className="py-10 text-center text-neutral-600 italic text-[10px] uppercase tracking-widest">No patterns</div>) : (savedSongs.map(song => (<div key={song.id} className="flex items-center justify-between p-3 bg-black/40 border border-neutral-800 rounded-xl hover:border-orange-500/50 transition-all group"><div className="flex flex-col"><span className="text-white font-bold">{song.name}</span><span className="text-[8px] text-neutral-500 uppercase tracking-tighter">{song.bpm} BPM • {song.numSteps} STEPS</span></div><button onClick={() => loadSong(song.id)} className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-[10px] uppercase font-bold hover:bg-orange-600 hover:text-white transition-all">Load</button></div>)))}</div></div></div>)}
      <footer className="px-6 py-1 border-t border-neutral-800 flex items-center justify-between bg-neutral-950 text-[8px] uppercase text-neutral-600 font-mono"><span>MIDI: ACTIVE SYNC: INTERNAL</span><span className="text-green-900/60">A Raja Sandhu Project v3.4.6</span></footer>
    </div>
  );
}
