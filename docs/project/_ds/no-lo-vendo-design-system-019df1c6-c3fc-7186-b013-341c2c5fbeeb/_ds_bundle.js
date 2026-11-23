/* @ds-bundle: {"format":3,"namespace":"NoLoVendoDesignSystem_019df1","components":[],"sourceHashes":{"ui_kits/app/Components.jsx":"c9b5c02df290","ui_kits/app/DeliveryScreen.jsx":"541ce4789b65","ui_kits/app/ItemDetailScreen.jsx":"aaf0878f1364","ui_kits/app/ItemListScreen.jsx":"47ba6f1fc66a","ui_kits/app/ProfileScreen.jsx":"53a2558247a8"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NoLoVendoDesignSystem_019df1 = window.NoLoVendoDesignSystem_019df1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/app/Components.jsx
try { (() => {
// No Lo Vendo — Shared UI Components
// ui_kits/app/Components.jsx

const NLV_COLORS = {
  primary: '#3A7358',
  primaryLight: '#F0F5F2',
  primaryHover: '#2D5C45',
  accent: '#253F72',
  accentLight: '#EDF0F5',
  bgPage: '#F4F5F6',
  bgSurface: '#FFFFFF',
  bgSubtle: '#E8EAEC',
  fgPrimary: '#14171A',
  fgSecondary: '#606A76',
  fgMuted: '#7C8692',
  fgDisabled: '#9AA2AD',
  border: '#D5D9DE',
  borderStrong: '#B8BFC7',
  shadow1: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadow2: '0 4px 16px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
  shadow3: '0 8px 32px rgba(0,0,0,0.14)',
  statusActiveBg: '#F0F5F2',
  statusActiveFg: '#224633',
  statusActiveBorder: '#B5D0C2',
  statusReservedBg: '#FEF6E7',
  statusReservedFg: '#8F5907',
  statusReservedBorder: '#EDD090',
  statusCompletedBg: '#EBF5EE',
  statusCompletedFg: '#265533',
  statusCompletedBorder: '#9DCCA8',
  statusCancelledBg: '#FDECEA',
  statusCancelledFg: '#7D2419',
  statusCancelledBorder: '#E8A89E',
  statusDegradedBg: '#E8EAEC',
  statusDegradedFg: '#606A76',
  statusDegradedBorder: '#D5D9DE',
  infoBg: '#EDF0F5',
  infoFg: '#142244',
  infoBorder: '#A5B5D4',
  warningBg: '#FEF6E7',
  warningFg: '#8F5907',
  warningBorder: '#EDD090',
  errorBg: '#FDECEA',
  errorFg: '#7D2419',
  errorBorder: '#E8A89E',
  successBg: '#EBF5EE',
  successFg: '#265533',
  successBorder: '#9DCCA8'
};

// ── Navbar ──────────────────────────────────────────────────────────
function Navbar({
  page,
  onNavigate,
  user
}) {
  const navbarStyles = {
    wrapper: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: NLV_COLORS.bgSurface,
      borderBottom: `1px solid ${NLV_COLORS.border}`,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px'
    },
    brand: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      fontSize: 20,
      color: NLV_COLORS.primary,
      cursor: 'pointer',
      letterSpacing: '-0.01em',
      background: 'none',
      border: 'none'
    },
    nav: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    },
    navBtn: active => ({
      background: active ? NLV_COLORS.primaryLight : 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px 14px',
      borderRadius: 8,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      color: active ? NLV_COLORS.primary : NLV_COLORS.fgSecondary,
      transition: 'all 150ms ease'
    }),
    avatar: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: NLV_COLORS.primaryLight,
      border: `1.5px solid ${NLV_COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 13,
      color: NLV_COLORS.primary
    },
    pubBtn: {
      background: NLV_COLORS.primary,
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      transition: 'all 150ms ease',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: navbarStyles.wrapper
  }, /*#__PURE__*/React.createElement("button", {
    style: navbarStyles.brand,
    onClick: () => onNavigate('list')
  }, "no lo vendo"), /*#__PURE__*/React.createElement("div", {
    style: navbarStyles.nav
  }, /*#__PURE__*/React.createElement("button", {
    style: navbarStyles.navBtn(page === 'list'),
    onClick: () => onNavigate('list')
  }, "Explorar"), /*#__PURE__*/React.createElement("button", {
    style: navbarStyles.navBtn(page === 'myitems'),
    onClick: () => onNavigate('myitems')
  }, "Mis objetos"), /*#__PURE__*/React.createElement("button", {
    style: navbarStyles.navBtn(page === 'delivery'),
    onClick: () => onNavigate('delivery')
  }, "Entregas"), /*#__PURE__*/React.createElement("button", {
    style: navbarStyles.navBtn(page === 'profile'),
    onClick: () => onNavigate('profile')
  }, "Perfil")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: navbarStyles.pubBtn,
    onClick: () => onNavigate('publish')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })), "Publicar"), /*#__PURE__*/React.createElement("div", {
    style: navbarStyles.avatar,
    onClick: () => onNavigate('profile')
  }, user ? user.initials : 'U')));
}

// ── StatusBadge ────────────────────────────────────────────────────
function StatusBadge({
  status
}) {
  const configs = {
    active: {
      label: 'activo',
      bg: NLV_COLORS.statusActiveBg,
      fg: NLV_COLORS.statusActiveFg,
      border: NLV_COLORS.statusActiveBorder,
      dot: NLV_COLORS.accent
    },
    reserved: {
      label: 'reservado',
      bg: NLV_COLORS.statusReservedBg,
      fg: NLV_COLORS.statusReservedFg,
      border: NLV_COLORS.statusReservedBorder,
      dot: '#D4870A'
    },
    completed: {
      label: 'completado',
      bg: NLV_COLORS.statusCompletedBg,
      fg: NLV_COLORS.statusCompletedFg,
      border: NLV_COLORS.statusCompletedBorder,
      dot: '#3A7B4A'
    },
    cancelled: {
      label: 'cancelado',
      bg: NLV_COLORS.statusCancelledBg,
      fg: NLV_COLORS.statusCancelledFg,
      border: NLV_COLORS.statusCancelledBorder,
      dot: '#B33A2A'
    },
    degraded: {
      label: 'degradado',
      bg: NLV_COLORS.statusDegradedBg,
      fg: NLV_COLORS.statusDegradedFg,
      border: NLV_COLORS.statusDegradedBorder,
      dot: NLV_COLORS.fgMuted
    },
    paused: {
      label: 'pausado',
      bg: NLV_COLORS.infoBg,
      fg: NLV_COLORS.infoFg,
      border: NLV_COLORS.infoBorder,
      dot: '#2A6CB3'
    }
  };
  const c = configs[status] || configs.active;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 500,
      lineHeight: 1,
      padding: '3px 9px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      border: `1px solid ${c.border}`,
      fontFamily: "'DM Sans', system-ui, sans-serif"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: c.dot,
      flexShrink: 0
    }
  }), c.label);
}

// ── RepChip ────────────────────────────────────────────────────────
function RepChip({
  score
}) {
  const pos = score > 0;
  const zero = score === 0;
  const bg = pos ? NLV_COLORS.statusCompletedBg : zero ? NLV_COLORS.bgSubtle : NLV_COLORS.statusCancelledBg;
  const fg = pos ? NLV_COLORS.statusCompletedFg : zero ? NLV_COLORS.fgMuted : NLV_COLORS.statusCancelledFg;
  const border = pos ? NLV_COLORS.statusCompletedBorder : zero ? NLV_COLORS.border : NLV_COLORS.statusCancelledBorder;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      fontWeight: 500,
      padding: '2px 9px',
      borderRadius: 999,
      background: bg,
      color: fg,
      border: `1px solid ${border}`
    }
  }, pos ? '+' : '', score);
}

// ── Button ─────────────────────────────────────────────────────────
function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  fullWidth,
  style: extraStyle
}) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 8,
    lineHeight: 1,
    transition: 'all 150ms ease',
    width: fullWidth ? '100%' : undefined,
    transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
    opacity: disabled ? 0.55 : 1,
    ...(size === 'lg' ? {
      fontSize: 16,
      padding: '12px 24px'
    } : size === 'sm' ? {
      fontSize: 12,
      padding: '7px 14px'
    } : {
      fontSize: 14,
      padding: '10px 20px'
    })
  };
  const variantStyles = {
    primary: {
      background: disabled ? NLV_COLORS.bgSubtle : hovered ? NLV_COLORS.primaryHover : NLV_COLORS.primary,
      color: disabled ? NLV_COLORS.fgDisabled : '#fff',
      boxShadow: hovered && !disabled ? NLV_COLORS.shadow1 : 'none'
    },
    secondary: {
      background: hovered && !disabled ? NLV_COLORS.primaryLight : NLV_COLORS.bgSurface,
      color: disabled ? NLV_COLORS.fgDisabled : NLV_COLORS.primary,
      border: `1.5px solid ${disabled ? NLV_COLORS.border : NLV_COLORS.primary}`
    },
    ghost: {
      background: hovered && !disabled ? NLV_COLORS.primaryLight : 'transparent',
      color: disabled ? NLV_COLORS.fgDisabled : NLV_COLORS.primary
    },
    destructive: {
      background: hovered && !disabled ? '#7D2419' : '#B33A2A',
      color: '#fff'
    },
    accent: {
      background: hovered && !disabled ? '#55633A' : NLV_COLORS.accent,
      color: '#fff'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    style: {
      ...base,
      ...variantStyles[variant],
      ...extraStyle
    },
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    disabled: disabled
  }, children);
}

// ── Input ──────────────────────────────────────────────────────────
function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  helper,
  type = 'text',
  disabled
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 14,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: 14,
      color: NLV_COLORS.fgPrimary,
      background: disabled ? NLV_COLORS.bgSubtle : NLV_COLORS.bgSurface,
      border: `1.5px solid ${error ? '#B33A2A' : focused ? NLV_COLORS.primary : NLV_COLORS.border}`,
      borderRadius: 8,
      padding: '10px 12px',
      outline: 'none',
      boxShadow: focused && !error ? '0 0 0 3px rgba(197,96,58,0.18)' : 'none',
      transition: 'all 150ms ease',
      width: '100%',
      boxSizing: 'border-box'
    }
  }), (error || helper) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 12,
      color: error ? '#B33A2A' : NLV_COLORS.fgMuted
    }
  }, error || helper));
}

// ── Card shell ─────────────────────────────────────────────────────
function Card({
  children,
  style: extraStyle,
  onClick,
  hoverable
}) {
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: NLV_COLORS.bgSurface,
      border: `1px solid ${hovered && hoverable ? NLV_COLORS.borderStrong : NLV_COLORS.border}`,
      borderRadius: 12,
      boxShadow: hovered && hoverable ? NLV_COLORS.shadow2 : NLV_COLORS.shadow1,
      transition: 'all 200ms ease',
      cursor: onClick ? 'pointer' : undefined,
      overflow: 'hidden',
      ...extraStyle
    },
    onClick: onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, children);
}

// ── Icon (inline SVG paths from Lucide) ───────────────────────────
const ICONS = {
  package: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  gift: 'M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  clock: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 6v6l4 2',
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  'x-circle': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM15 9l-6 6M9 9l6 6',
  'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-left': 'M15 18l-6-6 6-6',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'trending-up': 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  trash: 'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2',
  camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  'log-out': 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  'pause-circle': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM10 9v6M14 9v6',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  image: 'M21 15l-5-5L5 21M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6'
};
function Icon({
  name,
  size = 16,
  color,
  style: extraStyle
}) {
  const d = ICONS[name];
  if (!d) return null;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color || 'currentColor',
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      ...extraStyle
    }
  }, d.split('M').filter(Boolean).map((seg, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: 'M' + seg
  })));
}

// ── ImagePlaceholder ───────────────────────────────────────────────
function ImagePlaceholder({
  width,
  height,
  style: extraStyle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      background: NLV_COLORS.bgSubtle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: NLV_COLORS.fgMuted,
      ...extraStyle
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 28
  }));
}

// ── EmptyState ─────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  subtitle,
  action,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '56px 24px',
      gap: 12,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: NLV_COLORS.primaryLight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: NLV_COLORS.primary,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon || 'package',
    size: 24,
    color: NLV_COLORS.primary
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 16,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 14,
      color: NLV_COLORS.fgMuted,
      maxWidth: 280
    }
  }, subtitle), action && /*#__PURE__*/React.createElement(Button, {
    onClick: onAction,
    style: {
      marginTop: 8
    }
  }, action));
}

// ── PageShell ──────────────────────────────────────────────────────
function PageShell({
  children,
  maxWidth = 1140
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: NLV_COLORS.bgPage,
      minHeight: '100vh',
      fontFamily: "'DM Sans', system-ui, sans-serif"
    }
  }, children);
}
function PageContent({
  children,
  style: extraStyle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: '0 auto',
      padding: '32px 24px',
      ...extraStyle
    }
  }, children);
}

// ── Modal ──────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  title,
  children,
  width = 480
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: NLV_COLORS.bgSurface,
      borderRadius: 16,
      boxShadow: NLV_COLORS.shadow3,
      width: '100%',
      maxWidth: width,
      overflow: 'hidden'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      fontFamily: "'DM Sans',system-ui,sans-serif"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: NLV_COLORS.fgMuted,
      padding: 4,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x-circle",
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px 24px'
    }
  }, children)));
}

// Export all to window for cross-script access
Object.assign(window, {
  NLV_COLORS,
  Navbar,
  StatusBadge,
  RepChip,
  Button,
  Input,
  Card,
  Icon,
  ICONS,
  ImagePlaceholder,
  EmptyState,
  PageShell,
  PageContent,
  Modal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/DeliveryScreen.jsx
try { (() => {
// No Lo Vendo — Delivery Session Screen
// ui_kits/app/DeliveryScreen.jsx

function DeliveryScreen({
  onNavigate
}) {
  const [sessionStatus, setSessionStatus] = React.useState('active'); // active | completed | cancelled
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [noShow, setNoShow] = React.useState(false);
  const [role, setRole] = React.useState('donor'); // donor | receiver

  const deadlineDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  const daysLeft = 4;
  function handleConfirm() {
    setSessionStatus('completed');
    setShowConfirmModal(false);
  }
  function handleCancel() {
    setSessionStatus('cancelled');
    setShowCancelModal(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 620,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginBottom: 24,
      background: NLV_COLORS.bgSubtle,
      borderRadius: 10,
      padding: 4,
      alignSelf: 'flex-start',
      width: 'fit-content'
    }
  }, ['donor', 'receiver'].map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setRole(r),
    style: {
      background: role === r ? NLV_COLORS.bgSurface : 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '6px 14px',
      borderRadius: 7,
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 13,
      fontWeight: role === r ? 600 : 400,
      color: role === r ? NLV_COLORS.fgPrimary : NLV_COLORS.fgMuted,
      boxShadow: role === r ? NLV_COLORS.shadow1 : 'none',
      transition: 'all 150ms ease'
    }
  }, r === 'donor' ? 'Vista donante' : 'Vista receptor'))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '24px',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 20,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      margin: '0 0 6px'
    }
  }, "Bicicleta de monta\xF1a Scott"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: NLV_COLORS.fgMuted
    }
  }, role === 'donor' ? 'Sesión activa · como donante' : 'Sesión activa · como receptor')), /*#__PURE__*/React.createElement(StatusBadge, {
    status: sessionStatus === 'active' ? 'active' : sessionStatus === 'completed' ? 'completed' : 'cancelled'
  })), sessionStatus === 'active' && /*#__PURE__*/React.createElement("div", {
    style: {
      background: daysLeft <= 2 ? NLV_COLORS.warningBg : NLV_COLORS.bgSubtle,
      border: `1px solid ${daysLeft <= 2 ? NLV_COLORS.warningBorder : NLV_COLORS.border}`,
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 16,
    color: daysLeft <= 2 ? NLV_COLORS.warningFg : NLV_COLORS.fgMuted
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: daysLeft <= 2 ? NLV_COLORS.warningFg : NLV_COLORS.fgPrimary
    }
  }, daysLeft, " d\xEDas restantes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted
    }
  }, "Plazo: ", deadlineDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })))), sessionStatus === 'completed' && /*#__PURE__*/React.createElement("div", {
    style: {
      background: NLV_COLORS.statusCompletedBg,
      border: `1px solid ${NLV_COLORS.statusCompletedBorder}`,
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 16,
    color: NLV_COLORS.statusCompletedFg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: NLV_COLORS.statusCompletedFg
    }
  }, "Entrega completada \u2014 reputaci\xF3n actualizada (+10)")), sessionStatus === 'cancelled' && /*#__PURE__*/React.createElement("div", {
    style: {
      background: NLV_COLORS.statusCancelledBg,
      border: `1px solid ${NLV_COLORS.statusCancelledBorder}`,
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x-circle",
    size: 16,
    color: NLV_COLORS.statusCancelledFg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: NLV_COLORS.statusCancelledFg
    }
  }, "Sesi\xF3n cancelada")), role === 'receiver' && sessionStatus === 'active' && /*#__PURE__*/React.createElement("div", {
    style: {
      background: NLV_COLORS.primaryLight,
      border: `1px solid ${NLV_COLORS.color_primary_200 || '#F2C4AC'}`,
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: NLV_COLORS.primary,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, "Canal de contacto del donante"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, "WhatsApp +34 600 000 000")), role === 'donor' && sessionStatus === 'active' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    onClick: () => setShowConfirmModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 14
  }), "Confirmar entrega"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setShowCancelModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x-circle",
    size: 14
  }), "Cancelar sesi\xF3n")), sessionStatus !== 'active' && /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNavigate('list')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14
  }), "Volver al explorador")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 16,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      marginBottom: 12
    }
  }, "Mis sesiones de entrega"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, [{
    title: 'Aspiradora Dyson V10',
    role: 'donor',
    status: 'completed',
    days: null
  }, {
    title: 'Silla ergonómica',
    role: 'receiver',
    status: 'expired',
    days: null
  }].map((s, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    style: {
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted,
      marginTop: 2
    }
  }, "como ", s.role === 'donor' ? 'donante' : 'receptor')), /*#__PURE__*/React.createElement(StatusBadge, {
    status: s.status
  }))))), /*#__PURE__*/React.createElement(Modal, {
    open: showConfirmModal,
    onClose: () => setShowConfirmModal(false),
    title: "Confirmar entrega"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: NLV_COLORS.fgSecondary,
      margin: 0
    }
  }, "\xBFConfirmas que la entrega se ha completado? Esta acci\xF3n no se puede deshacer. Se actualizar\xE1 la reputaci\xF3n de ambas partes (+10)."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setShowConfirmModal(false)
  }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    onClick: handleConfirm
  }, "Confirmar entrega")))), /*#__PURE__*/React.createElement(Modal, {
    open: showCancelModal,
    onClose: () => setShowCancelModal(false),
    title: "Cancelar sesi\xF3n"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: NLV_COLORS.fgSecondary,
      margin: 0
    }
  }, "\xBFDeseas cancelar esta sesi\xF3n de entrega?"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setNoShow(v => !v),
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 10,
      background: noShow ? NLV_COLORS.statusCancelledBg : NLV_COLORS.bgSubtle,
      border: `1px solid ${noShow ? NLV_COLORS.statusCancelledBorder : NLV_COLORS.border}`,
      cursor: 'pointer',
      transition: 'all 150ms ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 4,
      flexShrink: 0,
      marginTop: 1,
      background: noShow ? '#B33A2A' : NLV_COLORS.bgSurface,
      border: `2px solid ${noShow ? '#B33A2A' : NLV_COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, noShow && /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 11,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, "El receptor no se present\xF3 (no-show)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted
    }
  }, "Aplicar\xE1 penalizaci\xF3n de reputaci\xF3n al receptor."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setShowCancelModal(false)
  }, "Volver"), /*#__PURE__*/React.createElement(Button, {
    variant: "destructive",
    onClick: handleCancel
  }, "Cancelar sesi\xF3n")))));
}
Object.assign(window, {
  DeliveryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/DeliveryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ItemDetailScreen.jsx
try { (() => {
// No Lo Vendo — Item Detail Screen
// ui_kits/app/ItemDetailScreen.jsx

const SAMPLE_CANDIDATES = [{
  requestId: 'r1',
  userId: 'u1',
  reputationScore: 85,
  distanceMeters: 3200,
  requestDate: '2026-05-01T10:00:00Z'
}, {
  requestId: 'r2',
  userId: 'u2',
  reputationScore: 42,
  distanceMeters: 1100,
  requestDate: '2026-05-02T08:00:00Z'
}, {
  requestId: 'r3',
  userId: 'u3',
  reputationScore: -18,
  distanceMeters: 7400,
  requestDate: '2026-04-30T15:00:00Z'
}];
function ImageGallery({
  count = 3
}) {
  const [active, setActive] = React.useState(0);
  const imgs = Array.from({
    length: count
  }, (_, i) => i);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      aspectRatio: '4/3',
      background: NLV_COLORS.bgSubtle,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: NLV_COLORS.fgMuted
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 48
  })), count > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, imgs.map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => setActive(i),
    style: {
      width: 56,
      height: 44,
      borderRadius: 6,
      cursor: 'pointer',
      overflow: 'hidden',
      background: NLV_COLORS.bgSubtle,
      border: `2px solid ${active === i ? NLV_COLORS.primary : 'transparent'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: NLV_COLORS.fgMuted,
      flexShrink: 0,
      transition: 'border-color 150ms ease'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 18
  })))));
}
function CandidateRow({
  candidate,
  rank,
  onSelect
}) {
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      background: hovered ? NLV_COLORS.bgSubtle : NLV_COLORS.bgSurface,
      borderBottom: `1px solid ${NLV_COLORS.border}`,
      transition: 'background 150ms ease',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: rank === 1 ? NLV_COLORS.primaryLight : NLV_COLORS.bgSubtle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: rank === 1 ? NLV_COLORS.primary : NLV_COLORS.fgMuted,
      flexShrink: 0
    }
  }, rank), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, "Usuario an\xF3nimo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted,
      display: 'flex',
      gap: 10,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", null, (candidate.distanceMeters / 1000).toFixed(1), " km"), /*#__PURE__*/React.createElement("span", null, "hace ", Math.floor((Date.now() - new Date(candidate.requestDate)) / 86400000), " d\xEDas")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(RepChip, {
    score: candidate.reputationScore
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onSelect(candidate)
  }, "Seleccionar")));
}
function ItemDetailScreen({
  item,
  onBack,
  isDonor = false,
  onNavigate
}) {
  const [requested, setRequested] = React.useState(false);
  const [showCandidates, setShowCandidates] = React.useState(isDonor);
  const [selectModal, setSelectModal] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [contactChannel, setContactChannel] = React.useState('');
  const [requestsPaused, setRequestsPaused] = React.useState(false);
  if (!item) return null;
  function handleSelect(candidate) {
    setSelectedCandidate(candidate);
    setSelectModal(true);
  }
  function confirmSelection() {
    setSelectModal(false);
    onNavigate('delivery');
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: NLV_COLORS.fgSecondary,
      fontSize: 14,
      padding: '0 0 20px',
      fontFamily: "'DM Sans',system-ui,sans-serif"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 16
  }), "Volver al listado"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr',
      gap: 32,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(ImageGallery, {
    count: 3
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 22,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      margin: 0,
      lineHeight: 1.3
    }
  }, item.title), /*#__PURE__*/React.createElement(StatusBadge, {
    status: item.degradedAt ? 'degraded' : item.status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: NLV_COLORS.fgMuted,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), (item.distanceMeters / 1000).toFixed(1), " km"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: NLV_COLORS.fgMuted
    }
  }, "Condici\xF3n: ", item.condition)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: NLV_COLORS.fgSecondary,
      lineHeight: 1.65,
      marginBottom: 16
    }
  }, "Objeto en buen estado, usado durante dos temporadas. Sin golpes ni ara\xF1azos visibles. Se entrega con accesorios originales."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 10,
      background: NLV_COLORS.bgSubtle,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: NLV_COLORS.fgSecondary
    }
  }, "Donante"), /*#__PURE__*/React.createElement(RepChip, {
    score: 72
  })), isDonor ?
  /*#__PURE__*/
  /* Donor controls */
  React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: NLV_COLORS.bgSubtle,
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, "Pausar solicitudes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted
    }
  }, "Bloquea nuevas solicitudes temporalmente")), /*#__PURE__*/React.createElement("div", {
    onClick: () => setRequestsPaused(p => !p),
    style: {
      width: 40,
      height: 22,
      borderRadius: 99,
      background: requestsPaused ? NLV_COLORS.primary : NLV_COLORS.border,
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 200ms ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: requestsPaused ? 21 : 3,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 200ms ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setShowCandidates(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 14
  }), showCandidates ? 'Ocultar candidatos' : 'Ver candidatos (3)'), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 14
  }), "Cancelar objeto")) :
  /*#__PURE__*/
  /* Receiver controls */
  React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, requestsPaused && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderRadius: 10,
      background: NLV_COLORS.infoBg,
      border: `1px solid ${NLV_COLORS.infoBorder}`,
      fontSize: 13,
      color: NLV_COLORS.infoFg
    }
  }, "Las solicitudes est\xE1n temporalmente pausadas por el donante."), requested ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderRadius: 10,
      background: NLV_COLORS.statusCompletedBg,
      border: `1px solid ${NLV_COLORS.statusCompletedBorder}`,
      fontSize: 14,
      color: NLV_COLORS.statusCompletedFg,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 16,
    color: NLV_COLORS.statusCompletedFg
  }), "Solicitud enviada") : /*#__PURE__*/React.createElement(Button, {
    disabled: requestsPaused,
    onClick: () => setRequested(true),
    fullWidth: true
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 14
  }), "Solicitar objeto")))), isDonor && showCandidates && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 17,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      marginBottom: 12
    }
  }, "Candidatos \u2014 ordenados por el sistema"), /*#__PURE__*/React.createElement(Card, null, SAMPLE_CANDIDATES.map((c, i) => /*#__PURE__*/React.createElement(CandidateRow, {
    key: c.requestId,
    candidate: c,
    rank: i + 1,
    onSelect: handleSelect
  })))), /*#__PURE__*/React.createElement(Modal, {
    open: selectModal,
    onClose: () => setSelectModal(false),
    title: "Seleccionar receptor"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: NLV_COLORS.fgSecondary,
      margin: 0
    }
  }, "Introduce el canal de contacto para que el receptor pueda coordinarse contigo. Solo se revela al receptor cuando la sesi\xF3n est\xE1 activa."), /*#__PURE__*/React.createElement(Input, {
    label: "Canal de contacto",
    placeholder: "Ej: WhatsApp +34 600 000 000 / Telegram @usuario",
    value: contactChannel,
    onChange: e => setContactChannel(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setSelectModal(false)
  }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
    disabled: !contactChannel.trim(),
    onClick: confirmSelection
  }, "Confirmar selecci\xF3n")))));
}
Object.assign(window, {
  ItemDetailScreen,
  SAMPLE_CANDIDATES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ItemDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ItemListScreen.jsx
try { (() => {
// No Lo Vendo — Item List Screen
// ui_kits/app/ItemListScreen.jsx

const SAMPLE_ITEMS = [{
  id: '1',
  title: 'Bicicleta de montaña Scott',
  condition: 'bueno',
  status: 'active',
  distanceMeters: 2300,
  degradedAt: null,
  images: [],
  createdAt: '2026-04-28'
}, {
  id: '2',
  title: 'Mesa de escritorio IKEA',
  condition: 'aceptable',
  status: 'active',
  distanceMeters: 8100,
  degradedAt: '2026-04-25',
  images: [],
  createdAt: '2026-04-18'
}, {
  id: '3',
  title: 'Aspiradora Dyson V10',
  condition: 'como nuevo',
  status: 'active',
  distanceMeters: 1100,
  degradedAt: null,
  images: [],
  createdAt: '2026-05-01'
}, {
  id: '4',
  title: 'Silla ergonómica de oficina',
  condition: 'bueno',
  status: 'active',
  distanceMeters: 4200,
  degradedAt: null,
  images: [],
  createdAt: '2026-04-30'
}, {
  id: '5',
  title: 'Colección libros ciencia ficción',
  condition: 'bueno',
  status: 'active',
  distanceMeters: 3700,
  degradedAt: null,
  images: [],
  createdAt: '2026-04-29'
}, {
  id: '6',
  title: 'Lámpara de pie de diseño',
  condition: 'como nuevo',
  status: 'active',
  distanceMeters: 6400,
  degradedAt: '2026-04-20',
  images: [],
  createdAt: '2026-04-15'
}, {
  id: '7',
  title: 'Cámara réflex Canon 600D',
  condition: 'bueno',
  status: 'active',
  distanceMeters: 9200,
  degradedAt: null,
  images: [],
  createdAt: '2026-05-02'
}, {
  id: '8',
  title: 'Robot de cocina Thermomix',
  condition: 'aceptable',
  status: 'active',
  distanceMeters: 5100,
  degradedAt: null,
  images: [],
  createdAt: '2026-04-27'
}];
function formatDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}
function ItemCard({
  item,
  onClick
}) {
  const isDegraded = !!item.degradedAt;
  return /*#__PURE__*/React.createElement(Card, {
    hoverable: true,
    onClick: onClick,
    style: {
      opacity: isDegraded ? 0.65 : 1,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(ImagePlaceholder, {
    width: "100%",
    height: 140
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary,
      marginBottom: 6,
      lineHeight: 1.35,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: isDegraded ? 'degraded' : item.status
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted,
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 12
  }), formatDist(item.distanceMeters))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 12,
      color: NLV_COLORS.fgMuted
    }
  }, item.condition)));
}
function ItemListScreen({
  onSelectItem,
  onNavigate
}) {
  const [search, setSearch] = React.useState('');
  const filtered = SAMPLE_ITEMS.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  // Degraded items sorted to end
  const sorted = [...filtered].sort((a, b) => {
    if (!!a.degradedAt === !!b.degradedAt) return 0;
    return a.degradedAt ? 1 : -1;
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 24,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      margin: 0
    }
  }, "Explorar objetos"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 14,
      color: NLV_COLORS.fgMuted
    }
  }, sorted.length, " objetos disponibles a menos de 50 km")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Buscar objetos\u2026",
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 14,
      color: NLV_COLORS.fgPrimary,
      background: NLV_COLORS.bgSurface,
      border: `1.5px solid ${NLV_COLORS.border}`,
      borderRadius: 8,
      padding: '9px 12px 9px 36px',
      outline: 'none',
      width: 220
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      color: NLV_COLORS.fgMuted,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "filter",
    size: 14
  }))))), sorted.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "package",
    title: "Sin resultados",
    subtitle: "No hay objetos que coincidan con tu b\xFAsqueda."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 16
    }
  }, sorted.map(item => /*#__PURE__*/React.createElement(ItemCard, {
    key: item.id,
    item: item,
    onClick: () => onSelectItem(item)
  }))));
}
Object.assign(window, {
  ItemListScreen,
  SAMPLE_ITEMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ItemListScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ProfileScreen.jsx
try { (() => {
// No Lo Vendo — Profile Screen
// ui_kits/app/ProfileScreen.jsx

const SAMPLE_REP_HISTORY = [{
  id: 'e1',
  type: 'delivery_completed',
  delta: 10,
  createdAt: '2026-04-28T12:00:00Z'
}, {
  id: 'e2',
  type: 'delivery_completed',
  delta: 10,
  createdAt: '2026-03-15T09:30:00Z'
}, {
  id: 'e3',
  type: 'no_show',
  delta: -20,
  createdAt: '2026-02-10T14:00:00Z'
}, {
  id: 'e4',
  type: 'delivery_completed',
  delta: 10,
  createdAt: '2026-01-05T11:00:00Z'
}];
const SAMPLE_MY_ITEMS = [{
  id: 'm1',
  title: 'Bicicleta de montaña Scott',
  condition: 'bueno',
  status: 'completed',
  createdAt: '2026-02-01',
  completedAt: '2026-02-15',
  degradedAt: null,
  images: []
}, {
  id: 'm2',
  title: 'Mesa de escritorio IKEA',
  condition: 'aceptable',
  status: 'active',
  createdAt: '2026-04-18',
  completedAt: null,
  degradedAt: '2026-04-25',
  images: []
}, {
  id: 'm3',
  title: 'Lámpara de pie',
  condition: 'como nuevo',
  status: 'cancelled',
  createdAt: '2026-03-10',
  completedAt: null,
  degradedAt: null,
  images: []
}];
function StatCard({
  label,
  value,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 100,
      background: NLV_COLORS.bgSurface,
      border: `1px solid ${NLV_COLORS.border}`,
      borderRadius: 12,
      padding: '16px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: 24,
      fontWeight: 700,
      color: NLV_COLORS.fgPrimary
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: NLV_COLORS.fgMuted
    }
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: NLV_COLORS.fgMuted
    }
  }, sub));
}
function RepEventRow({
  event
}) {
  const pos = event.delta > 0;
  const label = event.type === 'delivery_completed' ? 'Entrega completada' : 'No-show declarado';
  const date = new Date(event.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: `1px solid ${NLV_COLORS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      flexShrink: 0,
      background: pos ? NLV_COLORS.statusCompletedBg : NLV_COLORS.statusCancelledBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: pos ? NLV_COLORS.statusCompletedFg : NLV_COLORS.statusCancelledFg
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: pos ? 'check-circle' : 'x-circle',
    size: 15
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted
    }
  }, date))), /*#__PURE__*/React.createElement(RepChip, {
    score: event.delta
  }));
}
function ProfileScreen({
  onNavigate
}) {
  const [tab, setTab] = React.useState('donations');
  const tabs = [{
    id: 'donations',
    label: 'Donaciones'
  }, {
    id: 'requests',
    label: 'Solicitudes'
  }, {
    id: 'reputation',
    label: 'Reputación'
  }];
  const totalScore = SAMPLE_REP_HISTORY.reduce((a, e) => a + e.delta, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '28px 28px 24px',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: NLV_COLORS.primaryLight,
      border: `2px solid ${NLV_COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      fontWeight: 700,
      color: NLV_COLORS.primary,
      flexShrink: 0
    }
  }, "M"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 20,
      fontWeight: 600,
      color: NLV_COLORS.fgPrimary,
      marginBottom: 4
    }
  }, "Mi perfil"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: NLV_COLORS.fgMuted,
      marginBottom: 12
    }
  }, "Miembro desde enero 2026 \xB7 Barcelona"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Reputaci\xF3n",
    value: totalScore > 0 ? `+${totalScore}` : totalScore
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Donados",
    value: "3"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Recibidos",
    value: "2"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "No-shows",
    value: "1",
    sub: "consecutivos: 0"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      borderBottom: `1px solid ${NLV_COLORS.border}`,
      marginBottom: 20
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setTab(t.id),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '10px 16px',
      fontFamily: "'DM Sans',system-ui,sans-serif",
      fontSize: 14,
      fontWeight: tab === t.id ? 600 : 400,
      color: tab === t.id ? NLV_COLORS.primary : NLV_COLORS.fgSecondary,
      borderBottom: `2px solid ${tab === t.id ? NLV_COLORS.primary : 'transparent'}`,
      marginBottom: -1,
      transition: 'all 150ms ease'
    }
  }, t.label))), tab === 'donations' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, SAMPLE_MY_ITEMS.map(item => /*#__PURE__*/React.createElement(Card, {
    key: item.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 14px',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 8,
      background: NLV_COLORS.bgSubtle,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: NLV_COLORS.fgMuted
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "package",
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: NLV_COLORS.fgPrimary,
      marginBottom: 4,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: item.degradedAt ? 'degraded' : item.status
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: NLV_COLORS.fgMuted
    }
  }, item.condition)))))), tab === 'requests' && /*#__PURE__*/React.createElement(EmptyState, {
    icon: "send",
    title: "Sin solicitudes recientes",
    subtitle: "Tus solicitudes de objetos aparecer\xE1n aqu\xED.",
    action: "Explorar objetos",
    onAction: () => onNavigate('list')
  }), tab === 'reputation' && /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0 8px',
      fontSize: 13,
      color: NLV_COLORS.fgMuted
    }
  }, "Historial de eventos de reputaci\xF3n"), SAMPLE_REP_HISTORY.map(e => /*#__PURE__*/React.createElement(RepEventRow, {
    key: e.id,
    event: e
  }))));
}
Object.assign(window, {
  ProfileScreen,
  SAMPLE_REP_HISTORY,
  SAMPLE_MY_ITEMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

})();
