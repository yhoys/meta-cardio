import { useState } from "react";
import "./App.css";
import ModeSelector from "./components/ModeSelector";
import PatientSelector from "./components/PatientSelector";
import FindriscForm from "./components/FindriscForm";

function App() {
  const [mode, setMode] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

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

        {mode === "profesional" && (
          <>
            <PatientSelector onPatientSelect={setSelectedPatient} />

            {selectedPatient && (
              <>
                <div style={{ marginTop: "2rem" }}>
                  <h3>Datos del paciente</h3>
                  <p>
                    Nombre: {selectedPatient.name[0].given.join(" ")}{" "}
                    {selectedPatient.name[0].family}
                  </p>
                  <p>Género: {selectedPatient.gender}</p>
                  <p>Fecha de nacimiento: {selectedPatient.birthDate}</p>
                  <p>Edad: {calcularEdad(selectedPatient.birthDate)} años</p>
                </div>

                <FindriscForm
                  age={calcularEdad(selectedPatient.birthDate)}
                  gender={selectedPatient.gender}
                  patientId={selectedPatient.id}
                />
              </>
            )}
          </>
        )}

        {mode === "paciente" && <h2>Modo Paciente seleccionado</h2>}
      </main>
    </div>
  );
}

export default App;
