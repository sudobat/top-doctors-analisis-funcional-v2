// App shell — combines sidebar + active screen

function App() {
  const [activeIdx, setActiveIdx] = React.useState(1); // Servicios by default

  const Screen = activeIdx === 2 ? DatosConsultaScreen : ServiciosScreen;

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'var(--page-bg)'}}>
      <Sidebar activeIdx={activeIdx} onSelect={setActiveIdx}/>
      <main style={{flex:1, minWidth:0}}>
        <Screen/>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
