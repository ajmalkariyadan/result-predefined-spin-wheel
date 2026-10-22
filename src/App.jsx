import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dices, Plus, Trash2, RotateCcw, Sparkles, Volume2, VolumeX,
  Settings2, Trophy, LockKeyhole, ArrowLeft, ListOrdered,
  Users, Eye, EyeOff, ShieldCheck, Download, Undo2,
  Palette, Maximize2, Save, Copy
} from "lucide-react";
import "./styles.css";

const DEFAULT_NAMES = ["Alex", "Sam", "Jordan", "Taylor", "Riley"];
const THEMES = {
  Classic: ["#FF6B6B", "#FFB84D", "#FFE66D", "#6BCB77", "#4D96FF", "#9B72CF", "#F472B6", "#4DD4C8"],
  Ocean: ["#003F5C", "#2F4B7C", "#665191", "#A05195", "#D45087", "#F95D6A", "#FF7C43", "#FFA600"],
  Sunset: ["#7B2FF7", "#F107A3", "#FF6A00", "#FFB000", "#FF4D6D", "#C9184A", "#7209B7", "#F72585"],
  Forest: ["#386641", "#6A994E", "#A7C957", "#F2E8CF", "#BC4749", "#588157", "#3A5A40", "#DDA15E"]
};
const DURATION = { Slow: 5000, Dramatic: 12000, Standard: 8000 };

function randomIndex(max) {
  if (max <= 1) return 0;
  if (globalThis.crypto?.getRandomValues) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buffer = new Uint32Array(1);
    do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
    return buffer[0] % max;
  }
  return Math.floor(Math.random() * max);
}
function polar(cx, cy, radius, angleDeg) {
  const angle = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}
function pickByWeight(entries) {
  const total = entries.reduce((s, e) => s + Math.max(1, Number(e.weight) || 1), 0);
  let n = Math.random() * total;
  for (let i = 0; i < entries.length; i++) {
    n -= Math.max(1, Number(entries[i].weight) || 1);
    if (n < 0) return i;
  }
  return entries.length - 1;
}
function Wheel({ entries, rotation, spinning, theme, sizeMode, textScale, duration, centerLabel }) {
  const size = 520, center = 260, radius = 248;
  const colors = THEMES[theme] || THEMES.Classic;
  const total = entries.reduce((s, e) => s + Math.max(1, Number(e.weight) || 1), 0) || 1;
  let acc = 0;
  const segments = entries.map((entry, index) => {
    const slice = Math.max(1, Number(entry.weight) || 1) / total * 360;
    const startAngle = acc; acc += slice;
    const endAngle = acc;
    const start = polar(center, center, radius, startAngle);
    const end = polar(center, center, radius, endAngle);
    const largeArc = slice > 180 ? 1 : 0;
    const path = entries.length === 1
      ? `M ${center} ${center} m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`
      : `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    const mid = startAngle + slice / 2;
    const label = polar(center, center, radius * (entries.length > 12 ? .69 : .64), mid);
    return { ...entry, index, path, label, mid };
  });
  return <div className={`wheel-shell ${sizeMode} ${spinning ? "is-spinning" : ""}`}>
    <div className="pointer" aria-hidden="true"><span /></div>
    <svg className="wheel-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Wheel with ${entries.length} entries`}
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "50% 50%", transition: spinning ? `transform ${duration}ms cubic-bezier(0.12,0.72,0.12,1)` : "none" }}>
      <circle cx={center} cy={center} r={radius + 7} fill="#fff" opacity=".96" />
      {segments.map((s) => <g key={s.id}>
        <path d={s.path} fill={colors[s.index % colors.length]} stroke="#fff" strokeWidth="3" />
        {entries.length <= 32 && <text x={s.label.x} y={s.label.y} fill="#202033"
          fontSize={Math.max(8, Math.min(28, (150 / Math.max(s.name.length, 7)) * textScale))}
          fontWeight="800" textAnchor="middle" dominantBaseline="middle"
          transform={`rotate(${s.mid} ${s.label.x} ${s.label.y})`}>
          {s.name.length > 19 ? `${s.name.slice(0, 17)}…` : s.name}
        </text>}
      </g>)}
      <circle cx={center} cy={center} r="35" fill="#fff" stroke="#22243a" strokeWidth="6" />
      <text x={center} y={center + 4} fill="#202033" fontSize={centerLabel.length > 5 ? "8" : "10"} fontWeight="900" textAnchor="middle" dominantBaseline="middle">{centerLabel || "SPIN"}</text>
    </svg>
  </div>;
}
function AdminLogin({ onLogin, onBack }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  return <main className="app admin-app"><header className="topbar"><div className="brand"><span className="brand-mark"><Dices size={21}/></span>spin<span className="brand-light">studio</span></div><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> Back to wheel</button></header>
    <section className="login-wrap"><div className="login-emblem"><LockKeyhole size={27}/></div><span className="section-kicker">PRIVATE AREA</span><h1>Welcome back,<br/><span>spin master.</span></h1><p className="login-copy">Sign in to configure scheduled outcomes.</p>
      <form className="login-card" onSubmit={e => {e.preventDefault(); if(password === "spinadmin") onLogin(); else setError("Incorrect password.");}}>
        <label>Admin password</label><div className="password-field"><input type={show ? "text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
        {error && <p className="notice">{error}</p>}<button className="spin-button" type="submit"><LockKeyhole size={16}/> OPEN ADMIN CONSOLE</button><p className="demo-password">Demo password: <code>spinadmin</code></p>
      </form><p className="login-foot"><ShieldCheck size={14}/> Demo-only client-side login</p>
    </section></main>;
}
function AdminConsole({ names, schedule, setSchedule, spinCount, setSpinCount, removeWinner, setRemoveWinner, onBack, onReset }) {
  const [number, setNumber] = useState("3"), [name, setName] = useState(names[0] || ""), [message, setMessage] = useState("");
  useEffect(()=>{ if(!names.includes(name)) setName(names[0] || ""); },[names,name]);
  const sorted = Object.entries(schedule).sort((a,b)=>Number(a[0])-Number(b[0]));
  return <main className="app admin-app"><header className="topbar"><div className="brand"><span className="brand-mark"><Dices size={21}/></span>spin<span className="brand-light">studio</span></div><button className="back-button" onClick={onBack}><ArrowLeft size={16}/> Back to wheel</button></header>
    <section className="admin-hero"><div className="eyebrow"><Settings2 size={14}/> WHEEL CONFIGURATION</div><h1>Your wheel.<br/><span>Your rules.</span></h1><p className="hero-copy">Manage scheduled outcomes and session behavior.</p></section>
    <section className="admin-grid"><div className="control-card admin-main-card"><div className="card-heading"><div><span className="section-kicker">WINNING ORDER</span><h2>Schedule a result</h2></div><ListOrdered/></div>
      <form className="schedule-form" onSubmit={e=>{e.preventDefault(); if(Number(number)>0 && name){setSchedule(s=>({...s,[Number(number)]:name}));setMessage(`Spin ${number} configured.`);}}}>
        <div className="field-group"><label>Spin number</label><input type="number" min="1" value={number} onChange={e=>setNumber(e.target.value)}/></div>
        <div className="field-group"><label>Name for this spin</label><select value={name} onChange={e=>setName(e.target.value)}>{names.map(n=><option key={n} value={n}>{n}</option>)}</select></div><button className="spin-button" type="submit" disabled={!names.length}><Plus size={16}/> SAVE SPIN</button>
      </form>{message&&<p className="notice">{message}</p>}<div className="schedule-list">{sorted.map(([n,v])=><div className="schedule-row" key={n}><span>#{n}</span><strong>{v}</strong><button className="remove-name" onClick={()=>setSchedule(s=>{const c={...s};delete c[n];return c;})}><Trash2 size={15}/></button></div>)}</div><button className="reset-button" onClick={()=>setSchedule({})}>Clear all scheduled outcomes</button>
    </div><div className="admin-right control-card"><h2>Session settings</h2><p>Current spin: #{spinCount}</p><button className="reset-button" onClick={()=>setSpinCount(0)}><RotateCcw size={15}/> Reset spin counter</button><label className="toggle-row"><span><strong>Remove winner after spin</strong><small>Prevent repeat winners</small></span><input type="checkbox" checked={removeWinner} onChange={e=>setRemoveWinner(e.target.checked)}/></label><button className="reset-button" onClick={onReset}>Reset wheel and history</button></div></section></main>;
}
export default function App() {
  const [entries,setEntries] = useState(()=>DEFAULT_NAMES.map((name,i)=>({id:`e${i}`,name,weight:1})));
  const [draft,setDraft] = useState(""), [bulk,setBulk] = useState(""), [showBulk,setShowBulk] = useState(false);
  const [rotation,setRotation] = useState(0), [spinning,setSpinning] = useState(false), [winner,setWinner] = useState("");
  const [history,setHistory] = useState([]), [soundOn,setSoundOn] = useState(true), [removeWinner,setRemoveWinner] = useState(false);
  const [weightedMode,setWeightedMode] = useState(false), [allowDuplicates,setAllowDuplicates] = useState(false);
  const [multiCount,setMultiCount] = useState(1), [durationName,setDurationName] = useState("Standard");
  const [theme,setTheme] = useState("Classic"), [sizeMode,setSizeMode] = useState("standard"), [textScale,setTextScale] = useState(1);
  const [centerLabel,setCenterLabel] = useState("SPIN");
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const multiRemainingRef = useRef(0);
  const multiResultsRef = useRef([]);
  const sessionBaseSpinRef = useRef(0);
  const runStepRef = useRef(null);
  const [showSettings,setShowSettings] = useState(true), [showAdminMenu,setShowAdminMenu] = useState(false), [page,setPage] = useState("main");
  const [schedule,setSchedule] = useState({}), [spinCount,setSpinCount] = useState(0), [presets,setPresets] = useState(()=>{try{return JSON.parse(localStorage.getItem("spinStudioPresets")||"[]")}catch{return []}});
  const [presetName,setPresetName] = useState("My wheel"), [notice,setNotice] = useState(""), [presentation,setPresentation] = useState(false);
  const timer = useRef(null), idRef = useRef(10), undoRef = useRef([]);
  const duration = DURATION[durationName] || 8000;
  const names = entries.map(e=>e.name);
  const snapshot = () => ({entries:structuredClone(entries),history:structuredClone(history),spinCount,schedule:{...schedule},winner,rotation});
  const saveUndo = () => { undoRef.current = [...undoRef.current.slice(-19), snapshot()]; };
  const undo = () => { if(spinning || !undoRef.current.length)return; const s=undoRef.current.pop(); setEntries(s.entries);setHistory(s.history);setSpinCount(s.spinCount);setSchedule(s.schedule);setWinner(s.winner);setRotation(s.rotation);setNotice("Last action undone."); };
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useEffect(()=>{localStorage.setItem("spinStudioPresets",JSON.stringify(presets));},[presets]);
  const addOne = (name) => {const n=name.trim(); if(!n)return false; if(!allowDuplicates && entries.some(e=>e.name.toLowerCase()===n.toLowerCase())){setNotice(`“${n}” is already on the wheel.`);return false;} saveUndo();setEntries(old=>[...old,{id:`e${idRef.current++}`,name:n,weight:1}]);setNotice("");return true;};
  const addName = e => {e.preventDefault();if(addOne(draft))setDraft("");};
  const addBulk = () => {const lines=bulk.split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean);let added=0;lines.forEach(n=>{if(allowDuplicates || !entries.some(e=>e.name.toLowerCase()===n.toLowerCase())){setEntries(old=>[...old,{id:`e${idRef.current++}`,name:n,weight:1}]);added++;}});setBulk("");setShowBulk(false);setNotice(`${added} name${added===1?"":"s"} added.`);};
  const removeEntry = id => {if(spinning)return;saveUndo();const found=entries.find(e=>e.id===id);setEntries(old=>old.filter(e=>e.id!==id));if(found)setSchedule(old=>Object.fromEntries(Object.entries(old).filter(([,n])=>n!==found.name)));};
  const reset = () => {if(spinning)return;saveUndo();clearTimeout(timer.current);setEntries(DEFAULT_NAMES.map((name,i)=>({id:`e${i}`,name,weight:1})));setHistory([]);setWinner("");setRotation(0);setSpinCount(0);setSchedule({});setNotice("Wheel reset to sample names.");};
  const clearNames = () => {if(spinning)return;saveUndo();setEntries([]);setWinner("");setSchedule({});};
  const runSpinStep = () => {
    const current = [...entriesRef.current];
    if (current.length < 1) {
      multiRemainingRef.current = 0;
      setSpinning(false);
      setWinner(multiResultsRef.current.join(", "));
      return;
    }
    const number = sessionBaseSpinRef.current + multiResultsRef.current.length + 1;
    const scheduledName = schedule[number];
    let targetIndex;
    if (scheduledName && current.some(e => e.name === scheduledName)) {
      targetIndex = current.findIndex(e => e.name === scheduledName);
    } else {
      targetIndex = weightedMode ? pickByWeight(current) : randomIndex(current.length);
    }
    const target = current[targetIndex];
    const weights = current.map(e => weightedMode ? Math.max(1, Number(e.weight) || 1) : 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;
    const beforeWeight = weights.slice(0, targetIndex).reduce((sum, w) => sum + w, 0);
    const slice = weights[targetIndex];
    const targetAngle = 360 - ((beforeWeight / totalWeight * 360) + (slice / totalWeight * 180));
    const currentMod = ((rotation % 360) + 360) % 360;
    const correction = ((targetAngle - currentMod) + 360) % 360;
    const nextRotation = rotation + (5 + randomIndex(3)) * 360 + correction;
    setWinner("");
    setSpinning(true);
    setRotation(nextRotation);

    if (soundOn) {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (Audio) {
          const ctx = new Audio(), osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(620, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration / 1000);
          gain.gain.setValueAtTime(.045, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration / 1000);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(); osc.stop(ctx.currentTime + duration / 1000);
          osc.onended = () => ctx.close();
        }
      } catch {}
    }

    timer.current = setTimeout(() => {
      multiResultsRef.current.push(target.name);
      const completedNumber = number;
      setSpinCount(completedNumber);
      setHistory(items => [{
        number: completedNumber, winners: [target.name], name: target.name,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        scheduled: Boolean(scheduledName && target.name === scheduledName)
      }, ...items].slice(0, 100));

      // Keep the result private until the whole multi-winner sequence is complete.
      const left = multiRemainingRef.current - 1;
      multiRemainingRef.current = left;
      if (removeWinner) {
        entriesRef.current = entriesRef.current.filter(e => e.id !== target.id);
        setEntries(entriesRef.current);
      }
      if (left > 0 && entriesRef.current.length > 0) {
        setTimeout(() => {
          setRotation(r => r);
          runStepRef.current?.();
        }, 450);
      } else {
        setSpinning(false);
        setWinner(multiResultsRef.current.join(", "));
        playWinnerSound();
      }
    }, duration);
  };
  runStepRef.current = runSpinStep;

  const playWinnerSound = () => {
    if (!soundOn) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      const ctx = new Audio();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * .13);
        gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + i * .13 + .025);
        gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + i * .13 + .25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * .13);
        osc.stop(ctx.currentTime + i * .13 + .27);
      });
      setTimeout(() => ctx.close(), 1000);
    } catch {}
  };

  const spin = () => {
    if (spinning || entriesRef.current.length < 2) return;
    saveUndo();
    multiResultsRef.current = [];
    sessionBaseSpinRef.current = spinCount;
    multiRemainingRef.current = Math.min(multiCount, entriesRef.current.length);
    runStepRef.current?.();
  };
  const exportPoster = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
    bg.addColorStop(0, "#11121d"); bg.addColorStop(1, "#24162d");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = "#bba4ff"; ctx.font = "bold 26px Arial"; ctx.textAlign = "center";
    ctx.fillText("SPIN STUDIO", 540, 85);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 54px Arial"; ctx.fillText("The wheel has spoken", 540, 155);
    const wheelCanvas = document.createElement("canvas"); wheelCanvas.width = 600; wheelCanvas.height = 600;
    const wc = wheelCanvas.getContext("2d"); const cx = 300, cy = 300, r = 278;
    const colors = THEMES[theme] || THEMES.Classic;
    const total = entries.reduce((sum,e)=>sum+(weightedMode?Math.max(1,Number(e.weight)||1):1),0)||1;
    let angle = -Math.PI/2;
    entries.forEach((entry,i)=>{
      const weight = weightedMode ? Math.max(1,Number(entry.weight)||1) : 1;
      const arc = weight/total*Math.PI*2;
      wc.beginPath(); wc.moveTo(cx,cy); wc.arc(cx,cy,r,angle,angle+arc); wc.closePath();
      wc.fillStyle=colors[i%colors.length];wc.fill();wc.strokeStyle="#fff";wc.lineWidth=3;wc.stroke();
      wc.save();wc.translate(cx,cy);wc.rotate(angle+arc/2);wc.fillStyle="#202033";wc.font="bold 17px Arial";wc.textAlign="right";wc.fillText(entry.name.slice(0,22),r-20,6);wc.restore();
      angle+=arc;
    });
    wc.beginPath();wc.arc(cx,cy,38,0,Math.PI*2);wc.fillStyle="#fff";wc.fill();wc.fillStyle="#202033";wc.font="bold 12px Arial";wc.textAlign="center";wc.fillText(centerLabel||"SPIN",cx,cy+4);
    ctx.drawImage(wheelCanvas,240,210,600,600);
    ctx.fillStyle="#a78bfa";ctx.font="bold 24px Arial";ctx.fillText("WINNER" + (multiResultsRef.current.length>1?"S":""),540,885);
    ctx.fillStyle="#ffffff";ctx.font="bold 48px Arial";
    const result = winner || "Spin to choose a winner";
    const words = result.length>28 ? result.match(/.{1,28}(?:\\s|$)/g)||[result] : [result];
    words.slice(0,3).forEach((line,i)=>ctx.fillText(line.trim(),540,950+i*58));
    ctx.fillStyle="#b9b6ca";ctx.font="20px Arial";ctx.fillText("Made with love by Ajmal",540,1210);
    ctx.fillText("linkedin.com/in/ajmalkariyadan",540,1250);
    canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="spin-studio-result-poster.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},"image/png");
  };
  const savePreset = () => {const p={id:Date.now(),name:presetName.trim()||`Wheel ${presets.length+1}`,entries,theme,sizeMode,textScale,centerLabel,weightedMode,allowDuplicates};setPresets(old=>[...old.filter(x=>x.name!==p.name),p]);setNotice(`Saved “${p.name}”.`);};
  const loadPreset = id => {const p=presets.find(x=>x.id===Number(id));if(!p)return;saveUndo();setEntries(p.entries);setTheme(p.theme);setSizeMode(p.sizeMode);setTextScale(p.textScale);setCenterLabel(p.centerLabel);setWeightedMode(p.weightedMode);setAllowDuplicates(p.allowDuplicates);setNotice(`Loaded “${p.name}”.`);};
  const downloadBlob = (content,name,type) => {const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);};
  useEffect(()=>{
    const onKey=e=>{const tag=document.activeElement?.tagName;if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT")return;if(e.code==="Space"){e.preventDefault();spin();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();undo();}if(e.key==="Escape"){setPresentation(false);setShowBulk(false);}};
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  });
  if(page==="login")return <AdminLogin onLogin={()=>setPage("admin")} onBack={()=>setPage("main")}/>;
  if(page==="admin")return <AdminConsole names={names} schedule={schedule} setSchedule={setSchedule} spinCount={spinCount} setSpinCount={setSpinCount} removeWinner={removeWinner} setRemoveWinner={setRemoveWinner} onBack={()=>setPage("main")} onReset={reset}/>;
  return <main className={`app ${presentation?"presentation":""}`}>
    <header className="topbar"><div className="brand"><span className="brand-mark"><Dices size={21}/></span>spin<span className="brand-light">studio</span></div>
      <div className="top-actions"><span className="live-pill"><span/> READY TO SPIN</span><button className="icon-button" onClick={()=>setSoundOn(v=>!v)} title="Toggle sound">{soundOn?<Volume2 size={18}/>:<VolumeX size={18}/>}</button><button className="icon-button" onClick={()=>setPresentation(v=>!v)} title="Presentation mode"><Maximize2 size={18}/></button><div className="admin-menu-wrap"><button className="icon-button" onClick={()=>setShowAdminMenu(v=>!v)} title="Menu"><Settings2 size={18}/></button>{showAdminMenu&&<div className="admin-dropdown">
        <button onClick={()=>{setShowAdminMenu(false);setPage("login");}}><LockKeyhole size={16}/> Admin login</button>
        <button className="menu-toggle-row" role="switch" aria-checked={showSettings} onClick={()=>setShowSettings(v=>!v)}>
          <span className="menu-toggle-label"><Settings2 size={16}/> Toggle settings</span>
          <span className={`mini-switch ${showSettings ? "is-on" : ""}`} aria-hidden="true"><span /></span>
          <span className="toggle-state">{showSettings ? "ON" : "OFF"}</span>
        </button>
        <button onClick={()=>{setShowAdminMenu(false);undo();}}><Undo2 size={16}/> Undo last action</button>
      </div>}</div></div>
    </header>
    <section className="hero"><div className="eyebrow"><Sparkles size={14}/> THE DECISION-MAKER</div><h1>Let the wheel<br/><span>make the call.</span></h1><p className="hero-copy">Add your names. Take a breath. Give it a spin.</p></section>
    <section className="workspace">
      <section className="wheel-panel"><div className="panel-topline"><div><span className="section-kicker">YOUR WHEEL</span><h2>The big spin</h2></div><span className="count-pill">{entries.length} entries</span></div>
        <div className="wheel-stage">{entries.length?<Wheel entries={entries} rotation={rotation} spinning={spinning} theme={theme} sizeMode={sizeMode} textScale={textScale} duration={duration} centerLabel={centerLabel}/>:<div className="empty-wheel"><Dices size={46}/><strong>Your wheel is empty</strong><span>Add at least two entries.</span></div>}</div>
        <div className="spin-controls"><button className="spin-button" onClick={spin} disabled={spinning||entries.length<2}><Dices size={20}/>{spinning?"SPINNING...":"SPIN THE WHEEL"} <span className="button-arrow">↗</span></button><p className="spin-hint">{entries.length<2?"Add at least 2 entries to spin":spinning?"Hold tight…":`Spin #${spinCount+1} · ${duration/1000}s spin`}</p></div>
        {winner&&<div className="winner-card"><div className="winner-icon"><Trophy size={23}/></div><div className="winner-text"><span>THE WHEEL HAS SPOKEN</span><strong>{winner}</strong></div><button className="winner-again" onClick={spin} disabled={spinning||entries.length<2}><RotateCcw size={18}/></button><div className="confetti confetti-a"/><div className="confetti confetti-b"/><div className="confetti confetti-c"/></div>}
        {!presentation&&<div className="toolbar"><button onClick={undo} disabled={!undoRef.current.length||spinning}><Undo2 size={15}/> Undo</button><button onClick={exportPoster}><Download size={15}/> Download result poster</button></div>}
      </section>
      {!presentation&&<aside className="side-panel">
        <section className="control-card"><div className="card-heading"><div><span className="section-kicker">SET IT UP</span><h2>Who's in the mix?</h2></div><span className="heading-icon"><Users size={18}/></span></div>
          <form className="add-form" onSubmit={addName}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Enter a name..." maxLength={40} disabled={spinning}/><button type="submit" disabled={spinning||!draft.trim()}><Plus size={21}/></button></form>
          <div className="toolbar"><button onClick={()=>setShowBulk(v=>!v)}><ListOrdered size={15}/> Bulk add</button><button onClick={()=>setAllowDuplicates(v=>!v)} className={allowDuplicates?"active-chip":""}><Copy size={15}/> Duplicates {allowDuplicates?"on":"off"}</button></div>
          {showBulk&&<div className="bulk-box"><textarea value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={"Paste one name per line\nAlex\nSam\nJordan"}/><button className="spin-button" onClick={addBulk} disabled={!bulk.trim()}>Add names</button></div>}
          {notice&&<p className="notice">{notice}</p>}
          <div className="name-list">{entries.map((entry,index)=><div className="name-row" key={entry.id}><span className="name-color" style={{background:(THEMES[theme]||THEMES.Classic)[index%(THEMES[theme]||THEMES.Classic).length]}}/><span className="name-index">{String(index+1).padStart(2,"0")}</span><span className="name-label">{entry.name}</span>{weightedMode&&<div className="weight-control"><input className="weight-input" aria-label={`Weight for ${entry.name}`} type="number" min="1" max="100" value={entry.weight} onChange={e=>setEntries(old=>old.map(x=>x.id===entry.id?{...x,weight:Number(e.target.value)}:x))}/><small>{(Math.max(1,Number(entry.weight)||1)/entries.reduce((sum,x)=>sum+Math.max(1,Number(x.weight)||1),0)*100).toFixed(1)}%</small></div>}<button className="remove-name" onClick={()=>removeEntry(entry.id)} disabled={spinning}><Trash2 size={15}/></button></div>)}</div>
          <div className="list-footer"><span>{entries.length} total entries</span><button onClick={clearNames} disabled={spinning||!entries.length}>Clear all</button></div>
        </section>
        {showSettings&&<section className="control-card"><div className="card-heading"><div><span className="section-kicker">CUSTOMIZE</span><h2>Wheel settings</h2></div><Palette size={19}/></div>
          <label className="setting-line"><span>Spin duration</span><select value={durationName} onChange={e=>setDurationName(e.target.value)}><option value="Slow">Slow · 5 seconds</option><option value="Standard">Standard · 8 seconds</option><option value="Dramatic">Dramatic · 12 seconds</option></select></label>
          <label className="setting-line"><span>Color theme</span><select value={theme} onChange={e=>setTheme(e.target.value)}>{Object.keys(THEMES).map(t=><option key={t}>{t}</option>)}</select></label>
          <label className="setting-line"><span>Wheel size</span><select value={sizeMode} onChange={e=>setSizeMode(e.target.value)}><option value="compact">Compact</option><option value="standard">Standard</option><option value="large">Large</option></select></label>
          <label className="setting-line"><span>Text size</span><input type="range" min=".5" max="1.8" step=".1" value={textScale} onChange={e=>setTextScale(Number(e.target.value))}/></label>
          <label className="setting-line"><span>Center label</span><input value={centerLabel} maxLength="10" onChange={e=>setCenterLabel(e.target.value)}/></label>
          <label className="toggle-row"><span><strong>Weighted mode</strong><small>Entries can have different chances</small></span><input type="checkbox" checked={weightedMode} onChange={e=>setWeightedMode(e.target.checked)}/><i/></label>
          <label className="toggle-row"><span><strong>Remove winner after spin</strong><small>Prevent repeat winners</small></span><input type="checkbox" checked={removeWinner} onChange={e=>setRemoveWinner(e.target.checked)}/><i/></label>
          <label className="setting-line"><span>Number of winners</span><select value={multiCount} onChange={e=>setMultiCount(Number(e.target.value))}>{[1,2,3,4,5].filter(n=>n<=Math.max(1,entries.length)).map(n=><option key={n} value={n}>{n} winner{n>1?"s":""}</option>)}</select></label>
          <div className="preset-controls"><input value={presetName} onChange={e=>setPresetName(e.target.value)} placeholder="Preset name"/><button onClick={savePreset}><Save size={15}/> Save on this device</button><select defaultValue="" onChange={e=>loadPreset(e.target.value)}><option value="" disabled>Load saved wheel…</option>{presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><p className="save-help">Save stores this wheel's names and appearance in this browser only. It does not create a file or sync to another device.</p></div>
          {presets.length>0&&<div className="preset-list">{presets.map(p=><div key={p.id}><span>{p.name}</span><button onClick={()=>setPresets(old=>old.filter(x=>x.id!==p.id))}><Trash2 size={14}/></button></div>)}</div>}
          <button className="reset-button" onClick={reset} disabled={spinning}><RotateCcw size={15}/> Reset session</button>
        </section>}
        <section className="history-card"><div className="history-heading"><div><span className="section-kicker">RECENT RESULTS</span><h2>Spin history</h2></div><span className="history-count">{history.length}</span></div>{history.length?<div className="history-list">{history.map(h=><div className="history-row" key={`${h.number}-${h.time}`}><span className="history-number">#{h.number}</span><strong>{h.name}</strong><time>{h.time}</time></div>)}</div>:<div className="history-empty"><RotateCcw size={18}/> Your spins will appear here.</div>}</section>
      </aside>}
    </section>
    <footer className="footer"><span>© {new Date().getFullYear()} SPIN STUDIO</span><span>Made with love by Ajmal ♥</span><a href="https://www.linkedin.com/in/ajmalkariyadan" target="_blank" rel="noreferrer">Contact developer ↗</a><button onClick={reset}>Start fresh <RotateCcw size={13}/></button></footer>
  </main>;
}
