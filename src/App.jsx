import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <img
          src="/meta-cardio-logo.png"
          alt="Logo Meta-Cardio"
          className="logo"
        />
        <h1>Meta-Cardio</h1>
        <p className="subtitle">
          Evaluación de Riesgo Cardiovascular y Metabólico basada en FHIR
        </p>
      </header>

      <main className="app-content">
        <h2>Bienvenido</h2>
        <p>
          Esta aplicación permite calcular el riesgo de desarrollar diabetes
          tipo 2 (FINDRISC) y el riesgo cardiovascular a 10 años (Framingham),
          generando un documento clínico estructurado en formato FHIR.
        </p>
      </main>
    </div>
  );
}

export default App;
