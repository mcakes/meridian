import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";

const themes = {
  dark: {
    bg: { base: "#1a1b26", surface: "#24283b", overlay: "#414868", muted: "#292e42", highlight: "#2f344d" },
    text: { primary: "#c0caf5", secondary: "#a9b1d6", muted: "#565f89", inverse: "#1a1b26" },
    border: { subtle: "#292e42", default: "#3b4261", active: "#565f89" },
    semantic: { positive: "#9ece6a", negative: "#f7768e", neutral: "#a9b1d6", warning: "#e0af68", info: "#7aa2f7", accent: "#bb9af7" },
    cat: ["#7aa2f7","#9ece6a","#e06c75","#41c5b0","#ff9e64","#d6a0e8","#80d8e8","#b8608e"],
  },
  light: {
    bg: { base: "#f0f0f3", surface: "#f8f8fb", overlay: "#d8d8de", muted: "#e8e8ed", highlight: "#e0e0e6" },
    text: { primary: "#1a1b26", secondary: "#4a4b5c", muted: "#8b8c9a", inverse: "#f0f0f3" },
    border: { subtle: "#d8d8de", default: "#c0c0c8", active: "#9a9aa8" },
    semantic: { positive: "#1e7a1e", negative: "#c93545", neutral: "#6a6b7a", warning: "#8f6200", info: "#2e5cb8", accent: "#7c4dab" },
    cat: ["#4a76c9","#4d7a1f","#c4525c","#32a18a","#c97a3e","#9e6fb8","#4a9fad","#9e4a75"],
  },
};
const radius = { none: 0, sm: 2, md: 4, lg: 6 };
const ThemeContext = createContext("dark");
function useTheme() { return themes[useContext(ThemeContext)]; }
const CAT_NAMES = ["blue","green","red","teal","orange","purple","cyan","pink"];
const ff = "'Inter', system-ui, sans-serif";
const fm = "'JetBrains Mono', 'Fira Code', monospace";
const fmt = (n, d=2) => n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtPct = (n) => (n>=0?"+":"")+fmt(n)+"%";
const fmtK = (n) => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(n);

function SectionHeader({title,subtitle}){const t=useTheme();return(<div style={{marginBottom:10}}><h2 style={{fontSize:16,fontWeight:600,color:t.text.primary,margin:0,fontFamily:ff}}>{title}</h2>{subtitle&&<p style={{fontSize:12,color:t.text.muted,margin:"4px 0 0",lineHeight:1.5,fontFamily:ff}}>{subtitle}</p>}</div>);}
function CatDot({index,size=8}){const t=useTheme();return <span style={{width:size,height:size,borderRadius:2,background:t.cat[index%t.cat.length],display:"inline-block",flexShrink:0}}/>;}
function PriceChange({value}){const t=useTheme();const c=value>0?t.semantic.positive:value<0?t.semantic.negative:t.semantic.neutral;const a=value>0?"▲":value<0?"▼":"";return <span style={{color:c,fontVariantNumeric:"tabular-nums",fontFamily:fm}}><span style={{fontSize:"0.7em",marginRight:3}}>{a}</span>{fmtPct(value)}</span>;}
function FlashCell({value,decimals=2}){const t=useTheme();const[flash,setFlash]=useState(null);const prev=useRef(value);useEffect(()=>{if(prev.current!==value){setFlash(value>prev.current?"up":"down");prev.current=value;const x=setTimeout(()=>setFlash(null),300);return()=>clearTimeout(x);}},[value]);const bg=flash==="up"?t.semantic.positive+"25":flash==="down"?t.semantic.negative+"25":"transparent";return <span style={{fontVariantNumeric:"tabular-nums",fontFamily:fm,background:bg,transition:"background 0.3s",padding:"1px 4px",borderRadius:radius.sm}}>{fmt(value,decimals)}</span>;}
function MetricCard({label,value,color}){const t=useTheme();return(<div style={{background:t.bg.surface,borderRadius:radius.md,padding:"8px 12px",border:`1px solid ${t.border.subtle}`}}><div style={{fontSize:11,color:t.text.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px",fontFamily:ff}}>{label}</div><div style={{fontSize:22,fontWeight:600,color:color||t.text.primary,fontVariantNumeric:"tabular-nums",fontFamily:fm}}>{value}</div></div>);}
function Tag({pass,warn,children}){const t=useTheme();const bg=pass?t.semantic.positive+"20":warn?t.semantic.warning+"20":t.semantic.negative+"20";const c=pass?t.semantic.positive:warn?t.semantic.warning:t.semantic.negative;return <span style={{fontSize:10,padding:"2px 6px",borderRadius:radius.sm,fontWeight:600,background:bg,color:c,fontFamily:ff}}>{children}</span>;}
function ThemeToggle({mode,setMode}){const t=useTheme();const[h,setH]=useState(false);return (<button onClick={()=>setMode(mode==="dark"?"light":"dark")} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?t.bg.muted:t.bg.overlay,border:`1px solid ${t.border.default}`,borderRadius:radius.sm,padding:"3px 8px",cursor:"pointer",fontSize:11,fontFamily:fm,color:t.text.secondary,display:"flex",alignItems:"center",gap:6,transition:"background 0.08s ease"}}><span style={{fontSize:13}}>{mode==="dark"?"☽":"☀"}</span>{mode}</button>);}

function NavBar({active,setActive,mode,setMode}){const t=useTheme();const tabs=["watchlist","pricer","chart","components","interactions","analysis","tokens"];return(<div style={{display:"flex",alignItems:"center",gap:2,padding:"4px 12px",background:t.bg.surface,borderBottom:`1px solid ${t.border.subtle}`}}><span style={{fontWeight:700,fontSize:14,color:t.semantic.info,marginRight:16,letterSpacing:"-0.5px",fontFamily:ff}}>MERIDIAN</span><span style={{fontSize:10,color:t.text.muted,marginRight:16,marginTop:1}}>v0.7</span>{tabs.map(s=>(<button key={s} onClick={()=>setActive(s)} style={{background:active===s?t.bg.overlay:"transparent",color:active===s?t.text.primary:t.text.secondary,border:"none",padding:"4px 10px",borderRadius:radius.sm,fontSize:12,cursor:"pointer",fontWeight:active===s?600:400,fontFamily:ff,textTransform:"capitalize",transition:"background 0.1s ease"}} onMouseEnter={e=>{if(active!==s)e.currentTarget.style.background=t.bg.muted}} onMouseLeave={e=>{if(active!==s)e.currentTarget.style.background="transparent"}}>{s}</button>))}<div style={{flex:1}}/><ThemeToggle mode={mode} setMode={setMode}/></div>);}


const watchlistData=[{sym:"AAPL",name:"Apple Inc",group:"Technology",gi:0,price:227.48,change:1.23,vol:48293100,bid:227.45,ask:227.51,dp:2},{sym:"MSFT",name:"Microsoft Corp",group:"Technology",gi:0,price:441.06,change:-0.45,vol:22106800,bid:441.02,ask:441.10,dp:2},{sym:"GOOGL",name:"Alphabet Inc",group:"Technology",gi:0,price:178.22,change:0.67,vol:19823400,bid:178.18,ask:178.26,dp:2},{sym:"NVDA",name:"NVIDIA Corp",group:"Semiconductors",gi:1,price:134.70,change:3.82,vol:312458900,bid:134.68,ask:134.72,dp:2},{sym:"AMD",name:"AMD Inc",group:"Semiconductors",gi:1,price:164.33,change:2.14,vol:54230100,bid:164.30,ask:164.36,dp:2},{sym:"AVGO",name:"Broadcom Inc",group:"Semiconductors",gi:1,price:224.85,change:1.09,vol:8823000,bid:224.80,ask:224.90,dp:2},{sym:"JNJ",name:"Johnson & Johnson",group:"Healthcare",gi:2,price:156.42,change:-0.18,vol:6234500,bid:156.38,ask:156.46,dp:2},{sym:"PFE",name:"Pfizer Inc",group:"Healthcare",gi:2,price:26.14,change:-1.45,vol:32140800,bid:26.12,ask:26.16,dp:2},{sym:"XOM",name:"Exxon Mobil",group:"Energy",gi:3,price:118.73,change:0.34,vol:14532100,bid:118.70,ask:118.76,dp:2},{sym:"CVX",name:"Chevron Corp",group:"Energy",gi:3,price:162.05,change:0.52,vol:7621300,bid:162.02,ask:162.08,dp:2},{sym:"EUR/USD",name:"Euro / Dollar",group:"G10 Majors",gi:4,price:1.0847,change:0.12,vol:0,bid:1.0846,ask:1.0848,dp:4},{sym:"GBP/USD",name:"Sterling / Dollar",group:"G10 Majors",gi:4,price:1.2634,change:-0.08,vol:0,bid:1.2633,ask:1.2635,dp:4},{sym:"USD/JPY",name:"Dollar / Yen",group:"G10 Majors",gi:4,price:150.32,change:0.22,vol:0,bid:150.30,ask:150.34,dp:2},{sym:"AUD/USD",name:"Aussie / Dollar",group:"Commodity FX",gi:5,price:0.6543,change:0.31,vol:0,bid:0.6542,ask:0.6544,dp:4},{sym:"USD/CAD",name:"Dollar / Loonie",group:"Commodity FX",gi:5,price:1.3621,change:-0.15,vol:0,bid:1.3620,ask:1.3622,dp:4}];

function WatchlistSection({instruments}){const t=useTheme();const groups=useMemo(()=>{const m=new Map();instruments.forEach(i=>{if(!m.has(i.group))m.set(i.group,[]);m.get(i.group).push(i);});return m;},[instruments]);const cols=[{key:"sym",label:"Symbol",w:90},{key:"name",label:"Name",w:170},{key:"price",label:"Last",w:100,align:"right"},{key:"change",label:"Chg %",w:80,align:"right"},{key:"bid",label:"Bid",w:90,align:"right"},{key:"ask",label:"Ask",w:90,align:"right"},{key:"vol",label:"Volume",w:80,align:"right"}];return(<div><SectionHeader title="Watchlist — color as group identity" subtitle="Core 6 ramp. Colors darken in light mode to maintain WCAG ≥3:1 contrast against white."/><div style={{overflow:"auto",maxHeight:520}}><table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}><thead><tr>{cols.map(c=>(<th key={c.key} style={{padding:"6px 8px",textAlign:c.align||"left",width:c.w,fontSize:11,fontWeight:500,color:t.text.muted,textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${t.border.subtle}`,background:t.bg.surface,position:"sticky",top:0,zIndex:2,fontFamily:ff}}>{c.label}</th>))}</tr></thead><tbody>{[...groups.entries()].map(([gN,items])=>{const gi=items[0].gi;const cc=t.cat[gi%t.cat.length];return[<tr key={`g-${gN}`}><td colSpan={cols.length} style={{padding:"8px 8px 4px",fontSize:11,fontWeight:600,color:cc,borderBottom:`1px solid ${t.border.subtle}`,background:t.bg.base,fontFamily:ff}}><span style={{display:"inline-flex",alignItems:"center",gap:6}}><CatDot index={gi}/>{gN}<span style={{fontWeight:400,color:t.text.muted,fontSize:10}}>({items.length})</span></span></td></tr>,...items.map((inst,i)=>{const rb=i%2?t.bg.muted+"60":"transparent";return(<tr key={inst.sym} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=t.bg.highlight} onMouseLeave={e=>e.currentTarget.style.background=rb}><td style={{padding:"5px 8px 5px 16px",fontWeight:600,fontSize:13,color:t.text.primary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`,background:rb,borderLeft:`2px solid ${cc}`}}>{inst.sym}</td><td style={{padding:"5px 8px",fontSize:12,color:t.text.secondary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`,background:rb}}>{inst.name}</td><td style={{padding:"5px 8px",textAlign:"right",fontFamily:fm,fontVariantNumeric:"tabular-nums",fontSize:13,color:t.text.primary,borderBottom:`1px solid ${t.border.subtle}`,background:rb}}><FlashCell value={inst.price} decimals={inst.dp}/></td><td style={{padding:"5px 8px",textAlign:"right",borderBottom:`1px solid ${t.border.subtle}`,background:rb}}><PriceChange value={inst.change}/></td><td style={{padding:"5px 8px",textAlign:"right",fontFamily:fm,fontVariantNumeric:"tabular-nums",fontSize:13,borderBottom:`1px solid ${t.border.subtle}`,background:rb}}>{fmt(inst.bid,inst.dp)}</td><td style={{padding:"5px 8px",textAlign:"right",fontFamily:fm,fontVariantNumeric:"tabular-nums",fontSize:13,borderBottom:`1px solid ${t.border.subtle}`,background:rb}}>{fmt(inst.ask,inst.dp)}</td><td style={{padding:"5px 8px",textAlign:"right",fontFamily:fm,fontVariantNumeric:"tabular-nums",fontSize:13,color:t.text.secondary,borderBottom:`1px solid ${t.border.subtle}`,background:rb}}>{inst.vol>0?fmtK(inst.vol):"—"}</td></tr>);})];})}</tbody></table></div></div>);}

const pricerGroups=[{name:"Market data",ci:0,fields:[{l:"Spot",v:227.48},{l:"Forward",v:228.12},{l:"Div yield",v:0.52,u:"%"}]},{name:"Volatility",ci:1,fields:[{l:"ATM IV",v:24.3,u:"%"},{l:"25Δ RR",v:-3.8,u:"%"},{l:"Term slope",v:1.2,u:"pts"}]},{name:"Rates",ci:2,fields:[{l:"Risk-free",v:5.25,u:"%"},{l:"Borrow",v:0.35,u:"%"}]},{name:"Outputs",ci:3,fields:[{l:"Theo",v:18.42},{l:"Delta",v:0.6234},{l:"Gamma",v:0.0187},{l:"Vega",v:0.3421},{l:"Theta",v:-0.0892}]}];

function PricerSection(){const t=useTheme();return(<div><SectionHeader title="Pricer — color as input/output category" subtitle="Same ramp, different meaning. Colors adapt per theme."/><div style={{fontSize:13,fontWeight:600,color:t.text.primary,marginBottom:12,fontFamily:ff}}>AAPL — Jun 2025 $230 Call</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>{pricerGroups.map(g=>{const cc=t.cat[g.ci%t.cat.length];return(<div key={g.name} style={{background:t.bg.surface,borderRadius:radius.md,overflow:"hidden",border:`1px solid ${t.border.subtle}`}}><div style={{padding:"6px 10px",display:"flex",alignItems:"center",gap:6,borderBottom:`1px solid ${t.border.subtle}`,background:cc+"15"}}><CatDot index={g.ci}/><span style={{fontSize:12,fontWeight:600,color:cc,fontFamily:ff}}>{g.name}</span></div><div style={{padding:"4px 0"}}>{g.fields.map(f=>(<div key={f.l} style={{display:"flex",justifyContent:"space-between",padding:"4px 10px",borderBottom:`1px solid ${t.border.subtle}`}}><span style={{fontSize:12,color:t.text.secondary,fontFamily:ff}}>{f.l}</span><span style={{fontSize:13,fontFamily:fm,fontVariantNumeric:"tabular-nums",color:f.v<0?t.semantic.negative:t.text.primary,fontWeight:g.ci===3?600:400}}>{fmt(f.v,Math.abs(f.v)<1?4:2)}{f.u?<span style={{fontSize:10,color:t.text.muted,marginLeft:2}}>{f.u}</span>:null}</span></div>))}</div></div>);})}</div></div>);}

function ChartSection(){const t=useTheme();const series=[{name:"AAPL",ci:0},{name:"MSFT",ci:1},{name:"NVDA",ci:2},{name:"GOOGL",ci:3}];const data=useMemo(()=>series.map((s,si)=>{const pts=[{x:0,y:100}];for(let i=1;i<60;i++)pts.push({x:i,y:pts[i-1].y*(1+[.0008,.0005,.0012,.0006][si]+(Math.random()-.5)*[.018,.015,.028,.016][si])});return{...s,pts};}),[]);const allY=data.flatMap(d=>d.pts.map(p=>p.y));const[minY,maxY]=[Math.min(...allY),Math.max(...allY)];const pad=(maxY-minY)*0.05;const rY=(maxY+pad)-(minY-pad);const yMin=minY-pad;const W=720,H=300,P={t:12,r:52,b:28,l:8};const pW=W-P.l-P.r,pH=H-P.t-P.b;const sx=x=>P.l+(x/59)*pW,sy=y=>P.t+pH-((y-yMin)/rY)*pH;
const[mouse,setMouse]=useState(null);const svgRef=useRef(null);
const handleMouse=(e)=>{if(!svgRef.current)return;const rect=svgRef.current.getBoundingClientRect();const mx=(e.clientX-rect.left)/rect.width*W;const my=(e.clientY-rect.top)/rect.height*H;if(mx>=P.l&&mx<=W-P.r&&my>=P.t&&my<=P.t+pH)setMouse({x:mx,y:my});else setMouse(null);};
const crossVal=mouse?{x:Math.round((mouse.x-P.l)/pW*59),y:yMin+((P.t+pH-mouse.y)/pH)*rY}:null;
// Y grid: 5 levels
const yTicks=[];for(let i=0;i<=5;i++){const v=yMin+(rY/5)*i;yTicks.push(v);}
// X grid: every 10 days
const xTicks=[0,10,20,30,40,50,59];
return(<div><SectionHeader title="Chart — Meridian chart styling" subtitle="Dotted gridlines, right-side Y axis, crosshair spikelines, 1.5px traces. Hover to see spikes."/>
<div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap"}}>{data.map(s=>(<span key={s.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.text.secondary,fontFamily:ff}}><span style={{width:14,height:2,borderRadius:1,background:t.cat[s.ci]}}/>{s.name}<span style={{fontFamily:fm,fontSize:10,color:t.text.muted}}>{fmt(s.pts[59].y)}</span></span>))}</div>
<div style={{background:t.bg.surface,borderRadius:radius.md,border:`1px solid ${t.border.subtle}`,overflow:"hidden"}}><svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",background:t.bg.base}} onMouseMove={handleMouse} onMouseLeave={()=>setMouse(null)}>
{/* Y gridlines — dotted, horizontal */}
{yTicks.map((v,i)=>(<g key={`yg${i}`}><line x1={P.l} y1={sy(v)} x2={W-P.r} y2={sy(v)} stroke={t.border.subtle} strokeWidth="1" strokeDasharray="2 3"/><text x={W-P.r+6} y={sy(v)+4} textAnchor="start" fill={t.text.muted} fontSize="10" fontFamily={fm}>{fmt(v,1)}</text></g>))}
{/* X gridlines — dotted, vertical */}
{xTicks.map(x=>(<g key={`xg${x}`}><line x1={sx(x)} y1={P.t} x2={sx(x)} y2={P.t+pH} stroke={t.border.subtle} strokeWidth="1" strokeDasharray="2 3"/><text x={sx(x)} y={H-6} textAnchor="middle" fill={t.text.muted} fontSize="10" fontFamily={ff}>D{x+1}</text></g>))}
{/* X axis line */}
<line x1={P.l} y1={P.t+pH} x2={W-P.r} y2={P.t+pH} stroke={t.border.default} strokeWidth="1"/>
{/* X ticks */}
{xTicks.map(x=><line key={`xt${x}`} x1={sx(x)} y1={P.t+pH} x2={sx(x)} y2={P.t+pH+3} stroke={t.border.default} strokeWidth="1"/>)}
{/* 100 baseline — dashed */}
<line x1={P.l} y1={sy(100)} x2={W-P.r} y2={sy(100)} stroke={t.text.muted} strokeWidth="0.5" strokeDasharray="4 3" opacity="0.5"/>
{/* Data traces — 1.5px */}
{data.map(s=><path key={s.name} d={s.pts.map((p,i)=>`${i?"L":"M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join("")} fill="none" stroke={t.cat[s.ci]} strokeWidth="1.5" strokeLinejoin="round"/>)}
{/* End dots */}
{data.map(s=><circle key={`d${s.name}`} cx={sx(59)} cy={sy(s.pts[59].y)} r="2.5" fill={t.cat[s.ci]}/>)}
{/* Crosshair spikelines */}
{mouse&&<>
<line x1={mouse.x} y1={P.t} x2={mouse.x} y2={P.t+pH} stroke={t.text.muted} strokeWidth="1" opacity="0.6"/>
<line x1={P.l} y1={mouse.y} x2={W-P.r} y2={mouse.y} stroke={t.text.muted} strokeWidth="1" opacity="0.6"/>
{/* X value label */}
<rect x={mouse.x-18} y={P.t+pH+2} width="36" height="16" rx="2" fill={t.bg.overlay}/>
<text x={mouse.x} y={P.t+pH+13} textAnchor="middle" fill={t.text.primary} fontSize="9" fontFamily={fm}>D{(crossVal?.x||0)+1}</text>
{/* Y value label */}
<rect x={W-P.r+2} y={mouse.y-8} width="46" height="16" rx="2" fill={t.bg.overlay}/>
<text x={W-P.r+5} y={mouse.y+4} textAnchor="start" fill={t.text.primary} fontSize="9" fontFamily={fm}>{fmt(crossVal?.y||0,1)}</text>
{/* Intersection dots on each series */}
{crossVal&&data.map(s=>{const idx=Math.max(0,Math.min(59,crossVal.x));return <circle key={`h${s.name}`} cx={sx(idx)} cy={sy(s.pts[idx].y)} r="3" fill={t.cat[s.ci]} stroke={t.bg.base} strokeWidth="1.5"/>;})}</>}
</svg></div>
<div style={{fontSize:10,color:t.text.muted,marginTop:6,fontFamily:ff}}>Dotted grid · right Y-axis · crosshair spikes · 1.5px traces · cursor-snap · bg.base plot area</div>
</div>);}


const ANALYSIS={core:{minDE:29.8,minPair:"blue–purple",minCVD:16.3,cvdPair:"red–orange",Lstdev:5.8},full:{minDE:26.0,minPair:"teal–cyan",minCVD:6.2,cvdPair:"green–pink",Lstdev:9.0},colors:[{name:"blue",L:67.0,C:47.6,H:282,bk:"blue"},{name:"green",L:77.6,C:55.0,H:126,bk:"green"},{name:"red",L:59.8,C:48.9,H:20,bk:"red"},{name:"teal",L:72.4,C:40.5,H:180,bk:"blue-green"},{name:"orange",L:74.0,C:54.6,H:56,bk:"orange"},{name:"purple",L:73.1,C:43.2,H:319,bk:"purple"},{name:"cyan",L:81.6,C:27.6,H:216,bk:"cyan"},{name:"pink",L:52.4,C:42.1,H:347,bk:"pink"}]};

function AnalysisSection(){const t=useTheme();const Row=({label,children})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.border.subtle}`}}><span style={{fontSize:12,color:t.text.secondary,fontFamily:ff}}>{label}</span><div style={{display:"flex",alignItems:"center",gap:8}}>{children}</div></div>);return(<div><SectionHeader title="CIELAB perceptual analysis" subtitle="Dark-theme ramp is reference. Light-theme darkens each color for WCAG ≥3:1 against white."/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}><div style={{background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`}}><div style={{fontSize:13,fontWeight:600,color:t.text.primary,marginBottom:12,fontFamily:ff}}>Core 6 — CVD-safe</div><Row label="Min pairwise ΔE"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.core.minDE}</span><Tag pass>≥ 20</Tag></Row><Row label="Closest pair"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.core.minPair}</span></Row><Row label="Min deutan ΔE"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.core.minCVD}</span><Tag pass>≥ 12</Tag></Row><Row label="CVD pair"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.core.cvdPair}</span></Row><Row label="L* stdev"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.core.Lstdev}</span><Tag pass>&lt; 8</Tag></Row><Row label="Berlin-Kay"><span style={{fontFamily:fm,fontSize:12}}>6/6</span><Tag pass>all</Tag></Row></div><div style={{background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`}}><div style={{fontSize:13,fontWeight:600,color:t.text.primary,marginBottom:12,fontFamily:ff}}>Full 8 — needs secondary encoding</div><Row label="Min pairwise ΔE"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.full.minDE}</span><Tag pass>≥ 20</Tag></Row><Row label="Closest pair"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.full.minPair}</span></Row><Row label="Min deutan ΔE"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.full.minCVD}</span><Tag>✗ &lt; 10</Tag></Row><Row label="CVD pair"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.full.cvdPair}</span></Row><Row label="L* stdev"><span style={{fontFamily:fm,fontSize:12}}>{ANALYSIS.full.Lstdev}</span><Tag warn>&gt; 8</Tag></Row><Row label="Berlin-Kay"><span style={{fontFamily:fm,fontSize:12}}>8/8</span><Tag pass>all</Tag></Row></div></div>

<div style={{background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`,marginBottom:20}}><div style={{fontSize:13,fontWeight:600,color:t.text.primary,marginBottom:12,fontFamily:ff}}>Ramp comparison: dark vs light</div><div style={{display:"flex",flexDirection:"column",gap:8}}><div><div style={{fontSize:11,color:t.text.muted,marginBottom:4,fontFamily:ff}}>Dark theme (reference)</div><div style={{display:"flex",gap:4,padding:"8px 12px",background:"#1a1b26",borderRadius:radius.sm}}>{themes.dark.cat.map((c,i)=>(<div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:24,borderRadius:radius.sm,background:c}}/><div style={{fontSize:9,color:"#565f89",marginTop:2,fontFamily:fm}}>{CAT_NAMES[i]}</div></div>))}</div></div><div><div style={{fontSize:11,color:t.text.muted,marginBottom:4,fontFamily:ff}}>Light theme (darkened for WCAG ≥3:1 vs surface)</div><div style={{display:"flex",gap:4,padding:"8px 12px",background:"#f8f8fb",borderRadius:radius.sm,border:"1px solid #d8d8de"}}>{themes.light.cat.map((c,i)=>(<div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:24,borderRadius:radius.sm,background:c}}/><div style={{fontSize:9,color:"#8b8c9a",marginTop:2,fontFamily:fm}}>{CAT_NAMES[i]}</div></div>))}</div></div></div><div style={{fontSize:11,color:t.text.muted,marginTop:8,fontFamily:ff,lineHeight:1.5}}>Same hue identity, shifted in lightness. Each light-theme color maintains the same hue angle at lower L* for contrast against white.</div></div>

<div style={{background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`}}><div style={{fontSize:13,fontWeight:600,color:t.text.primary,marginBottom:12,fontFamily:ff}}>LCH hue wheel (dark theme reference)</div><div style={{display:"flex",gap:24,alignItems:"center"}}><svg viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="80" fill="none" stroke={t.border.default} strokeWidth="0.5"/><circle cx="100" cy="100" r="40" fill="none" stroke={t.border.subtle} strokeWidth="0.5" strokeDasharray="2 2"/>{[0,90,180,270].map(a=>{const x=100+85*Math.cos((a-90)*Math.PI/180),y=100+85*Math.sin((a-90)*Math.PI/180);return <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={t.text.muted} fontSize="9" fontFamily={fm}>{a}°</text>;})}{ANALYSIS.colors.map((c,i)=>{const rad=(c.H-90)*Math.PI/180,dist=32+(c.C/55)*38;const x=100+dist*Math.cos(rad),y=100+dist*Math.sin(rad);return(<g key={c.name}><line x1="100" y1="100" x2={x} y2={y} stroke={themes.dark.cat[i]} strokeWidth="0.5" opacity="0.4"/><circle cx={x} cy={y} r={i<6?8:6} fill={themes.dark.cat[i]} stroke={i<6?"none":t.text.muted} strokeWidth={i<6?0:0.5} strokeDasharray={i<6?"none":"2 1"}/><text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={c.L>65?"#1a1b26":"#c0caf5"} fontSize="7" fontWeight="600" fontFamily={ff}>{i}</text></g>);})}</svg><div style={{flex:1}}>{ANALYSIS.colors.map((c,i)=>(<div key={c.name} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",fontSize:12,opacity:i>=6?0.7:1}}><span style={{width:12,height:12,borderRadius:radius.sm,background:t.cat[i],border:i>=6?`1px dashed ${t.text.muted}`:"none"}}/><span style={{fontFamily:fm,fontSize:11,width:16,color:t.text.muted}}>{i}</span><span style={{fontFamily:ff,color:t.text.secondary,width:56}}>{c.name}</span><span style={{fontFamily:fm,fontSize:10,color:t.text.muted}}>H={c.H}°</span>{i===6&&<span style={{fontSize:9,color:t.text.muted,fontFamily:ff,marginLeft:4}}>← ext</span>}</div>))}</div></div></div></div>);}

function TokensSection(){const t=useTheme();const mode=useContext(ThemeContext);return(<div><SectionHeader title="Token reference" subtitle={`Showing: ${mode} theme. Toggle in nav to compare.`}/>
<div style={{marginBottom:28}}><div style={{fontSize:12,fontWeight:600,color:t.text.secondary,marginBottom:8,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.5px"}}>Categorical ramp ({mode})</div><div style={{display:"flex",gap:6,marginBottom:8}}>{t.cat.map((c,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:64,height:36,borderRadius:radius.md,background:c,border:i>=6?`1.5px dashed ${t.text.muted}`:`1px solid ${t.border.default}`,position:"relative"}}><span style={{position:"absolute",bottom:1,right:3,fontSize:9,fontFamily:fm,fontWeight:600,color:mode==="light"?"#fff":"#1a1b26"}}>{i}</span></div><span style={{fontSize:10,color:t.text.secondary,fontFamily:ff}}>{CAT_NAMES[i]}</span><span style={{fontSize:9,color:t.text.muted,fontFamily:fm}}>{c}</span></div>))}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12,background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`}}>{[{ctx:"Watchlist",m:["Technology","Semis","Healthcare","Energy","G10 FX","Commodity FX"]},{ctx:"Pricer",m:["Mkt data","Vol inputs","Rates","Outputs"]},{ctx:"Chart",m:["Series 1","Series 2","Series 3","Series 4"]}].map(ex=>(<div key={ex.ctx}><div style={{fontSize:11,fontWeight:600,color:t.text.muted,marginBottom:6,fontFamily:ff}}>{ex.ctx}</div>{ex.m.map((m,mi)=>(<div key={m} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0"}}><CatDot index={mi} size={6}/><span style={{fontSize:11,color:t.text.secondary,fontFamily:ff}}>{m}</span></div>))}</div>))}</div></div>

<div style={{marginBottom:28}}><div style={{fontSize:12,fontWeight:600,color:t.text.secondary,marginBottom:8,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.5px"}}>Semantic colors ({mode})</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(t.semantic).map(([k,v])=>(<div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:64,height:36,borderRadius:radius.md,background:v,border:`1px solid ${t.border.default}`}}/><span style={{fontSize:11,color:t.text.secondary,fontFamily:ff}}>{k}</span><span style={{fontSize:9,color:t.text.muted,fontFamily:fm}}>{v}</span></div>))}</div></div>

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:28}}>{[{title:"Backgrounds",obj:t.bg},{title:"Text",obj:t.text}].map(sec=>(<div key={sec.title}><div style={{fontSize:12,fontWeight:600,color:t.text.secondary,marginBottom:8,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.5px"}}>{sec.title}</div>{Object.entries(sec.obj).map(([k,v])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}><div style={{width:32,height:20,borderRadius:radius.sm,background:v,border:`1px solid ${t.border.default}`}}/><span style={{fontSize:11,color:t.text.secondary,fontFamily:ff,width:60}}>{k}</span><span style={{fontSize:10,color:t.text.muted,fontFamily:fm}}>{v}</span></div>))}</div>))}</div>

<div style={{marginBottom:28}}><div style={{fontSize:12,fontWeight:600,color:t.text.secondary,marginBottom:8,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.5px"}}>Border radius</div><div style={{display:"flex",gap:16}}>{[{token:"none",val:0,use:"Panels, cells"},{token:"sm",val:2,use:"Buttons, badges"},{token:"md",val:4,use:"Dropdowns, cards"},{token:"lg",val:6,use:"Modals only"}].map(r=>(<div key={r.token} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:64,height:40,borderRadius:r.val,background:t.bg.surface,border:`1px solid ${t.border.default}`}}/><span style={{fontSize:11,color:t.text.secondary,fontFamily:ff}}>{r.token}</span><span style={{fontSize:10,color:t.text.muted,fontFamily:fm}}>{r.val}px</span></div>))}</div></div>

<div><div style={{fontSize:12,fontWeight:600,color:t.text.secondary,marginBottom:8,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.5px"}}>Typography</div>{[{p:"Panel title",f:"Inter",s:"16px",w:600,x:"Portfolio Overview"},{p:"Section header",f:"Inter",s:"14px",w:600,x:"Open Positions"},{p:"Column header",f:"Inter",s:"11px",w:500,x:"SYMBOL   QTY   AVG PRICE",tx:"uppercase"},{p:"Body / labels",f:"Inter",s:"13px",w:400,x:"Apple Inc — NASDAQ"},{p:"Numeric data",f:"JetBrains Mono",s:"13px",w:400,x:"1,234.56   -0.45%   $48.2M"},{p:"Caption",f:"Inter",s:"11px",w:400,x:"Last updated 14:32:05 EST"}].map((item,i)=>(<div key={item.p} style={{display:"grid",gridTemplateColumns:"120px 140px 1fr",gap:12,padding:"8px 0",borderBottom:i<5?`1px solid ${t.border.subtle}`:"none",alignItems:"baseline"}}><span style={{fontSize:11,color:t.text.muted,fontFamily:ff}}>{item.p}</span><span style={{fontSize:10,color:t.text.muted,fontFamily:fm}}>{item.f}/{item.s}/{item.w}</span><span style={{fontSize:item.s,fontWeight:item.w,color:t.text.primary,fontFamily:item.f==="JetBrains Mono"?fm:ff,fontVariantNumeric:item.f==="JetBrains Mono"?"tabular-nums":"normal",textTransform:item.tx||"none"}}>{item.x}</span></div>))}</div></div>);}

// ─── Fuzzy match utility ────────────────────────────────────────
function fuzzyMatch(text, query) {
  if (!query) return { match: true, score: 0, ranges: [] };
  const tl = text.toLowerCase(), ql = query.toLowerCase();
  // Exact substring match first
  const idx = tl.indexOf(ql);
  if (idx !== -1) return { match: true, score: 100 - idx, ranges: [[idx, idx + ql.length]] };
  // Fuzzy: sequential character match
  let qi = 0, ranges = [], start = -1;
  for (let ti = 0; ti < tl.length && qi < ql.length; ti++) {
    if (tl[ti] === ql[qi]) {
      if (start === -1) start = ti;
      qi++;
    } else if (start !== -1) {
      ranges.push([start, ti]);
      start = -1;
    }
  }
  if (qi < ql.length) return { match: false, score: 0, ranges: [] };
  if (start !== -1) ranges.push([start, start + 1]);
  return { match: true, score: 50 - ranges.length * 5, ranges };
}

function HighlightedText({ text, ranges, color }) {
  if (!ranges || ranges.length === 0) return <span>{text}</span>;
  const parts = [];
  let last = 0;
  for (const [s, e] of ranges) {
    if (s > last) parts.push(<span key={`t${last}`}>{text.slice(last, s)}</span>);
    parts.push(<span key={`h${s}`} style={{ color, fontWeight: 600 }}>{text.slice(s, e)}</span>);
    last = e;
  }
  if (last < text.length) parts.push(<span key={`t${last}`}>{text.slice(last)}</span>);
  return <span>{parts}</span>;
}

// ─── Autocomplete ───────────────────────────────────────────────
function Autocomplete({ label, placeholder, items, renderItem, onSelect, width = 280 }) {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.map(item => ({ item, match: { match: true, score: 0, ranges: [] } }));
    return items
      .map(item => ({ item, match: fuzzyMatch(typeof item === "string" ? item : item.label, query) }))
      .filter(r => r.match.match)
      .sort((a, b) => b.match.score - a.match.score);
  }, [query, items]);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && selectedIdx >= 0 && filtered[selectedIdx]) {
      e.preventDefault();
      const sel = filtered[selectedIdx].item;
      setQuery(typeof sel === "string" ? sel : sel.label);
      setOpen(false);
      onSelect && onSelect(sel);
    }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  useEffect(() => {
    if (listRef.current && selectedIdx >= 0) {
      const el = listRef.current.children[selectedIdx];
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

  return (
    <div style={{ position: "relative", width }}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: t.text.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: ff }}>{label}</div>}
      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); setSelectedIdx(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "6px 10px", fontSize: 13, fontFamily: ff,
          background: t.bg.surface, color: t.text.primary,
          border: `1px solid ${open ? t.semantic.info : t.border.default}`,
          borderRadius: radius.sm, outline: "none",
          boxShadow: open ? `0 0 0 2px ${t.semantic.info}30` : "none",
          transition: "border 0.1s, box-shadow 0.1s",
          boxSizing: "border-box",
        }}
      />
      {open && filtered.length > 0 && (
        <div ref={listRef} style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 2,
          background: t.bg.surface, border: `1px solid ${t.border.default}`,
          borderRadius: radius.md, maxHeight: 200, overflowY: "auto", zIndex: 50,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}>
          {filtered.map((r, i) => {
            const item = r.item;
            const isSelected = i === selectedIdx;
            const label = typeof item === "string" ? item : item.label;
            return (
              <div
                key={label}
                onMouseDown={() => { setQuery(label); setOpen(false); onSelect && onSelect(item); }}
                onMouseEnter={() => setSelectedIdx(i)}
                style={{
                  padding: "6px 10px", cursor: "pointer", fontSize: 13, fontFamily: ff,
                  background: isSelected ? t.bg.highlight : "transparent",
                  color: t.text.primary, transition: "background 0.05s",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${t.border.subtle}` : "none",
                }}
              >
                {renderItem ? renderItem(item, r.match, isSelected) : (
                  <HighlightedText text={label} ranges={r.match.ranges} color={t.semantic.info} />
                )}
              </div>
            );
          })}
        </div>
      )}
      {open && filtered.length === 0 && query.trim() && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 2,
          background: t.bg.surface, border: `1px solid ${t.border.default}`,
          borderRadius: radius.md, padding: "8px 10px", fontSize: 12,
          color: t.text.muted, fontFamily: ff, zIndex: 50,
        }}>No matches</div>
      )}
    </div>
  );
}

// ─── Date Picker ────────────────────────────────────────────────
function DatePicker({ label, value, onChange, width = 180 }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeSeg, setActiveSeg] = useState(0); // 0=year, 1=month, 2=day
  const [typing, setTyping] = useState("");
  const typingTimer = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Parse value or use today as default
  const parse = (v) => {
    if (!v) { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; }
    const p = v.split("-").map(Number);
    return [p[0] || 2025, p[1] || 1, p[2] || 1];
  };
  const [yr, mo, dy] = parse(value);

  const daysInMo = (y, m) => new Date(y, m, 0).getDate();

  const emit = (y, m, d) => {
    m = Math.max(1, Math.min(12, m));
    d = Math.max(1, Math.min(daysInMo(y, m), d));
    y = Math.max(1900, Math.min(2099, y));
    onChange(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  };

  const adjust = (seg, delta) => {
    let [y, m, d] = [yr, mo, dy];
    if (seg === 0) y += delta;
    else if (seg === 1) {
      m += delta;
      if (m > 12) { m = 1; y++; }
      else if (m < 1) { m = 12; y--; }
    } else {
      d += delta;
      const max = daysInMo(y, m);
      if (d > max) { d = 1; m++; if (m > 12) { m = 1; y++; } }
      else if (d < 1) { m--; if (m < 1) { m = 12; y--; } d = daysInMo(y, m); }
    }
    emit(y, m, d);
  };

  const handleType = (digit) => {
    const next = typing + digit;
    clearTimeout(typingTimer.current);
    const maxLen = activeSeg === 0 ? 4 : 2;
    if (next.length >= maxLen) {
      const num = parseInt(next, 10);
      let [y, m, d] = [yr, mo, dy];
      if (activeSeg === 0) y = num;
      else if (activeSeg === 1) m = num;
      else d = num;
      emit(y, m, d);
      setTyping("");
      // Auto-advance to next segment
      if (activeSeg < 2) setActiveSeg(activeSeg + 1);
    } else {
      setTyping(next);
      typingTimer.current = setTimeout(() => {
        const num = parseInt(next, 10);
        if (num > 0) {
          let [y, m, d] = [yr, mo, dy];
          if (activeSeg === 0) y = num;
          else if (activeSeg === 1) m = num;
          else d = num;
          emit(y, m, d);
        }
        setTyping("");
      }, 800);
    }
  };

  const handleKey = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setActiveSeg(s => Math.max(0, s - 1)); setTyping(""); }
    else if (e.key === "ArrowRight" || e.key === "-" || e.key === "/" || e.key === "Tab" && !e.shiftKey && activeSeg < 2) {
      if (e.key === "Tab" && activeSeg < 2) { e.preventDefault(); }
      if (e.key !== "Tab") e.preventDefault();
      if (e.key === "Tab" && activeSeg >= 2) return; // let tab proceed naturally
      setActiveSeg(s => Math.min(2, s + 1));
      setTyping("");
    }
    else if (e.key === "Tab" && e.shiftKey && activeSeg > 0) { e.preventDefault(); setActiveSeg(s => Math.max(0, s - 1)); setTyping(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); adjust(activeSeg, 1); setTyping(""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); adjust(activeSeg, -1); setTyping(""); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); }
    else if (e.key === "Escape") { setOpen(false); }
    else if (e.key >= "0" && e.key <= "9") { e.preventDefault(); handleType(e.key); }
  };

  // Calendar dropdown state
  const [viewing, setViewing] = useState(() => value ? new Date(value) : new Date());
  useEffect(() => { if (value) { const p = value.split("-").map(Number); setViewing(new Date(p[0], p[1]-1, 1)); } }, [value]);

  const vYear = viewing.getFullYear(), vMonth = viewing.getMonth();
  const firstDay = new Date(vYear, vMonth, 1).getDay();
  const vDaysInMonth = new Date(vYear, vMonth + 1, 0).getDate();
  const today = new Date();
  const mons = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= vDaysInMonth; d++) cells.push(d);
  const isSel = (d) => value && yr === vYear && mo === vMonth + 1 && dy === d;
  const isTod = (d) => today.getFullYear() === vYear && today.getMonth() === vMonth && today.getDate() === d;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const showRing = focused || open;
  const segStyle = (idx) => ({
    padding: "0 1px", borderRadius: 1,
    background: focused && activeSeg === idx ? t.semantic.info + "30" : "transparent",
    color: value ? t.text.primary : t.text.muted,
    transition: "background 0.08s",
  });

  return (
    <div style={{ position: "relative", width }} ref={containerRef}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: t.text.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: ff }}>{label}</div>}
      <div
        ref={inputRef}
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKey}
        onFocus={() => { setFocused(true); if (!value) emit(2025, 6, 15); }}
        onBlur={() => { setFocused(false); setTyping(""); setTimeout(() => setOpen(false), 200); }}
        style={{
          width: "100%", padding: "6px 10px", fontSize: 13, fontFamily: fm,
          background: t.bg.surface,
          border: `1px solid ${showRing ? t.semantic.info : t.border.default}`,
          borderRadius: radius.sm, cursor: "text",
          boxShadow: showRing ? `0 0 0 2px ${t.semantic.info}30` : "none",
          transition: "border 0.1s, box-shadow 0.1s", boxSizing: "border-box",
          outline: "none", display: "flex", alignItems: "center", gap: 0,
          fontVariantNumeric: "tabular-nums", userSelect: "none",
        }}
      >
        {value ? (
          <>
            <span style={segStyle(0)}>{String(yr).padStart(4, "0")}</span>
            <span style={{ color: t.text.muted }}>-</span>
            <span style={segStyle(1)}>{String(mo).padStart(2, "0")}</span>
            <span style={{ color: t.text.muted }}>-</span>
            <span style={segStyle(2)}>{String(dy).padStart(2, "0")}</span>
          </>
        ) : (
          <span style={{ color: t.text.muted }}>YYYY-MM-DD</span>
        )}
      </div>
      {open && (
        <div onMouseDown={e => e.preventDefault()} style={{
          position: "absolute", top: "100%", left: 0, marginTop: 2,
          background: t.bg.surface, border: `1px solid ${t.border.default}`,
          borderRadius: radius.md, padding: 8, zIndex: 50, width: 240,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <button tabIndex={-1} onClick={() => setViewing(new Date(vYear, vMonth - 1, 1))} style={{ background: "none", border: "none", color: t.text.secondary, cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: radius.sm, outline: "none" }} onMouseEnter={e => e.currentTarget.style.background = t.bg.muted} onMouseLeave={e => e.currentTarget.style.background = "none"}>‹</button>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.text.primary, fontFamily: ff }}>{mons[vMonth]} {vYear}</span>
            <button tabIndex={-1} onClick={() => setViewing(new Date(vYear, vMonth + 1, 1))} style={{ background: "none", border: "none", color: t.text.secondary, cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: radius.sm, outline: "none" }} onMouseEnter={e => e.currentTarget.style.background = t.bg.muted} onMouseLeave={e => e.currentTarget.style.background = "none"}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, textAlign: "center" }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={{ fontSize: 10, color: t.text.muted, padding: 4, fontFamily: ff, fontWeight: 500 }}>{d}</div>
            ))}
            {cells.map((d, i) => (
              <div key={i}
                onClick={() => { if (d) { emit(vYear, vMonth + 1, d); setOpen(false); inputRef.current?.focus(); } }}
                style={{
                  padding: 4, fontSize: 12, fontFamily: fm, cursor: d ? "pointer" : "default",
                  borderRadius: radius.sm, fontWeight: isSel(d) ? 600 : 400,
                  background: isSel(d) ? t.semantic.info : "transparent",
                  color: isSel(d) ? "#fff" : isTod(d) ? t.semantic.info : d ? t.text.primary : "transparent",
                  transition: "background 0.05s",
                }}
                onMouseEnter={e => { if (d && !isSel(d)) e.currentTarget.style.background = t.bg.muted; }}
                onMouseLeave={e => { if (d && !isSel(d)) e.currentTarget.style.background = "transparent"; }}
              >{d || ""}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toggle ─────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  const t = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
        background: value ? t.semantic.info : t.bg.overlay,
        position: "relative", transition: "background 0.15s ease", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: 8,
          background: value ? "#fff" : t.text.muted,
          transition: "left 0.15s ease, background 0.15s ease",
        }} />
      </button>
      {label && <span style={{ fontSize: 12, color: t.text.secondary, fontFamily: ff }}>{label}</span>}
    </div>
  );
}

// ─── Number Input ───────────────────────────────────────────────
function NumberInput({ label, value, onChange, min, max, step = 1, width = 120, suffix }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const clamp = (v) => Math.max(min ?? -Infinity, Math.min(max ?? Infinity, v));
  const handleKey = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const s = e.shiftKey ? step * 10 : step;
      onChange(clamp(value + s));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const s = e.shiftKey ? step * 10 : step;
      onChange(clamp(value - s));
    }
  };
  return (
    <div style={{ width }}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: t.text.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: ff }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${focused ? t.semantic.info : t.border.default}`, borderRadius: radius.sm, background: t.bg.surface, boxShadow: focused ? `0 0 0 2px ${t.semantic.info}30` : "none", transition: "border 0.1s, box-shadow 0.1s", overflow: "hidden" }}>
        <button tabIndex={-1} onClick={(e) => onChange(clamp(value - (e.shiftKey ? step * 10 : step)))} style={{ background: "none", border: "none", borderRight: `1px solid ${t.border.subtle}`, color: t.text.secondary, cursor: "pointer", padding: "4px 8px", fontSize: 14, fontFamily: fm, outline: "none" }} onMouseEnter={e => e.currentTarget.style.background = t.bg.muted} onMouseLeave={e => e.currentTarget.style.background = "none"}>−</button>
        <input
          type="text" value={value}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(clamp(v)); }}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, background: "none", border: "none", outline: "none", textAlign: "center", fontSize: 13, fontFamily: fm, color: t.text.primary, padding: "6px 4px", fontVariantNumeric: "tabular-nums", width: "100%", boxSizing: "border-box" }}
        />
        {suffix && <span style={{ fontSize: 11, color: t.text.muted, paddingRight: 4, fontFamily: ff }}>{suffix}</span>}
        <button tabIndex={-1} onClick={(e) => onChange(clamp(value + (e.shiftKey ? step * 10 : step)))} style={{ background: "none", border: "none", borderLeft: `1px solid ${t.border.subtle}`, color: t.text.secondary, cursor: "pointer", padding: "4px 8px", fontSize: 14, fontFamily: fm, outline: "none" }} onMouseEnter={e => e.currentTarget.style.background = t.bg.muted} onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
      </div>
    </div>
  );
}

// ─── Select Dropdown ────────────────────────────────────────────
function Select({ label, value, onChange, options, width = 160 }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find(o => (typeof o === "string" ? o : o.value) === value);
  const displayLabel = selected ? (typeof selected === "string" ? selected : selected.label) : "";
  const currentIdx = options.findIndex(o => (typeof o === "string" ? o : o.value) === value);

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && hoverIdx >= 0) {
        const o = options[hoverIdx];
        onChange(typeof o === "string" ? o : o.value);
        setOpen(false);
      } else {
        setOpen(!open);
        setHoverIdx(currentIdx >= 0 ? currentIdx : 0);
      }
    } else if (e.key === "Escape") { setOpen(false); }
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); setHoverIdx(currentIdx >= 0 ? currentIdx : 0); }
      else setHoverIdx(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) setHoverIdx(i => Math.max(i - 1, 0));
    }
  };

  const showRing = focused || open;

  return (
    <div style={{ position: "relative", width }} ref={ref}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: t.text.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: ff }}>{label}</div>}
      <div ref={btnRef} style={{ position: "relative" }}>
        <input
          readOnly
          value={displayLabel}
          onClick={() => { setOpen(!open); if (!open) setHoverIdx(currentIdx >= 0 ? currentIdx : 0); }}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 200); }}
          style={{
            width: "100%", padding: "6px 10px", paddingRight: 28, fontSize: 13, fontFamily: ff,
            background: t.bg.surface, color: t.text.primary,
            border: `1px solid ${showRing ? t.semantic.info : t.border.default}`,
            borderRadius: radius.sm, cursor: "pointer",
            boxShadow: showRing ? `0 0 0 2px ${t.semantic.info}30` : "none",
            transition: "border 0.1s, box-shadow 0.1s", boxSizing: "border-box",
            outline: "none", caretColor: "transparent",
          }}
        />
        <span style={{ position: "absolute", right: 10, top: "50%", transform: `translateY(-50%) ${open ? "rotate(180deg)" : ""}`, fontSize: 10, color: t.text.muted, transition: "transform 0.15s", pointerEvents: "none" }}>▼</span>
      </div>
      {open && (
        <div onMouseDown={e => e.preventDefault()} style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 2,
          background: t.bg.surface, border: `1px solid ${t.border.default}`,
          borderRadius: radius.md, maxHeight: 180, overflowY: "auto", zIndex: 50,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}>
          {options.map((o, i) => {
            const val = typeof o === "string" ? o : o.value;
            const lab = typeof o === "string" ? o : o.label;
            const isSel = val === value;
            const isHov = i === hoverIdx;
            return (
              <div key={val}
                onMouseDown={(e) => { e.preventDefault(); onChange(val); setOpen(false); const inp = btnRef.current?.querySelector("input"); if (inp) inp.focus(); }}
                onMouseEnter={() => setHoverIdx(i)}
                style={{
                  padding: "6px 10px", cursor: "pointer", fontSize: 13, fontFamily: ff,
                  background: isSel ? t.semantic.info + "20" : isHov ? t.bg.highlight : "transparent",
                  color: isSel ? t.semantic.info : t.text.primary,
                  fontWeight: isSel ? 600 : 400, transition: "background 0.05s",
                  borderBottom: i < options.length - 1 ? `1px solid ${t.border.subtle}` : "none",
                }}
              >{lab}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Components Page ────────────────────────────────────────────
const INSTRUMENTS = [
  { label: "AAPL — Apple Inc", sym: "AAPL", exchange: "NASDAQ" },
  { label: "MSFT — Microsoft Corp", sym: "MSFT", exchange: "NASDAQ" },
  { label: "GOOGL — Alphabet Inc", sym: "GOOGL", exchange: "NASDAQ" },
  { label: "AMZN — Amazon.com", sym: "AMZN", exchange: "NASDAQ" },
  { label: "NVDA — NVIDIA Corp", sym: "NVDA", exchange: "NASDAQ" },
  { label: "AMD — Advanced Micro Devices", sym: "AMD", exchange: "NASDAQ" },
  { label: "AVGO — Broadcom Inc", sym: "AVGO", exchange: "NASDAQ" },
  { label: "META — Meta Platforms", sym: "META", exchange: "NASDAQ" },
  { label: "TSLA — Tesla Inc", sym: "TSLA", exchange: "NASDAQ" },
  { label: "JNJ — Johnson & Johnson", sym: "JNJ", exchange: "NYSE" },
  { label: "JPM — JPMorgan Chase", sym: "JPM", exchange: "NYSE" },
  { label: "XOM — Exxon Mobil", sym: "XOM", exchange: "NYSE" },
  { label: "PFE — Pfizer Inc", sym: "PFE", exchange: "NYSE" },
  { label: "EUR/USD — Euro / Dollar", sym: "EUR/USD", exchange: "FX" },
  { label: "GBP/USD — Sterling / Dollar", sym: "GBP/USD", exchange: "FX" },
  { label: "USD/JPY — Dollar / Yen", sym: "USD/JPY", exchange: "FX" },
  { label: "AUD/USD — Aussie / Dollar", sym: "AUD/USD", exchange: "FX" },
  { label: "USD/CAD — Dollar / Loonie", sym: "USD/CAD", exchange: "FX" },
];

function ComponentsSection() {
  const t = useTheme();
  const [selectedInst, setSelectedInst] = useState(null);
  const [expiry, setExpiry] = useState("");
  const [strike, setStrike] = useState(230);
  const [qty, setQty] = useState(100);
  const [orderType, setOrderType] = useState("Limit");
  const [side, setSide] = useState("Buy");
  const [tif, setTif] = useState("Day");
  const [liveGreeks, setLiveGreeks] = useState(true);
  const [darkPool, setDarkPool] = useState(false);

  const EXCHANGES = ["All Exchanges", "NASDAQ", "NYSE", "FX", "CME", "ICE"];
  const [exchFilter, setExchFilter] = useState("All Exchanges");

  return (
    <div>
      <SectionHeader title="Component library" subtitle="Interactive form components styled to Meridian tokens. All inputs use theme-aware colors, tight radius, and consistent hover/focus behavior." />

      {/* Autocomplete — primary component */}
      <div style={{ background: t.bg.surface, borderRadius: radius.md, padding: 16, border: `1px solid ${t.border.subtle}`, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 4, fontFamily: ff }}>Autocomplete with fuzzy matching</div>
        <div style={{ fontSize: 11, color: t.text.muted, marginBottom: 8, fontFamily: ff }}>Type partial text — matches are highlighted inline. Supports keyboard navigation (↑↓ Enter Esc). Try typing "nv", "micro", or "usd".</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <Autocomplete
            label="Instrument"
            placeholder="Search symbol or name..."
            items={INSTRUMENTS}
            onSelect={setSelectedInst}
            width={300}
            renderItem={(item, match, selected) => (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <HighlightedText text={item.label} ranges={match.ranges} color={t.semantic.info} />
                </div>
                <span style={{ fontSize: 10, color: t.text.muted, fontFamily: fm, marginLeft: 8 }}>{item.exchange}</span>
              </div>
            )}
          />
          <Autocomplete
            label="Exchange"
            placeholder="Filter exchange..."
            items={EXCHANGES}
            onSelect={(v) => setExchFilter(v)}
            width={200}
          />
        </div>
        {selectedInst && (
          <div style={{ marginTop: 12, padding: "6px 10px", background: t.bg.muted, borderRadius: radius.sm, fontSize: 12, fontFamily: ff, color: t.text.secondary }}>
            Selected: <span style={{ color: t.semantic.info, fontWeight: 600, fontFamily: fm }}>{selectedInst.sym}</span> — {selectedInst.label.split(" — ")[1]} ({selectedInst.exchange})
          </div>
        )}
      </div>

      {/* Form layout — order entry style */}
      <div style={{ background: t.bg.surface, borderRadius: radius.md, padding: 16, border: `1px solid ${t.border.subtle}`, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 4, fontFamily: ff }}>Order entry form</div>
        <div style={{ fontSize: 11, color: t.text.muted, marginBottom: 8, fontFamily: ff }}>Date picker, number inputs with steppers, select dropdowns, toggles — all composable form primitives.</div>
        
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 12 }}>
          <Autocomplete label="Instrument" placeholder="Search..." items={INSTRUMENTS} onSelect={setSelectedInst} width={240}
            renderItem={(item, match) => <HighlightedText text={item.label} ranges={match.ranges} color={t.semantic.info} />}
          />
          <DatePicker label="Expiry" value={expiry} onChange={setExpiry} />
          <NumberInput label="Strike" value={strike} onChange={setStrike} step={5} min={0} width={130} />
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 12 }}>
          <Select label="Side" value={side} onChange={setSide} options={["Buy", "Sell"]} width={100} />
          <NumberInput label="Quantity" value={qty} onChange={setQty} step={10} min={1} width={130} />
          <Select label="Order type" value={orderType} onChange={setOrderType} options={["Market", "Limit", "Stop", "Stop Limit"]} width={140} />
          <Select label="Time in force" value={tif} onChange={setTif} options={["Day", "GTC", "IOC", "FOK"]} width={120} />
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${t.border.subtle}` }}>
          <Toggle label="Live greeks" value={liveGreeks} onChange={setLiveGreeks} />
          <Toggle label="Dark pool" value={darkPool} onChange={setDarkPool} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {["Buy","Sell"].map(s => {
            const isBuy = s === "Buy";
            const [bh, setBh] = useState(false);
            const color = isBuy ? t.semantic.positive : t.semantic.negative;
            return (
              <button key={s} style={{
                flex: 1, padding: "6px 12px", borderRadius: radius.sm, fontSize: 13, fontWeight: 600,
                fontFamily: ff, border: "none", cursor: "pointer",
                background: bh ? color : color + "20", color: bh ? "#fff" : color,
                transition: "background 0.1s, color 0.1s",
              }} onMouseEnter={() => setBh(true)} onMouseLeave={() => setBh(false)}>
                {s} {qty} @ {orderType === "Market" ? "MKT" : fmt(strike)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component reference */}
      <div style={{ background: t.bg.surface, borderRadius: radius.md, padding: 16, border: `1px solid ${t.border.subtle}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary, marginBottom: 12, fontFamily: ff }}>Component reference</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Component", "Focus ring", "Keyboard", "Hover"].map(h => (
            <th key={h} style={{ padding: "6px 8px", fontSize: 11, fontWeight: 500, color: t.text.muted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border.subtle}`, textAlign: "left", fontFamily: ff }}>{h}</th>
          ))}</tr></thead>
          <tbody>{[
            { c: "Autocomplete", f: "info border + shadow", k: "↑↓ navigate, Enter select, Esc close", h: "Item bg → highlight" },
            { c: "Date picker", f: "info border + shadow", k: "←→ navigate segments, ↑↓ increment, type digits, Enter toggle calendar", h: "Day cell bg → muted" },
            { c: "Select", f: "info border + shadow", k: "Enter/Space/↓ open, ↑↓ navigate, Enter select, Esc close", h: "Option bg → highlight" },
            { c: "Number input", f: "info border + shadow", k: "↑↓ step, Shift+↑↓ 10× step, type value", h: "Stepper bg → muted" },
            { c: "Toggle", f: "n/a (button-like)", k: "Click/Space", h: "n/a (state change is the feedback)" },
          ].map((row, i) => (
            <tr key={row.c}><td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 500, color: t.text.primary, fontFamily: ff, borderBottom: `1px solid ${t.border.subtle}` }}>{row.c}</td>
            <td style={{ padding: "6px 8px", fontSize: 12, color: t.text.secondary, fontFamily: ff, borderBottom: `1px solid ${t.border.subtle}` }}>{row.f}</td>
            <td style={{ padding: "6px 8px", fontSize: 12, color: t.text.secondary, fontFamily: ff, borderBottom: `1px solid ${t.border.subtle}` }}>{row.k}</td>
            <td style={{ padding: "6px 8px", fontSize: 12, color: t.text.secondary, fontFamily: ff, borderBottom: `1px solid ${t.border.subtle}` }}>{row.h}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function Tooltip({children,text}){const t=useTheme();const[show,setShow]=useState(false);const[pos,setPos]=useState({x:0,y:0});const timer=useRef(null);const onEnter=(e)=>{const r=e.currentTarget.getBoundingClientRect();setPos({x:r.left+r.width/2,y:r.top});timer.current=setTimeout(()=>setShow(true),250);};const onLeave=()=>{clearTimeout(timer.current);setShow(false);};return (<span onMouseEnter={onEnter} onMouseLeave={onLeave} style={{position:"relative",cursor:"pointer"}}>{children}{show&&<span style={{position:"fixed",left:pos.x,top:pos.y-30,transform:"translateX(-50%)",background:t.bg.overlay,color:t.text.primary,padding:"4px 8px",borderRadius:radius.md,fontSize:11,fontFamily:ff,whiteSpace:"nowrap",zIndex:100,border:`1px solid ${t.border.default}`,pointerEvents:"none",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>{text}</span>}</span>);}

function HoverDemo({label,desc,children}){const t=useTheme();return (<div style={{marginBottom:10}}><div style={{fontSize:12,fontWeight:600,color:t.text.primary,marginBottom:4,fontFamily:ff}}>{label}</div><div style={{fontSize:11,color:t.text.muted,marginBottom:6,fontFamily:ff}}>{desc}</div>{children}</div>);}

function InteractionsSection(){const t=useTheme();const[hovered,setHovered]=useState(null);const demoRows=[{sym:"AAPL",name:"Apple Inc",price:227.48,exchange:"NASDAQ",sector:"Technology",mktCap:"$3.4T"},{sym:"MSFT",name:"Microsoft Corp",price:441.06,exchange:"NASDAQ",sector:"Technology",mktCap:"$3.3T"},{sym:"NVDA",name:"NVIDIA Corp",price:134.70,exchange:"NASDAQ",sector:"Semiconductors",mktCap:"$3.3T"},{sym:"XOM",name:"Exxon Mobil",price:118.73,exchange:"NYSE",sector:"Energy",mktCap:"$480B"}];
const demoButtons=[{label:"Market",active:true},{label:"Limit",active:false},{label:"Stop",active:false}];
return (<div><SectionHeader title="Interaction patterns — hover taxonomy" subtitle="Every interactive element has a hover state. Non-interactive elements do not. Hover provides confirmation before commitment."/>

<HoverDemo label="Row hover — spatial orientation" desc="Background shifts to bg.highlight instantly. Helps track position in dense grids. Try hovering the rows below."><div style={{background:t.bg.surface,borderRadius:radius.md,border:`1px solid ${t.border.subtle}`,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Symbol","Name","Last","Exchange","Sector","Mkt Cap"].map(h=>(<th key={h} style={{padding:"6px 8px",fontSize:11,fontWeight:500,color:t.text.muted,textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${t.border.subtle}`,textAlign:h==="Last"||h==="Mkt Cap"?"right":"left",fontFamily:ff}}>{h}</th>))}</tr></thead><tbody>{demoRows.map((r,i)=>(<tr key={r.sym} style={{background:hovered===i?t.bg.highlight:i%2?t.bg.muted+"40":"transparent",transition:"background 0.08s ease",cursor:"pointer"}} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}><td style={{padding:"6px 8px",fontWeight:600,fontSize:13,color:t.text.primary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`}}><Tooltip text={`${r.name} — ${r.exchange}`}><span style={{borderBottom:`1px dotted ${t.text.muted}`}}>{r.sym}</span></Tooltip></td><td style={{padding:"6px 8px",fontSize:12,color:t.text.secondary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`}}>{r.name}</td><td style={{padding:"6px 8px",textAlign:"right",fontFamily:fm,fontSize:13,color:t.text.primary,borderBottom:`1px solid ${t.border.subtle}`,fontVariantNumeric:"tabular-nums"}}>{fmt(r.price)}</td><td style={{padding:"6px 8px",fontSize:12,color:t.text.muted,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`}}>{r.exchange}</td><td style={{padding:"6px 8px",fontSize:12,color:t.text.secondary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`}}>{r.sector}</td><td style={{padding:"6px 8px",textAlign:"right",fontSize:12,color:t.text.secondary,fontFamily:fm,borderBottom:`1px solid ${t.border.subtle}`}}>{r.mktCap}</td></tr>))}</tbody></table></div></HoverDemo>

<HoverDemo label="Tooltip — progressive disclosure (250ms delay)" desc="Hover over the dotted-underlined symbols above. The tooltip appears after a 250ms pause to prevent accidental triggers during mouse transit."><div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{demoRows.map(r=>(<Tooltip key={r.sym} text={`${r.name} — ${r.exchange} — ${r.mktCap}`}><span style={{fontSize:13,fontWeight:600,color:t.semantic.info,borderBottom:`1px dotted ${t.text.muted}`,cursor:"pointer",fontFamily:ff,padding:"4px 8px",background:t.bg.surface,borderRadius:radius.sm}}>{r.sym}</span></Tooltip>))}</div></HoverDemo>

<HoverDemo label="Button hover — one-step background shift" desc="Buttons shift background by one token step on hover. No scale, no shadow, no multi-property changes."><div style={{display:"flex",gap:8}}>{demoButtons.map(b=>{const[bh,setBh]=useState(false);return (<button key={b.label} style={{padding:"6px 16px",borderRadius:radius.sm,fontSize:12,fontFamily:ff,fontWeight:b.active?600:400,border:`1px solid ${b.active?t.semantic.info:t.border.default}`,background:b.active?t.semantic.info+"20":bh?t.bg.muted:t.bg.surface,color:b.active?t.semantic.info:t.text.secondary,cursor:"pointer",transition:"background 0.08s ease"}} onMouseEnter={()=>setBh(true)} onMouseLeave={()=>setBh(false)}>{b.label}</button>);})}<button style={{padding:"6px 16px",borderRadius:radius.sm,fontSize:12,fontFamily:ff,border:`1px solid ${t.border.subtle}`,background:t.bg.surface,color:t.text.muted,cursor:"not-allowed",opacity:0.5}}>Disabled</button></div></HoverDemo>

<HoverDemo label="Design rules" desc=""><div style={{background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`}}>{["One property change only — background OR text OR border, never multiple","Transition: 50–100ms ease — fast but not jarring","No false affordances — if it hovers, it must click","Consistency — every interactive row, every button, same behavior","Hover is additive — interface must work without it (keyboard, touch)"].map((rule,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<4?`1px solid ${t.border.subtle}`:"none",alignItems:"baseline"}}><span style={{fontSize:11,fontWeight:600,color:t.semantic.info,fontFamily:fm,flexShrink:0}}>{i+1}.</span><span style={{fontSize:12,color:t.text.secondary,fontFamily:ff}}>{rule}</span></div>))}</div></HoverDemo>

<HoverDemo label="Timing reference" desc=""><div style={{background:t.bg.surface,borderRadius:radius.md,padding:12,border:`1px solid ${t.border.subtle}`}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Trigger","Delay","Rationale"].map(h=>(<th key={h} style={{padding:"6px 8px",fontSize:11,fontWeight:500,color:t.text.muted,textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${t.border.subtle}`,textAlign:"left",fontFamily:ff}}>{h}</th>))}</tr></thead><tbody>{[{t:"Visual feedback (bg)",d:"0ms",r:"Position = instant affordance"},{t:"Tooltip content",d:"200–300ms",r:"Prevents accidental triggers during transit"},{t:"Large overlay / menu",d:"300–500ms",r:"Higher cost → stronger intent signal needed"}].map((row,i)=>(<tr key={i}><td style={{padding:"6px 8px",fontSize:12,color:t.text.primary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`}}>{row.t}</td><td style={{padding:"6px 8px",fontSize:12,color:t.semantic.info,fontFamily:fm,borderBottom:`1px solid ${t.border.subtle}`}}>{row.d}</td><td style={{padding:"6px 8px",fontSize:12,color:t.text.secondary,fontFamily:ff,borderBottom:`1px solid ${t.border.subtle}`}}>{row.r}</td></tr>))}</tbody></table></div></HoverDemo>

</div>);}

export default function App(){const[active,setActive]=useState("components");const[mode,setMode]=useState("dark");const[instruments,setInstruments]=useState(watchlistData);const t=themes[mode];useEffect(()=>{const iv=setInterval(()=>{setInstruments(prev=>prev.map(inst=>{const np=inst.price*(1+(Math.random()-.5)*.001);const p=Math.round(np*10**inst.dp)/10**inst.dp;const sp=inst.ask-inst.bid;return{...inst,price:p,change:Math.round((inst.change+(Math.random()-.5)*.04)*100)/100,bid:Math.round((p-sp/2)*10**inst.dp)/10**inst.dp,ask:Math.round((p+sp/2)*10**inst.dp)/10**inst.dp};}));},1500);return()=>clearInterval(iv);},[]);return (<ThemeContext.Provider value={mode}><div style={{background:t.bg.base,color:t.text.primary,minHeight:"100vh",fontFamily:ff,fontSize:13,transition:"background 0.2s ease, color 0.2s ease"}}><NavBar active={active} setActive={setActive} mode={mode} setMode={setMode}/><div style={{padding:"12px 16px",maxWidth:960,margin:"0 auto"}}>{active==="watchlist"&&<WatchlistSection instruments={instruments}/>}{active==="pricer"&&<PricerSection/>}{active==="chart"&&<ChartSection/>}{active==="components"&&<ComponentsSection/>}{active==="interactions"&&<InteractionsSection/>}{active==="analysis"&&<AnalysisSection/>}{active==="tokens"&&<TokensSection/>}</div><div style={{padding:"6px 16px",borderTop:`1px solid ${t.border.subtle}`,display:"flex",justifyContent:"space-between",fontSize:11,color:t.text.muted}}><span>Meridian v0.7 — components · dark/light · hover · CIELAB ramp</span><span style={{fontFamily:fm}}>{mode} theme · core ΔE≥29.8</span></div></div></ThemeContext.Provider>);}
