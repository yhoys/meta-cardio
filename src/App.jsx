import { useState } from "react";
import "./App.css";
import ModeSelector from "./components/ModeSelector";

function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img
            src="/meta-cardio-logo.svg"
            alt="Logo Meta-Cardio"
            className="logo"
          />
          <div className="header-text">
            <h1>Meta Cardio</h1>
            <p className="subtitle">
              Evaluación de Riesgo Cardiovascular y Metabólico basada en FHIR
            </p>
          </div>
        </div>
      </header>

      <main className="app-content">
        {!mode && <ModeSelector onSelect={setMode} />}

        {mode === "profesional" && <h2>Modo Profesional seleccionado</h2>}

        {mode === "paciente" && <h2>Modo Paciente seleccionado</h2>}
      </main>
    </div>
  );
}

export default App;
