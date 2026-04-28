// Sidebar + Header + Banner primitives
const { useState: _useState1 } = React;

function Sidebar({ activeIdx = 0, onSelect = () => {} }) {
  const items = [
    { icon: 'calendar', label: 'Agenda' },
    { icon: 'pill', label: 'Servicios' },
    { icon: 'building', label: 'Consultas' },
    { icon: 'users', label: 'Pacientes' },
    { icon: 'star', label: 'Valoraciones' },
    { icon: 'megaphone', label: 'Marketing' },
    { icon: 'doc', label: 'Documentos' },
    { icon: 'chart', label: 'Estadísticas' },
    { icon: 'chat', label: 'Mensajes' },
    { icon: 'user', label: 'Perfil', avatar: true },
    { icon: 'gear', label: 'Ajustes' },
  ];
  const sbStyle = {
    width: 60, minHeight: '100vh', background: 'var(--grad-sidebar)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: 14, gap: 22, position: 'sticky', top: 0,
  };
  return (
    <aside style={sbStyle}>
      {items.map((it, i) => {
        const active = i === activeIdx;
        const base = { width: 36, height: 36, display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: 6, cursor: 'pointer',
          color: active ? 'var(--brand-cyan-dark)' : '#fff',
          background: active ? '#fff' : 'transparent', position: 'relative' };
        return (
          <div key={i} title={it.label} style={base} onClick={() => onSelect(i)}>
            <Icon name={it.icon} size={22} stroke={1.6} />
            {it.avatar && (
              <span style={{position:'absolute', top:4, right:4, width:8, height:8, borderRadius:'50%',
                background:'var(--danger)', border:'1.5px solid #fff'}}/>
            )}
          </div>
        );
      })}
    </aside>
  );
}

function PageHeader({ title, search, onSearch, clinic, onClinicClick, clinicOpen }) {
  const wrap = { display:'flex', alignItems:'center', padding:'12px 24px', gap:20,
    background:'#fff', minHeight: 64, position:'relative', zIndex: 5 };
  const burger = { width:40, height:40, borderRadius:6, background:'#fff',
    border:'1px solid var(--border-soft)', display:'flex', alignItems:'center',
    justifyContent:'center', color:'var(--brand-cyan-dark)' };
  return (
    <div style={wrap}>
      <div style={burger}><Icon name="menu" size={20}/></div>
      <h1 className="td-h1" style={{flex:1, textAlign:'center', margin:0, fontSize: 24}}>{title}</h1>
      <div style={{display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border-input)',
        borderRadius:4, padding:'6px 10px', background:'#fff', width:240}}>
        <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Buscar servicios"
          style={{border:0, outline:'none', flex:1, font:'400 13px var(--font-sans)', color:'var(--text-primary)'}}/>
        {search ? <Icon name="x" size={14} color="var(--brand-cyan-dark)" /> : null}
        <Icon name="search" size={16} color="var(--brand-cyan-dark)" />
      </div>
      <div style={{display:'flex', flexDirection:'column'}}>
        <span style={{font:'400 11px var(--font-sans)', color:'var(--text-secondary)'}}>Seleccionar consulta</span>
        <button onClick={onClinicClick} style={{display:'inline-flex', alignItems:'center', gap:8,
          background:'#fff', border:'1px solid var(--border-soft)', borderRadius:999, padding:'4px 12px',
          font:'700 13px var(--font-sans)', color:'var(--text-primary)', cursor:'pointer'}}>
          <span style={{background:'#f2f6f8', borderRadius:999, padding:'2px 10px'}}>{clinic?.label || 'Con agenda'}</span>
          <span style={{color:'var(--text-secondary)', fontWeight:400}}>(+2 consultas)</span>
          <Icon name={clinicOpen ? 'chevronUp' : 'chevron'} size={14} color="var(--text-secondary)" />
        </button>
      </div>
    </div>
  );
}

function InfoBanner({ children, onClose }) {
  return (
    <div style={{display:'flex', gap:14, alignItems:'flex-start', background:'var(--brand-cyan-soft)',
      color:'var(--brand-cyan-dark)', padding:'14px 18px', borderRadius:6, font:'700 13px/1.5 var(--font-sans)'}}>
      <div style={{width:24, height:24, borderRadius:'50%', background:'var(--brand-cyan-dark)', color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        fontFamily:'Georgia, serif', fontStyle:'italic', fontWeight:700, fontSize:14}}>i</div>
      <div style={{flex:1}}>{children}</div>
      {onClose && (
        <button onClick={onClose} style={{background:'var(--brand-cyan-dark)', color:'#fff', border:0,
          width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer'}}>
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
}

function WarningPill({ children }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:8, background:'var(--warn-bg)',
      color:'var(--warn-text)', padding:'6px 14px', borderRadius:4, font:'600 13px var(--font-sans)'}}>
      <span style={{color:'var(--warn-accent)', fontWeight:900, fontSize:16, lineHeight:1}}>!</span>
      {children}
    </span>
  );
}

Object.assign(window, { Sidebar, PageHeader, InfoBanner, WarningPill });
