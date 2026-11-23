// ItemDetail.jsx — No Lo Vendo · Pantalla de Detalle de Objeto
// Shared components: tokens, primitives, gallery, share modal, candidate panel, donor/receiver controls

/* ── TOKENS ─────────────────────────────────────────────────── */
const C = {
  primary:      '#3A7358',
  primaryHov:   '#2D5C45',
  primaryLight: '#F0F5F2',
  accent:       '#253F72',
  bgPage:       '#F4F5F6',
  bgSurface:    '#FFFFFF',
  bgSubtle:     '#E8EAEC',
  fg:           '#14171A',
  fgMid:        '#606A76',
  fgMuted:      '#7C8692',
  fgDisabled:   '#9AA2AD',
  border:       '#D5D9DE',
  borderStr:    '#B8BFC7',
  sh1: '0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)',
  sh2: '0 4px 16px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.06)',
  sh3: '0 8px 32px rgba(0,0,0,.14)',
  stActBg:'#F0F5F2', stActFg:'#224633', stActBd:'#B5D0C2',
  stRsvBg:'#FEF6E7', stRsvFg:'#8F5907', stRsvBd:'#EDD090',
  stDonBg:'#EBF5EE', stDonFg:'#265533', stDonBd:'#9DCCA8',
  stCncBg:'#FDECEA', stCncFg:'#7D2419', stCncBd:'#E8A89E',
  stDgdBg:'#E8EAEC', stDgdFg:'#606A76', stDgdBd:'#D5D9DE',
  infoBg:'#EDF0F5', infoFg:'#142244', infoBd:'#A5B5D4',
  wrnBg:'#FEF6E7', wrnFg:'#8F5907', wrnBd:'#EDD090',
};
const FD = "'Playfair Display', Georgia, serif";
const FB = "'DM Sans', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

/* ── CATEGORIES ──────────────────────────────────────────────── */
const CATEGORY_LABELS = {
  furniture:   'Muebles',
  electronics: 'Electrónica',
  clothing:    'Ropa',
  books:       'Libros',
  toys:        'Juguetes',
  kitchen:     'Cocina',
  sports:      'Deporte',
  tools:       'Herramientas',
  other:       'Otros',
};

function CategoryChip({ category, large }) {
  const label = CATEGORY_LABELS[category] || category || '—';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: FB, fontSize: large ? 12 : 11, fontWeight: 500,
      padding: large ? '3px 10px' : '2px 8px', borderRadius: 999,
      background: '#EDF0F5', color: '#142244', border: '1px solid #A5B5D4',
    }}>
      {label}
    </span>
  );
}

/* ── ICONS ───────────────────────────────────────────────────── */
const ICON_PATHS = {
  'map-pin':       'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z',
  'chevron-left':  'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'check-circle':  'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  'x-circle':      'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM15 9l-6 6M9 9l6 6',
  'share-2':       'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zM21 19a3 3 0 11-6 0 3 3 0 016 0z',
  'copy':          'M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  'user':          'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  'users':         'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'image':         'M21 15l-5-5L5 21M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  'trash':         'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2',
  'edit-2':        'M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  'pause-circle':  'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM10 9v6M14 9v6',
  'send':          'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  'star':          'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'phone':         'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  'plus':          'M12 5v14M5 12h14',
  'arrow-left':    'M19 12H5M12 19l-7-7 7-7',
  'calendar':      'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
};

function Icon({ name, size = 16, color, style: sx }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...sx }}>
      {d.split('M').filter(Boolean).map((seg, i) => (
        <path key={i} d={'M' + seg} />
      ))}
    </svg>
  );
}

/* ── STATUS BADGE ────────────────────────────────────────────── */
const ST_CFG = {
  active:    { label:'activo',     bg:C.stActBg, fg:C.stActFg, bd:C.stActBd, dot:'#3A7358' },
  reserved:  { label:'reservado',  bg:C.stRsvBg, fg:C.stRsvFg, bd:C.stRsvBd, dot:'#D4870A' },
  completed: { label:'completado', bg:C.stDonBg, fg:C.stDonFg, bd:C.stDonBd, dot:'#3A7B4A' },
  cancelled: { label:'cancelado',  bg:C.stCncBg, fg:C.stCncFg, bd:C.stCncBd, dot:'#B33A2A' },
  degraded:  { label:'degradado',  bg:C.stDgdBg, fg:C.stDgdFg, bd:C.stDgdBd, dot:C.fgMuted },
  paused:    { label:'pausado',    bg:C.infoBg,  fg:C.infoFg,  bd:C.infoBd,  dot:'#2A6CB3' },
};
function StatusBadge({ status }) {
  const s = ST_CFG[status] || ST_CFG.active;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:11, fontWeight:500, padding:'4px 10px', borderRadius:999,
      background:s.bg, color:s.fg, border:`1px solid ${s.bd}`,
      fontFamily:FB, lineHeight:1, whiteSpace:'nowrap', flexShrink:0,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {s.label}
    </span>
  );
}

/* ── REP CHIP ─────────────────────────────────────────────────── */
function RepChip({ score }) {
  const pos = score > 0, zero = score === 0;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', fontFamily:FM,
      fontSize:12, fontWeight:500, padding:'2px 9px', borderRadius:999,
      background: pos ? C.stDonBg : zero ? C.bgSubtle : C.stCncBg,
      color:       pos ? C.stDonFg : zero ? C.fgMuted  : C.stCncFg,
      border:`1px solid ${pos ? C.stDonBd : zero ? C.border : C.stCncBd}`,
    }}>
      {pos ? '+' : ''}{score}
    </span>
  );
}

/* ── BUTTON ──────────────────────────────────────────────────── */
function Btn({ children, variant='primary', size='md', onClick, disabled, fullWidth, style: sx }) {
  const [hov, setHov] = React.useState(false);
  const [prs, setPrs] = React.useState(false);
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    fontFamily:FB, fontWeight:500, border:'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius:8, lineHeight:1, transition:'all 150ms ease',
    width: fullWidth ? '100%' : undefined,
    transform: prs && !disabled ? 'scale(0.97)' : 'scale(1)',
    opacity: disabled ? 0.5 : 1,
    ...(size==='lg' ? { fontSize:15, padding:'13px 24px' } :
        size==='sm' ? { fontSize:12, padding:'7px 14px'  } :
                      { fontSize:14, padding:'10px 20px' }),
  };
  const vv = {
    primary:     { background: disabled ? C.bgSubtle : hov ? C.primaryHov : C.primary, color: disabled ? C.fgDisabled : '#fff' },
    secondary:   { background: hov && !disabled ? C.primaryLight : C.bgSurface, color: disabled ? C.fgDisabled : C.primary, border:`1.5px solid ${disabled ? C.border : C.primary}` },
    ghost:       { background: hov && !disabled ? C.primaryLight : 'transparent', color: disabled ? C.fgDisabled : C.primary },
    destructive: { background: hov && !disabled ? '#7D2419' : '#B33A2A', color:'#fff' },
  };
  return (
    <button style={{ ...base, ...vv[variant], ...sx }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPrs(false); }}
      onMouseDown={() => setPrs(true)} onMouseUp={() => setPrs(false)}
      disabled={disabled}>
      {children}
    </button>
  );
}

/* ── MODAL ───────────────────────────────────────────────────── */
function Mdl({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      className="fade-in" onClick={onClose}>
      <div style={{ background:C.bgSurface, borderRadius:16, boxShadow:C.sh3, width:'100%', maxWidth:width, overflow:'hidden' }}
        className="modal-in" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 0' }}>
          <div style={{ fontSize:17, fontWeight:600, color:C.fg, fontFamily:FB }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.fgMuted, padding:4, borderRadius:6, display:'flex' }}>
            <Icon name="x-circle" size={20} />
          </button>
        </div>
        <div style={{ padding:'16px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── IMAGE GALLERY ───────────────────────────────────────────── */
function ImageGallery({ count = 3 }) {
  const [active, setActive] = React.useState(0);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{
        width:'100%', aspectRatio:'4/3', background:C.bgSubtle,
        borderRadius:14, overflow:'hidden', position:'relative',
        display:'flex', alignItems:'center', justifyContent:'center', color:C.fgMuted,
      }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, opacity:0.45 }}>
          <Icon name="image" size={52} />
          <span style={{ fontSize:12, fontFamily:FB }}>Foto {active + 1} de {count}</span>
        </div>
        {count > 1 && (
          <>
            <button onClick={() => setActive(a => Math.max(0, a - 1))} disabled={active === 0}
              style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:C.sh1, color:C.fg, opacity:active===0?0.3:1, transition:'opacity 150ms' }}>
              <Icon name="chevron-left" size={14} />
            </button>
            <button onClick={() => setActive(a => Math.min(count - 1, a + 1))} disabled={active === count - 1}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:C.sh1, color:C.fg, opacity:active===count-1?0.3:1, transition:'opacity 150ms' }}>
              <Icon name="chevron-right" size={14} />
            </button>
            <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>
              {Array.from({ length:count }, (_, i) => (
                <div key={i} onClick={() => setActive(i)} style={{ width:i===active?16:6, height:6, borderRadius:3, background:i===active?C.primary:'rgba(255,255,255,.7)', cursor:'pointer', transition:'all 220ms ease' }} />
              ))}
            </div>
          </>
        )}
      </div>
      {count > 1 && (
        <div style={{ display:'flex', gap:6 }}>
          {Array.from({ length:count }, (_, i) => (
            <div key={i} onClick={() => setActive(i)} style={{ flex:1, aspectRatio:'4/3', borderRadius:9, background:C.bgSubtle, border:`2px solid ${active===i ? C.primary : 'transparent'}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.fgMuted, cursor:'pointer', transition:'border-color 150ms', overflow:'hidden' }}>
              <Icon name="image" size={14} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── SHARE MODAL ─────────────────────────────────────────────── */
function ShareModal({ open, onClose, item }) {
  const [copied, setCopied] = React.useState(false);
  const url = `https://noloven.do/objetos/${item.id}`;

  function doCopy() {
    const set = () => { setCopied(true); setTimeout(() => setCopied(false), 2400); };
    if (navigator.clipboard) { navigator.clipboard.writeText(url).then(set).catch(() => { fbCopy(); set(); }); }
    else { fbCopy(); set(); }
  }
  function fbCopy() {
    const t = document.createElement('textarea');
    t.value = url; t.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedMsg = encodeURIComponent(`¡Mira este objeto gratis en No Lo Vendo!\n${item.title}\n${url}`);
  const encodedTgMsg = encodeURIComponent(`Mira este objeto gratis: ${item.title}`);

  const channelBtnStyle = {
    flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    gap:7, padding:'13px 6px', borderRadius:10, border:`1px solid ${C.border}`,
    background:C.bgSurface, cursor:'pointer', fontFamily:FB, fontSize:12, color:C.fg,
    transition:'background 150ms', outline:'none',
  };

  return (
    <Mdl open={open} onClose={onClose} title="Compartir objeto" width={400}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:C.bgSubtle }}>
          <div style={{ width:40, height:40, borderRadius:8, background:C.border, display:'flex', alignItems:'center', justifyContent:'center', color:C.fgMuted, flexShrink:0 }}>
            <Icon name="image" size={18} />
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:13, fontWeight:500, color:C.fg, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
            <div style={{ fontSize:11, color:C.fgMuted, marginTop:2, fontFamily:FM }}>noloven.do/objetos/{item.id}</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ flex:1, padding:'9px 12px', borderRadius:8, background:C.bgSubtle, border:`1px solid ${C.border}`, fontSize:12, fontFamily:FM, color:C.fgMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {url}
          </div>
          <Btn variant={copied ? 'secondary' : 'primary'} size="sm" onClick={doCopy} style={{ flexShrink:0, minWidth:96 }}>
            <Icon name={copied ? 'check-circle' : 'copy'} size={13} />
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </Btn>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.fgMuted, textTransform:'uppercase', letterSpacing:'0.07em' }}>Compartir vía</div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={channelBtnStyle} onClick={() => window.open(`https://wa.me/?text=${encodedMsg}`, '_blank')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button style={channelBtnStyle} onClick={() => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTgMsg}`, '_blank')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
            <button style={channelBtnStyle} onClick={() => { if(navigator.share) { navigator.share({ title:item.title, url }); } else { window.open(`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(url)}`); } }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:C.bgSubtle, display:'flex', alignItems:'center', justifyContent:'center', color:C.fgMid }}>
                <Icon name="share-2" size={13} />
              </div>
              Más opciones
            </button>
          </div>
        </div>
      </div>
    </Mdl>
  );
}

/* ── CANDIDATE ROW ───────────────────────────────────────────── */
function CandidateRow({ c, rank, onSelect }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', background:hov ? C.bgSubtle : C.bgSurface, borderBottom:`1px solid ${C.border}`, transition:'background 150ms' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:rank===1 ? C.primaryLight : C.bgSubtle, border:rank===1 ? `1.5px solid ${C.primary}` : 'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:rank===1 ? C.primary : C.fgMuted }}>
          {rank}
        </div>
        <div style={{ width:34, height:34, borderRadius:'50%', background:C.bgSubtle, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.fgMuted, flexShrink:0 }}>
          <Icon name="user" size={16} />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:C.fg }}>Usuario anónimo</div>
          <div style={{ display:'flex', gap:12, marginTop:3, fontSize:12, color:C.fgMuted }}>
            <span>{c.km.toFixed(1)} km{c.localidad ? ` · ${c.localidad}` : ''}</span>
            <span>hace {c.daysAgo === 0 ? 'hoy' : c.daysAgo === 1 ? '1 día' : `${c.daysAgo} días`}</span>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <RepChip score={c.score} />
        <Btn size="sm" onClick={() => onSelect(c)}>Seleccionar</Btn>
      </div>
    </div>
  );
}

/* ── CANDIDATES PANEL ────────────────────────────────────────── */
function CandidatesPanel({ candidates, onSelect }) {
  return (
    <div className="card-in" style={{ marginTop:36 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <h2 style={{ fontFamily:FB, fontSize:16, fontWeight:600, color:C.fg, margin:0 }}>
          Candidatos{' '}
          <span style={{ fontWeight:400, color:C.fgMuted }}>({candidates.length})</span>
        </h2>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:C.fgMuted }}>
          <Icon name="star" size={12} />
          Priorizados por el sistema
        </span>
      </div>
      <div style={{ background:C.bgSurface, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', boxShadow:C.sh1 }}>
        {candidates.length === 0 ? (
          <div style={{ padding:'32px 16px', textAlign:'center', color:C.fgMuted, fontSize:14 }}>Sin solicitudes todavía.</div>
        ) : (
          candidates.map((c, i) => <CandidateRow key={c.id} c={c} rank={i + 1} onSelect={onSelect} />)
        )}
      </div>
    </div>
  );
}

/* ── SELECT RECIPIENT MODAL ──────────────────────────────────── */
function SelectModal({ open, onClose, onConfirm }) {
  const [channel, setChannel] = React.useState('');
  function close() { setChannel(''); onClose(); }
  function confirm() { if (channel.trim()) { onConfirm(channel); setChannel(''); } }
  return (
    <Mdl open={open} onClose={close} title="Confirmar receptor" width={440}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <p style={{ fontSize:14, color:C.fgMid, margin:0, lineHeight:1.65 }}>
          Introduce el canal de contacto para que el receptor pueda coordinarse contigo.
          Solo se revela cuando la sesión de entrega está activa.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:14, fontWeight:500, color:C.fg, fontFamily:FB }}>Canal de contacto</label>
          <input placeholder="Ej: WhatsApp +34 600 000 000 / Telegram @usuario"
            value={channel} onChange={e => setChannel(e.target.value)}
            onFocus={e => e.target.style.borderColor = C.primary}
            onBlur={e => e.target.style.borderColor = C.border}
            style={{ fontFamily:FB, fontSize:14, color:C.fg, width:'100%', boxSizing:'border-box', background:C.bgSurface, border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 12px', outline:'none', transition:'border-color 150ms' }} />
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <Btn variant="secondary" onClick={close}>Cancelar</Btn>
          <Btn disabled={!channel.trim()} onClick={confirm}>Confirmar selección</Btn>
        </div>
      </div>
    </Mdl>
  );
}

/* ── DONOR CONTROLS ──────────────────────────────────────────── */
function DonorControls({ item, paused, onPauseToggle, showCandidates, onToggleCandidates }) {
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:2 }}>
          <div style={{ background:C.bgSubtle, borderRadius:10, padding:'11px 14px' }}>
            <div style={{ fontFamily:FM, fontSize:22, fontWeight:600, color:C.fg, lineHeight:1 }}>{item.requestCount}</div>
            <div style={{ fontSize:10, color:C.fgMuted, marginTop:5, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>Solicitudes</div>
          </div>
          <div style={{ background:C.bgSubtle, borderRadius:10, padding:'11px 14px' }}>
            <div style={{ fontFamily:FM, fontSize:22, fontWeight:600, color:C.fg, lineHeight:1 }}>{item.daysAgo}d</div>
            <div style={{ fontSize:10, color:C.fgMuted, marginTop:5, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>Publicado</div>
          </div>
        </div>

        {/* Pause toggle */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', background:C.bgSubtle, borderRadius:10 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:C.fg }}>Pausar solicitudes</div>
            <div style={{ fontSize:12, color:C.fgMuted, marginTop:2 }}>Bloquea nuevas solicitudes</div>
          </div>
          <div onClick={onPauseToggle} style={{ width:40, height:22, borderRadius:99, background:paused ? C.primary : C.border, position:'relative', cursor:'pointer', transition:'background 220ms', flexShrink:0 }}>
            <div style={{ position:'absolute', top:3, left:paused ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 220ms', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
          </div>
        </div>

        {/* Ver candidatos */}
        <Btn variant="secondary" onClick={onToggleCandidates} fullWidth>
          <Icon name="users" size={14} />
          {showCandidates ? 'Ocultar candidatos' : `Ver candidatos (${item.requestCount})`}
        </Btn>

        {/* Editar + Cancelar */}
        <div style={{ display:'flex', gap:8 }}>
          <Btn variant="ghost" fullWidth>
            <Icon name="edit-2" size={14} />
            Editar objeto
          </Btn>
          <Btn variant="destructive" onClick={() => setCancelOpen(true)} style={{ padding:'10px 16px' }}>
            <Icon name="trash" size={14} />
          </Btn>
        </div>
      </div>

      {/* Cancel modal */}
      <Mdl open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar objeto" width={380}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {cancelled ? (
            <div style={{ textAlign:'center', padding:'8px 0 4px' }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.fg, marginBottom:8 }}>Objeto cancelado</div>
              <div style={{ fontSize:14, color:C.fgMid, marginBottom:20 }}>Los candidatos han sido notificados.</div>
              <Btn variant="secondary" onClick={() => { setCancelOpen(false); setCancelled(false); }}>Cerrar</Btn>
            </div>
          ) : (
            <>
              <p style={{ fontSize:14, color:C.fgMid, margin:0, lineHeight:1.65 }}>
                ¿Seguro que quieres cancelar este objeto? Se retirará del listado y los candidatos serán notificados.
              </p>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <Btn variant="secondary" onClick={() => setCancelOpen(false)}>Mantener</Btn>
                <Btn variant="destructive" onClick={() => setCancelled(true)}>Sí, cancelar</Btn>
              </div>
            </>
          )}
        </div>
      </Mdl>
    </>
  );
}

/* ── SPINNER ─────────────────────────────────────────────────── */
function Spinner({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation:'nlvSpin 720ms linear infinite', flexShrink:0 }}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.28" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── REQUEST CONTACT BOTTOM SHEET ────────────────────────────── */
function RequestSheet({ open, onClose, onSubmit }) {
  const [channel, setChannel]   = React.useState('');
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setChannel(''); setLoading(false); setError(false);
      const id = setTimeout(() => inputRef.current && inputRef.current.focus(), 300);
      return () => clearTimeout(id);
    }
  }, [open]);

  if (!open) return null;
  const empty = !channel.trim();

  function close() { if (!loading) onClose(); }
  function submit() {
    if (empty) { setError(true); inputRef.current && inputRef.current.focus(); return; }
    setLoading(true);
    // Simula la llamada de red — respuesta 201
    setTimeout(() => onSubmit(channel.trim()), 850);
  }

  return (
    <div className="sheet-backdrop" onClick={close}
      style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div className="sheet-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
        style={{ background:C.bgSurface, width:'100%', maxWidth:468, borderRadius:'20px 20px 0 0', boxShadow:C.sh3,
          padding:'10px 26px calc(26px + env(safe-area-inset-bottom, 0px))' }}>

        {/* grabber */}
        <div style={{ width:38, height:4, borderRadius:99, background:C.border, margin:'0 auto 18px' }} />

        <h2 style={{ fontFamily:FD, fontSize:21, fontWeight:700, color:C.fg, lineHeight:1.25, letterSpacing:'-0.01em', marginBottom:8 }}>
          ¿Cómo puede contactarte el donante?
        </h2>
        <p style={{ fontSize:13.5, color:C.fgMid, lineHeight:1.6, marginBottom:20, textWrap:'pretty' }}>
          Si te seleccionan, el donante usará este dato para coordinarse contigo. Solo lo verá él, y solo si decides que te seleccione.
        </p>

        <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.fg, fontFamily:FB, marginBottom:7 }}>
          Tu canal de contacto
        </label>
        <input ref={inputRef} value={channel}
          placeholder="Ej: WhatsApp +34 600 000 000, Telegram @usuario..."
          disabled={loading}
          onChange={e => { setChannel(e.target.value); if (error) setError(false); }}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          onFocus={e => { if (!error) e.target.style.borderColor = C.primary; }}
          onBlur={e => { if (!error) e.target.style.borderColor = C.border; }}
          style={{ fontFamily:FB, fontSize:14, color:C.fg, width:'100%', boxSizing:'border-box',
            background:C.bgSurface, border:`1.5px solid ${error ? '#B33A2A' : C.border}`, borderRadius:8,
            padding:'11px 13px', outline:'none', transition:'border-color 150ms' }} />

        {error ? (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:12.5, color:'#B33A2A', fontWeight:500 }}>
            <Icon name="x-circle" size={14} color="#B33A2A" />
            Introduce tu canal de contacto para continuar
          </div>
        ) : (
          <div style={{ marginTop:8, fontSize:12.5, color:C.fgMuted, lineHeight:1.5 }}>
            Puedes escribir lo que prefieras: número, usuario, app, etc.
          </div>
        )}

        <div style={{ display:'flex', gap:10, marginTop:24, alignItems:'center' }}>
          <Btn variant="ghost" onClick={close} disabled={loading} style={{ flexShrink:0 }}>Cancelar</Btn>
          <Btn onClick={submit} disabled={empty || loading} fullWidth size="lg">
            {loading
              ? (<><Spinner size={16} /> Enviando…</>)
              : (<><Icon name="send" size={15} /> Enviar solicitud</>)}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── RECEIVER CONTROLS ───────────────────────────────────────── */
function ReceiverControls({ item, paused, reqState, onRequest }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Paused notice */}
      {paused && (
        <div style={{ padding:'11px 14px', borderRadius:10, background:C.wrnBg, border:`1px solid ${C.wrnBd}`, fontSize:13, color:C.wrnFg, display:'flex', gap:9, alignItems:'flex-start', lineHeight:1.55 }}>
          <Icon name="pause-circle" size={16} color={C.wrnFg} style={{ flexShrink:0, marginTop:1 }} />
          Las solicitudes están temporalmente pausadas por el donante.
        </div>
      )}

      {reqState === 'none' && (
        <Btn disabled={paused} onClick={() => setSheetOpen(true)} fullWidth size="lg">
          <Icon name="send" size={15} />
          Solicitar objeto
        </Btn>
      )}

      <RequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
        onSubmit={() => { setSheetOpen(false); onRequest(); }} />


      {reqState === 'pending' && (
        <div style={{ padding:'14px 16px', borderRadius:10, background:C.stDonBg, border:`1px solid ${C.stDonBd}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:600, fontSize:14, color:C.stDonFg }}>
            <Icon name="check-circle" size={16} color={C.stDonFg} />
            Solicitud enviada
          </div>
          <div style={{ fontSize:13, color:C.stDonFg, marginTop:5, opacity:0.8 }}>
            El donante revisará tu perfil próximamente.
          </div>
        </div>
      )}

      {reqState === 'selected' && (
        <div style={{ padding:'16px', borderRadius:10, background:C.primaryLight, border:`1.5px solid ${C.primary}`, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15, color:C.primary }}>
            <Icon name="star" size={16} color={C.primary} />
            ¡Has sido seleccionado!
          </div>
          <div style={{ fontSize:13, color:C.fgMid, lineHeight:1.55 }}>
            El donante se pondrá en contacto contigo para coordinar la recogida.
          </div>
          <Btn style={{ alignSelf:'flex-start' }}>
            <Icon name="phone" size={14} />
            Ver datos de entrega
          </Btn>
        </div>
      )}

      {reqState === 'rejected' && (
        <div style={{ padding:'12px 14px', borderRadius:10, background:C.stCncBg, border:`1px solid ${C.stCncBd}`, fontSize:13, color:C.stCncFg, display:'flex', gap:9, alignItems:'flex-start', lineHeight:1.55 }}>
          <Icon name="x-circle" size={16} color={C.stCncFg} style={{ flexShrink:0, marginTop:1 }} />
          Tu solicitud no fue seleccionada esta vez. Sigue explorando otros objetos disponibles.
        </div>
      )}

      {/* Donor card */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background:C.bgSubtle, marginTop:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:C.bgSurface, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.fgMuted, flexShrink:0 }}>
            <Icon name="user" size={17} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:C.fg }}>Donante anónimo</div>
            <div style={{ fontSize:11, color:C.fgMuted, marginTop:2 }}>Miembro desde {item.donor.since}</div>
          </div>
        </div>
        <RepChip score={item.donor.score} />
      </div>
    </div>
  );
}

/* ── EXPORT ──────────────────────────────────────────────────── */
Object.assign(window, {
  C, FD, FB, FM,
  CATEGORY_LABELS, CategoryChip,
  Icon, StatusBadge, RepChip, Btn, Mdl,
  ImageGallery, ShareModal,
  CandidateRow, CandidatesPanel, SelectModal,
  Spinner, RequestSheet,
  DonorControls, ReceiverControls,
});
