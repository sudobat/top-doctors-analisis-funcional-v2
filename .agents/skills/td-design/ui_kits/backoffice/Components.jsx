// Service row, toggle, dropdown, form fields

function Toggle({ checked, onChange, color = 'var(--success)' }) {
  return (
    <button onClick={() => onChange(!checked)}
      style={{position:'relative', width:46, height:22, borderRadius:999,
        background: checked ? color : 'var(--brand-cyan-faint)',
        border:0, padding:0, cursor:'pointer', flexShrink:0, transition:'background 150ms'}}>
      <span style={{position:'absolute', top:3, left: checked ? 27 : 3, width:16, height:16,
        borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.2)',
        transition:'left 150ms'}}/>
    </button>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer',
      font:'700 13px var(--font-sans)', color:'var(--text-primary)'}}>
      <span style={{width:18, height:18, borderRadius:3,
        background: checked ? 'var(--success)' : '#fff',
        border: checked ? 0 : '1.5px solid var(--border-input)',
        display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff'}}>
        {checked && <Icon name="check" size={12} stroke={3}/>}
      </span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{display:'none'}}/>
      {label}
    </label>
  );
}

function ColorDot({ color, size = 14 }) {
  return <span style={{width:size, height:size, borderRadius:'50%', background:color, display:'inline-block'}}/>;
}

function GearButton({ onClick }) {
  return (
    <button onClick={onClick} style={{width:36, height:36, borderRadius:6, background:'#fff',
      border:'1px solid var(--border-soft)', display:'flex', alignItems:'center',
      justifyContent:'center', color:'var(--text-secondary)', cursor:'pointer'}}>
      <Icon name="gear" size={18}/>
    </button>
  );
}

function ServiceRow({ name, active, dots = [], showOnTopDoctors, onToggle, onGear }) {
  const card = { background:'#fff', borderRadius:6, boxShadow:'var(--shadow-card)',
    padding:'14px 18px', display:'flex', alignItems:'center', gap:16, marginBottom:10 };
  return (
    <div style={card}>
      <Toggle checked={active} onChange={onToggle}/>
      <div className="td-h3" style={{width:240, flexShrink:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{name}</div>
      {active ? (
        <>
          <div style={{display:'flex', gap:6, flex:1}}>
            {dots.map((d, i) => <ColorDot key={i} color={d}/>)}
          </div>
          {showOnTopDoctors && <Checkbox checked={true} onChange={()=>{}} label="Mostrar en Top Doctors"/>}
        </>
      ) : (
        <div style={{flex:1, display:'flex', justifyContent:'center'}}>
          <WarningPill>Este servicio está desactivado. <b style={{color:'var(--text-primary)'}}>Actívelo y configúrelo</b>.</WarningPill>
        </div>
      )}
      <GearButton onClick={onGear}/>
    </div>
  );
}

function ClinicDropdown({ open, clinics, selected, onToggle, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, zIndex:20}}>
      <div onClick={e=>e.stopPropagation()}
        style={{position:'absolute', top:64, right:24, width:300, background:'#fff', borderRadius:8,
          boxShadow:'var(--shadow-pop)', padding:6, font:'400 13px var(--font-sans)'}}>
        {clinics.map((c, i) => {
          const sel = selected.includes(c.id);
          return (
            <div key={c.id} onClick={() => onToggle(c.id)}
              style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:6, cursor:'pointer'}}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{width:18, height:18, borderRadius:3,
                background: sel ? 'var(--success)' : '#fff',
                border: sel ? 0 : '1.5px solid var(--border-input)',
                display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff'}}>
                {sel && <Icon name="check" size={12} stroke={3}/>}
              </span>
              <span style={{flex:1, fontWeight:700, color:'var(--text-primary)'}}>{c.name}</span>
              <ColorDot color={c.color} size={11}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children, span = 1 }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:4, gridColumn:`span ${span}`}}>
      <label className="td-label">{label}</label>
      {children}
    </div>
  );
}

function TextInput(props) {
  return (
    <input {...props}
      style={{font:'400 14px var(--font-sans)', padding:'9px 12px',
        border:'1px solid var(--border-input)', borderRadius:4, background:'#fff',
        outline:'none', color:'var(--text-primary)', ...(props.style||{})}}
      onFocus={e => { e.target.style.borderColor = 'var(--brand-cyan-dark)';
        e.target.style.boxShadow = '0 0 0 2px rgba(0,158,226,.18)'; props.onFocus && props.onFocus(e); }}
      onBlur={e => { e.target.style.borderColor = 'var(--border-input)';
        e.target.style.boxShadow = 'none'; props.onBlur && props.onBlur(e); }}/>
  );
}

function ColorSwatchInput({ color, onChange, editable }) {
  const [open, setOpen] = React.useState(false);
  const palette = ['#272727','#009ee2','#1abadf','#34b154','#a1d100','#ff3c52','#fdc007','#9333ea'];
  return (
    <div style={{position:'relative'}}>
      <button onClick={()=> editable && setOpen(o=>!o)}
        style={{display:'inline-flex', alignItems:'center', gap:6, width:48, height:36, padding:'0 6px',
          border:'1px solid var(--border-input)', borderRadius:4, background:'#fff', cursor: editable?'pointer':'default'}}>
        <span style={{width:22, height:22, borderRadius:'50%', background:color, display:'inline-block'}}/>
        {editable && <Icon name="chevron" size={10} color="var(--brand-cyan-dark)"/>}
      </button>
      {open && (
        <div style={{position:'absolute', top:42, left:0, background:'#fff', border:'1px solid var(--border-soft)',
          borderRadius:6, padding:8, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:6,
          boxShadow:'var(--shadow-pop)', zIndex:5}}>
          {palette.map(c => (
            <button key={c} onClick={()=>{onChange(c); setOpen(false);}}
              style={{width:24, height:24, borderRadius:'50%', background:c, border:'2px solid #fff',
                outline: c===color?'2px solid var(--brand-cyan-dark)':'1px solid var(--border-soft)', cursor:'pointer'}}/>
          ))}
        </div>
      )}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      font:'700 14px var(--font-sans)', padding:'10px 24px', borderRadius:4, border:0,
      background:'var(--grad-cta)', color:'#fff', cursor: disabled?'not-allowed':'pointer',
      opacity: disabled?0.5:1, boxShadow:'0 1px 2px rgba(0,0,0,.08)'
    }}>{children}</button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      font:'700 14px var(--font-sans)', padding:'9px 22px', borderRadius:4,
      background:'transparent', color:'var(--brand-cyan-dark)',
      border:'1px solid var(--brand-cyan-dark)', cursor:'pointer'
    }}>{children}</button>
  );
}

function SectionHeading({ icon, children }) {
  return (
    <h2 className="td-h2" style={{display:'flex', alignItems:'center', gap:10, margin:'0 0 14px'}}>
      <Icon name={icon} size={20} color="var(--text-primary)"/>
      {children}
    </h2>
  );
}

Object.assign(window, { Toggle, Checkbox, ColorDot, GearButton, ServiceRow,
  ClinicDropdown, Field, TextInput, ColorSwatchInput, PrimaryButton, GhostButton, SectionHeading });
