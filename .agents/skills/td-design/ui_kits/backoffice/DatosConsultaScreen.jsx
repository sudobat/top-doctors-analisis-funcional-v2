// Datos de la consulta — replicates office-save-01..03

function DatosConsultaScreen() {
  const [editing, setEditing] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const [data, setData] = React.useState({
    color:'#272727', nombre:'', tratamientos:'',
    direccion:'', ciudad:'', cp:'', telefono:'', email:''
  });
  const [draft, setDraft] = React.useState(data);
  const insurances = [];

  const save = () => { setData(draft); setEditing(false); setJustSaved(true);
    setTimeout(()=>setJustSaved(false), 1800); };
  const cancel = () => { setDraft(data); setEditing(false); };
  const startEdit = () => { setDraft(data); setEditing(true); };

  return (
    <>
      <div style={{height:60, background:'var(--header-navy)', display:'flex', alignItems:'center',
        padding:'0 24px', gap:16, position:'relative'}}>
        <div style={{width:40, height:40, borderRadius:6, background:'#fff', border:'1px solid var(--border-soft)',
          display:'flex', alignItems:'center', justifyContent:'center', color:'var(--brand-cyan-dark)'}}>
          <Icon name="menu" size={20}/>
        </div>
        <div style={{flex:1}}/>
        {!editing
          ? <PrimaryButton onClick={startEdit}>Editar</PrimaryButton>
          : <div style={{display:'flex', gap:10}}>
              <GhostButton onClick={cancel}>Cancelar</GhostButton>
              <PrimaryButton onClick={save}>Guardar</PrimaryButton>
            </div>}
        {justSaved && (
          <div style={{position:'absolute', top:70, right:24, background:'var(--success)', color:'#fff',
            padding:'8px 14px', borderRadius:6, font:'700 13px var(--font-sans)', boxShadow:'var(--shadow-pop)'}}>
            ✓ Datos guardados
          </div>
        )}
      </div>

      <div style={{padding:'24px 32px', maxWidth:1100}}>
        <SectionHeading icon="list">Datos de la consulta</SectionHeading>

        <div style={{display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:14, marginBottom:20}}>
          <Field label="Color">
            <ColorSwatchInput color={editing ? draft.color : data.color}
              editable={editing}
              onChange={c => setDraft(d => ({...d, color:c}))}/>
          </Field>
          <Field label="Nombre">
            <TextInput value={editing ? draft.nombre : data.nombre} disabled={!editing}
              onChange={e => setDraft(d => ({...d, nombre:e.target.value}))}/>
          </Field>
          <Field label="Tratamientos">
            <TextInput value={editing ? draft.tratamientos : data.tratamientos} disabled={!editing}
              onChange={e => setDraft(d => ({...d, tratamientos:e.target.value}))}/>
          </Field>
        </div>

        {!editing && (
          <div style={{background:'var(--brand-cyan-soft)', borderRadius:6, padding:'14px 18px', marginBottom:20,
            font:'400 13px/1.55 var(--font-sans)', color:'var(--text-primary)'}}>
            <div style={{font:'700 13px var(--font-sans)', color:'var(--text-primary)', marginBottom:8}}>
              Consultas configuradas con semanas alternas:
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:10}}>
              {['lunes','martes','miércoles','jueves','viernes','sábado','domingo'].map(d => (
                <div key={d}>
                  <div style={{font:'700 12px var(--font-sans)', color:'var(--brand-cyan-dark)', marginBottom:2}}>{d}:</div>
                  <div style={{color:'var(--text-secondary)'}}>– –</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'2fr 1.5fr 0.7fr 1.2fr 1.5fr', gap:14, marginBottom:32}}>
          <Field label="Dirección">
            <TextInput value={editing?draft.direccion:data.direccion} disabled={!editing}
              onChange={e => setDraft(d => ({...d, direccion:e.target.value}))}/>
          </Field>
          <Field label="Ciudad">
            <TextInput value={editing?draft.ciudad:data.ciudad} disabled={!editing}
              onChange={e => setDraft(d => ({...d, ciudad:e.target.value}))}/>
          </Field>
          <Field label="Código postal">
            <TextInput value={editing?draft.cp:data.cp} disabled={!editing}
              onChange={e => setDraft(d => ({...d, cp:e.target.value}))}/>
          </Field>
          <Field label="Teléfono">
            <div style={{display:'flex', gap:0}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:4, padding:'0 8px',
                border:'1px solid var(--border-input)', borderRight:0, borderRadius:'4px 0 0 4px',
                background:'#fff', font:'400 13px var(--font-sans)', color:'var(--text-secondary)'}}>
                <span style={{width:18, height:18, borderRadius:'50%', display:'inline-flex'}}>
                  <span style={{display:'inline-block', width:'33%', height:'100%', background:'#aa151b'}}/>
                  <span style={{display:'inline-block', width:'34%', height:'100%', background:'#f1bf00'}}/>
                  <span style={{display:'inline-block', width:'33%', height:'100%', background:'#aa151b'}}/>
                </span>
                (+34)
              </span>
              <TextInput value={editing?draft.telefono:data.telefono} disabled={!editing}
                onChange={e => setDraft(d => ({...d, telefono:e.target.value}))}
                style={{borderRadius:'0 4px 4px 0', flex:1}}/>
            </div>
          </Field>
          <Field label="Correo electrónico">
            <TextInput value={editing?draft.email:data.email} disabled={!editing}
              onChange={e => setDraft(d => ({...d, email:e.target.value}))}/>
          </Field>
        </div>

        <SectionHeading icon="shield">Asignar seguros médicos a esta consulta</SectionHeading>
        <div style={{marginBottom:32}}>
          <div style={{position:'relative', border:'1px solid var(--border-input)', borderRadius:4, padding:'9px 12px',
            background:'#fff', display:'flex', alignItems:'center', color:'var(--text-secondary)',
            font:'400 13px var(--font-sans)'}}>
            Escriba el seguro médico
            <Icon name="chevron" size={14} color="var(--text-secondary)" />
          </div>
        </div>

        <SectionHeading icon="baby">Visita niños</SectionHeading>
        <Checkbox checked={false} onChange={()=>{}} label="Visita niños"/>
      </div>
    </>
  );
}

window.DatosConsultaScreen = DatosConsultaScreen;
