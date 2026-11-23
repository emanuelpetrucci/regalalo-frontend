// report-modal.jsx — No Lo Vendo · Sistema de Reportes (DESIGN-REP-01)
// Flujo de 3 pasos: Selección de motivo → Descripción → Confirmación
// Exporta: ReportModal, IFlag, IAlertTriangle, IChevronLeft, ISpinner

/* ── TOKENS (matching project C object pattern) ──────────────── */
const RC = {
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
  error:        '#B33A2A',
  errorBg:      '#FDECEA',
  errorBorder:  '#E8A89E',
  successBg:    '#EBF5EE',
  successFg:    '#3A7B4A',
  warnBg:       '#FEF6E7',
  warnFg:       '#8F5907',
  sh1: '0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)',
  sh2: '0 4px 16px rgba(0,0,0,0.10),0 2px 4px rgba(0,0,0,0.06)',
  sh3: '0 8px 32px rgba(0,0,0,0.14)',
};
const RFD = "'Playfair Display', Georgia, serif";
const RFB = "'DM Sans', system-ui, sans-serif";
const RFM = "'JetBrains Mono', monospace";

/* ── REASONS ─────────────────────────────────────────────────── */
const REASONS = [
  { id:'inappropriate',   label:'Contenido inadecuado u ofensivo', sublabel:'Imágenes o texto que no son apropiados' },
  { id:'fraud',           label:'Fraude o engaño',                sublabel:'El objeto no existe, está en mal estado real, etc.' },
  { id:'spam',            label:'Spam o publicidad',              sublabel:'Publicación con fines comerciales' },
  { id:'illegal',         label:'Objeto ilegal',                  sublabel:'Producto prohibido o de venta ilegal' },
  { id:'dangerous',       label:'Objeto peligroso',               sublabel:'Puede causar daños físicos' },
  { id:'misleading',      label:'Información falsa o engañosa',   sublabel:'Datos incorrectos sobre el objeto o el usuario' },
  { id:'abuse',           label:'Comportamiento abusivo',         sublabel:'Mensajes, acoso u hostigamiento' },
  { id:'other',           label:'Otro motivo',                    sublabel:'' },
];

/* ── ERROR MESSAGES ──────────────────────────────────────────── */
const ERROR_MESSAGES = {
  duplicate:       'Ya tienes un reporte pendiente de revisión sobre este contenido.',
  limit_entity:    'Has enviado demasiados reportes sobre este contenido recientemente. Inténtalo más tarde.',
  limit_total:     'Has alcanzado el límite de reportes permitidos. Inténtalo de nuevo en unos días.',
  not_reportable:  'Este contenido no puede ser reportado en este momento.',
  recaptcha:       'No hemos podido verificar tu solicitud. Inténtalo de nuevo.',
  generic:         'Ha ocurrido un error inesperado. Inténtalo de nuevo en unos instantes.',
};

/* ── ICONS ───────────────────────────────────────────────────── */
const RIco = ({ sz=16, sw=1.75, children }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IFlag = ({sz=16}) => (
  <RIco sz={sz} sw={1.75}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </RIco>
);

const IAlertTriangle = ({sz=16}) => (
  <RIco sz={sz} sw={1.75}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </RIco>
);

const IChevronLeft = ({sz=16}) => (
  <RIco sz={sz} sw={2}>
    <path d="M15 18l-6-6 6-6"/>
  </RIco>
);

const ICheckCircle = ({sz=16}) => (
  <RIco sz={sz} sw={1.75}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </RIco>
);

const IXCircle = ({sz=16}) => (
  <RIco sz={sz} sw={1.75}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M15 9l-6 6M9 9l6 6"/>
  </RIco>
);

const ISpinner = ({sz=16}) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, animation:'rptSpin 720ms linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.28" strokeWidth="3"/>
    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* ── CONTEXT MENU DROPDOWN ──────────────────────────────────── */
function ContextMenu({ open, onClose, items, triggerRef }) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (triggerRef?.current && triggerRef.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return (
    <div className="rpt-menu-in" style={{
      position:'absolute', right:0, top:'calc(100% + 4px)',
      background:RC.bgSurface, border:`1px solid ${RC.border}`,
      borderRadius:10, boxShadow:RC.sh2, zIndex:500,
      minWidth:180, padding:4, overflow:'hidden',
    }}>
      {items.map((item, i) => {
        if (item.divider) {
          return <div key={`d${i}`} style={{ height:1, background:RC.border, margin:'4px 6px' }} />;
        }
        return (
          <button key={item.id} onClick={() => { item.onClick(); onClose(); }}
            style={{
              display:'flex', alignItems:'center', gap:8,
              width:'100%', padding:'9px 12px', border:'none',
              background:'transparent', cursor:'pointer',
              fontFamily:RFB, fontSize:13, fontWeight:item.muted ? 400 : 500,
              color:item.muted ? RC.fgMid : RC.fg,
              borderRadius:6, textAlign:'left', transition:'background 100ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = RC.bgSubtle; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            {item.icon && <span style={{ flexShrink:0, color: item.muted ? RC.fgMuted : RC.fgMid }}>{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── REPORT MODAL — 3 pasos ──────────────────────────────────── */
// Inject sheet animation once
(function() {
  if (document.getElementById('rpt-sheet-style')) return;
  const s = document.createElement('style');
  s.id = 'rpt-sheet-style';
  s.textContent = `@keyframes rptSheetUp{from{transform:translateY(100%)}to{transform:none}}.rpt-sheet-in{animation:rptSheetUp 300ms cubic-bezier(0.16,1,0.3,1) both}`;
  document.head.appendChild(s);
})();

function ReportModal({ context, entityType, entityName, onClose }) {
  const [step, setStep]     = React.useState('reason'); // reason | description | done
  const [reason, setReason] = React.useState(null);
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting]   = React.useState(false);
  const [error, setError]   = React.useState(null);
  const [animDir, setAnimDir] = React.useState('fwd'); // fwd | back
  const bodyRef = React.useRef(null);

  const title = entityType === 'usuario' ? 'Reportar usuario' : 'Reportar objeto';

  function handleBack() {
    setAnimDir('back');
    if (step === 'description') { setStep('reason'); setError(null); }
    else { onClose(); }
  }

  function handleNext() {
    if (!reason) return;
    setAnimDir('fwd');
    setStep('description');
  }

  function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    // Simula llamada API — 1.2s
    setTimeout(() => {
      const outcomes = ['ok', 'duplicate', 'limit_entity', 'limit_total', 'not_reportable', 'recaptcha', 'generic'];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      if (result === 'ok') {
        setAnimDir('fwd');
        setStep('done');
        setSubmitting(false);
      } else {
        setError(result);
        setSubmitting(false);
      }
    }, 1200);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !submitting) handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [submitting]);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const animClass = animDir === 'fwd' ? 'rpt-step-fwd' : 'rpt-step-back';

  const reasonRefs = React.useRef({});
  const reasonListRef = React.useRef(null);

  function handleReasonKey(e, idx) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < REASONS.length - 1) {
        const next = REASONS[idx + 1];
        if (next && reasonRefs.current[next.id]) reasonRefs.current[next.id].focus();
      } else {
        reasonRefs.current[REASONS[0].id]?.focus();
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) {
        const prev = REASONS[idx - 1];
        if (prev && reasonRefs.current[prev.id]) reasonRefs.current[prev.id].focus();
      } else {
        reasonRefs.current[REASONS[REASONS.length - 1].id]?.focus();
      }
    }
  }

  // Focus first reason on step 1 mount
  React.useEffect(() => {
    if (step === 'reason') {
      const firstId = REASONS[0].id;
      const el = reasonRefs.current[firstId];
      if (el) setTimeout(() => el.focus(), 100);
    }
  }, [step]);

  /* ── STEP 1: Reason selection ─────────────────────────────── */
  function renderReasonStep() {
    return (
      <div className={animClass} key="step1">
        <div style={{ fontFamily:RFB, fontSize:14, color:RC.fgMid, marginBottom:16, lineHeight:1.5 }}>
          ¿Qué tipo de problema quieres reportar?
        </div>

        <div ref={reasonListRef} role="listbox" aria-label="Motivos de reporte"
          style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {REASONS.map((r, idx) => {
            const sel = reason === r.id;
            return (
              <button key={r.id} ref={el => reasonRefs.current[r.id] = el}
                role="option" aria-selected={sel}
                onClick={() => setReason(r.id)}
                onKeyDown={e => handleReasonKey(e, idx)}
                style={{
                  display:'block', width:'100%', textAlign:'left',
                  padding:'12px 14px', border:'none', cursor:'pointer',
                  borderRadius:10, fontFamily:RFB,
                  background: sel ? RC.primaryLight : RC.bgPage,
                  border: `1.5px solid ${sel ? RC.primary : RC.border}`,
                  transition:'all 150ms', outline:'none',
                }}>
                <div style={{
                  fontSize:14, fontWeight: sel ? 600 : 500,
                  color: sel ? RC.primary : RC.fg,
                  marginBottom: r.sublabel ? 3 : 0,
                }}>
                  {r.label}
                </div>
                {r.sublabel && (
                  <div style={{
                    fontSize:12, fontWeight:400,
                    color: sel ? RC.primary : RC.fgMuted,
                    lineHeight:1.4, opacity: sel ? 0.85 : 1,
                  }}>
                    {r.sublabel}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          display:'flex', gap:10, justifyContent:'space-between',
          marginTop:24, paddingTop:16,
          borderTop:`1px solid ${RC.border}`,
        }}>
          <button onClick={onClose}
            style={{
              background:'none', border:'none', cursor:'pointer',
              padding:'10px 0', fontFamily:RFB, fontSize:14,
              fontWeight:500, color:RC.fgMid, transition:'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = RC.fg}
            onMouseLeave={e => e.currentTarget.style.color = RC.fgMid}>
            Cancelar
          </button>
          <button onClick={handleNext} disabled={!reason}
            style={{
              padding:'10px 24px', borderRadius:8, border:'none',
              cursor: reason ? 'pointer' : 'not-allowed',
              fontFamily:RFB, fontSize:14, fontWeight:600,
              background: reason ? RC.primary : RC.bgSubtle,
              color: reason ? '#fff' : RC.fgDisabled,
              transition:'all 150ms',
            }}>
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  /* ── STEP 2: Description ──────────────────────────────────── */
  function renderDescriptionStep() {
    const reasonLabel = REASONS.find(r => r.id === reason)?.label || '';
    const charsLeft = 500 - description.length;
    const nearLimit = description.length > 450;
    const disabled = submitting;

    return (
      <div className={animClass} key="step2">
        {/* Summary of previous step */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 14px', background:RC.bgSubtle, borderRadius:8,
          marginBottom:16,
        }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:RC.fgMuted,
              textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>
              Motivo seleccionado
            </div>
            <div style={{ fontSize:13, fontWeight:500, color:RC.fg }}>
              {reasonLabel}
            </div>
          </div>
          <button onClick={() => { setAnimDir('back'); setStep('reason'); setError(null); }}
            disabled={disabled}
            style={{
              background:'none', border:'none', cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily:RFB, fontSize:12, fontWeight:600, color:RC.primary,
              padding:'4px 6px', borderRadius:6, opacity: disabled ? 0.4 : 1,
              transition:'background 100ms', flexShrink:0,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = RC.primaryLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            Cambiar
          </button>
        </div>

        {/* Textarea */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{
            fontFamily:RFB, fontSize:13, fontWeight:500, color:RC.fg,
            display:'flex', alignItems:'center', gap:4,
          }}>
            Descripción adicional
            <span style={{ fontWeight:400, color:RC.fgMuted }}>(opcional)</span>
          </label>
          <div style={{ position:'relative' }}>
            <textarea
              value={description}
              onChange={e => { if (e.target.value.length <= 500) setDescription(e.target.value); }}
              disabled={disabled}
              placeholder="Añade cualquier detalle que pueda ayudar en la revisión."
              maxLength={500}
              style={{
                width:'100%', minHeight:92, resize:'vertical',
                padding:'10px 12px', borderRadius:8, outline:'none',
                fontFamily:RFB, fontSize:14, lineHeight:1.55, color:RC.fg,
                background: disabled ? RC.bgSubtle : RC.bgSurface,
                border:`1.5px solid ${RC.border}`,
                transition:'border-color 150ms',
                cursor: disabled ? 'not-allowed' : undefined,
              }}
              onFocus={e => { if (!disabled) e.target.style.borderColor = RC.primary; }}
              onBlur={e => { e.target.style.borderColor = RC.border; }}
            />
            <div style={{
              position:'absolute', bottom:8, right:10,
              fontFamily:RFM, fontSize:11,
              color: nearLimit ? RC.warnFg : RC.fgMuted,
              transition:'color 150ms',
            }}>
              {description.length} / 500
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div style={{
          marginTop:12, fontSize:11.5, color:RC.fgMuted, lineHeight:1.5,
        }}>
          Tu identidad no será revelada al usuario reportado.
        </div>

        {/* Error block */}
        {error && (
          <div style={{
            marginTop:12, padding:'10px 14px', borderRadius:8,
            background:RC.errorBg, borderLeft:`3px solid ${RC.error}`,
            display:'flex', gap:10, alignItems:'flex-start',
          }}>
            <span style={{ color:RC.error, flexShrink:0, marginTop:1 }}>
              <IAlertTriangle sz={16}/>
            </span>
            <div style={{
              fontFamily:RFB, fontSize:13, color:RC.error, lineHeight:1.5,
            }}>
              {ERROR_MESSAGES[error] || ERROR_MESSAGES.generic}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display:'flex', gap:10, justifyContent:'space-between',
          marginTop:20, paddingTop:16,
          borderTop:`1px solid ${RC.border}`,
        }}>
          <button onClick={handleBack} disabled={disabled}
            style={{
              display:'flex', alignItems:'center', gap:4,
              background:'none', border:'none', cursor: disabled ? 'not-allowed' : 'pointer',
              padding:'10px 0', fontFamily:RFB, fontSize:14,
              fontWeight:500, color: disabled ? RC.fgDisabled : RC.fgMid,
              transition:'color 150ms', opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = RC.fg; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = RC.fgMid; }}>
            <IChevronLeft sz={14}/> Atrás
          </button>
          <button onClick={handleSubmit} disabled={disabled}
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'10px 24px', borderRadius:8, border:'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily:RFB, fontSize:14, fontWeight:600,
              background: disabled ? RC.bgSubtle : RC.primary,
              color: disabled ? RC.fgDisabled : '#fff',
              transition:'all 150ms',
            }}>
            {submitting && <ISpinner sz={15}/>}
            {submitting ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    );
  }

  /* ── STEP 3: Confirmation ──────────────────────────────────── */
  function renderDoneStep() {
    return (
      <div className={animClass} key="step3" style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', textAlign:'center',
        padding:'32px 16px',
      }}>
        <div style={{
          width:56, height:56, borderRadius:'50%',
          background:RC.successBg, display:'flex', alignItems:'center',
          justifyContent:'center', color:RC.successFg, marginBottom:16,
        }}>
          <ICheckCircle sz={28}/>
        </div>
        <h2 style={{
          fontFamily:RFD, fontSize:22, fontWeight:600, color:RC.fg,
          margin:'0 0 10px', lineHeight:1.2,
        }}>
          Reporte enviado
        </h2>
        <p style={{
          fontFamily:RFB, fontSize:14, color:RC.fgMid,
          lineHeight:1.65, maxWidth:340, margin:'0 0 24px',
        }}>
          Hemos recibido tu reporte. Lo revisaremos lo antes posible y
          te confirmaremos por email cuando hayamos tomado una decisión.
        </p>
        <button onClick={onClose}
          style={{
            padding:'10px 32px', borderRadius:8, border:`1.5px solid ${RC.border}`,
            background:RC.bgSurface, cursor:'pointer',
            fontFamily:RFB, fontSize:14, fontWeight:500, color:RC.fgMid,
            transition:'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = RC.bgSubtle; e.currentTarget.style.color = RC.fg; }}
          onMouseLeave={e => { e.currentTarget.style.background = RC.bgSurface; e.currentTarget.style.color = RC.fgMid; }}>
          Cerrar
        </button>
      </div>
    );
  }

  /* ── MODAL SHELL ──────────────────────────────────────────── */
  const stepContent = step === 'reason' ? renderReasonStep()
    : step === 'description' ? renderDescriptionStep()
    : renderDoneStep();

  return (
    <div className="rpt-fade-in" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:500,
        background:'rgba(20,23,26,0.45)',
        display:'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent:'center',
        padding: isMobile ? '0' : 16,
      }}>
      <div className={isMobile ? 'rpt-sheet-in' : 'rpt-modal-in'}
        onClick={e => e.stopPropagation()}
        style={{
          background:RC.bgSurface,
          borderRadius: isMobile ? '16px 16px 0 0' : 16,
          boxShadow: isMobile ? '0 -4px 16px rgba(0,0,0,0.12)' : RC.sh3,
          width:'100%', maxWidth: isMobile ? '100%' : 500,
          maxHeight: isMobile ? '85vh' : '90vh',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          margin: isMobile ? '0' : undefined,
        }}>
        {/* Header bar (always visible, includes close button) */}
        <div style={{
          display:'flex', alignItems:'center',
          padding: step === 'done' ? '18px 22px 0' : '18px 22px 0',
          justifyContent: step === 'done' ? 'flex-end' : 'space-between',
        }}>
          {step !== 'done' && (
            <div>
              <div style={{
                fontFamily:RFD, fontSize:18, fontWeight:600, color:RC.fg,
                lineHeight:1.2, marginBottom:2,
              }}>
                {title}
              </div>
              {entityName && (
                <div style={{
                  fontFamily:RFB, fontSize:12.5, color:RC.fgMuted,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  maxWidth:300,
                }}>
                  {entityName}
                </div>
              )}
            </div>
          )}
          <button onClick={handleClose}
            disabled={submitting}
            style={{
              width:30, height:30, borderRadius:'50%',
              background:RC.bgSubtle, border:'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:RC.fgMid, flexShrink:0, opacity: submitting ? 0.5 : 1,
              transition:'background 150ms', marginLeft:'auto',
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = RC.border; }}
            onMouseLeave={e => { e.currentTarget.style.background = RC.bgSubtle; }}>
            <IXCircle sz={16}/>
          </button>
        </div>

        {/* Body — scrollable */}
        <div ref={bodyRef} style={{
          flex:1, overflowY:'auto',
          padding: step === 'done' ? '0 22px 22px' : '18px 22px 22px',
        }}>
          {stepContent}
        </div>
      </div>
    </div>
  );
}

/* ── EXPORT ──────────────────────────────────────────────────── */
Object.assign(window, {
  ReportModal, ContextMenu, REASONS,
  RC, RFD, RFB, RFM,
  IFlag, IAlertTriangle, IChevronLeft, ISpinner, ICheckCircle,
});
