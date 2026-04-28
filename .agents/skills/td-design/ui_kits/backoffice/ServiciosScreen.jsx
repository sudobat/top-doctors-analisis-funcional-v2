// Servicios screen — replicates services-01..03

function ServiciosScreen() {
  const [search, setSearch] = React.useState('');
  const [clinicOpen, setClinicOpen] = React.useState(false);
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const [selectedClinics, setSelectedClinics] = React.useState(['agenda','wallet','ofimedic']);
  const [services, setServices] = React.useState([
    { id:'a1', name:'Primera consulta Acupuntura', active:true,  dots:['#ff3c52','#009ee2','#a1d100'], show:true },
    { id:'a2', name:'Consulta seguimiento Acupuntura', active:true,  dots:['#009ee2'], show:true },
    { id:'p1', name:'Consulta seguimiento Podología', active:false, dots:[], show:false },
    { id:'p2', name:'Primera consulta Podología',     active:false, dots:[], show:false },
  ]);
  const clinics = [
    { id:'agenda',    name:'Con agenda',                       color:'#009ee2' },
    { id:'wallet',    name:'Consulta Antonio Wallet (NO EDITAR PLS)', color:'#a1d100' },
    { id:'ofimedic',  name:'Ofimedic',                         color:'#ff3c52' },
  ];
  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader title="Servicios" search={search} onSearch={setSearch}
        clinic={{label:'Con agenda'}} onClinicClick={()=>setClinicOpen(o=>!o)} clinicOpen={clinicOpen}/>
      <div style={{padding:'20px 24px'}}>
        {bannerOpen && (
          <div style={{marginBottom:16}}>
            <InfoBanner onClose={()=>setBannerOpen(false)}>
              Estimado doctor, en base a sus especialidades Top Doctors le asigna por defecto una serie de
              servicios estándar. Únicamente tendrá que asociar dichos servicios a sus consultas, indicar la
              duración y precio para los distintos canales donde lo vaya a realizar (presencial, telemedicina, etc.)
              y, finalmente, activar el servicio, que ya estará correctamente configurado.
            </InfoBanner>
          </div>
        )}
        {filtered.map(s => (
          <ServiceRow key={s.id} name={s.name} active={s.active} dots={s.dots}
            showOnTopDoctors={s.show}
            onToggle={v => setServices(curr => curr.map(x => x.id===s.id ? {...x, active:v}: x))}
            onGear={()=>{}}/>
        ))}
        {filtered.length === 0 && (
          <div style={{textAlign:'center', color:'var(--text-secondary)', padding:40}}>
            Sin resultados para "{search}".
          </div>
        )}
      </div>
      <ClinicDropdown open={clinicOpen} clinics={clinics} selected={selectedClinics}
        onToggle={id => setSelectedClinics(curr => curr.includes(id) ? curr.filter(x=>x!==id) : [...curr,id])}
        onClose={()=>setClinicOpen(false)}/>
    </>
  );
}

window.ServiciosScreen = ServiciosScreen;
