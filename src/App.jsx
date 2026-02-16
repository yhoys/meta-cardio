import { useState, useEffect, useMemo } from "react";
import "./App.css";
import ModeSelector from "./components/ModeSelector";
import PatientSelector from "./components/PatientSelector";
import FindriscForm from "./components/FindriscForm";
import FraminghamForm from "./components/FraminghamForm";
import { buildComposition } from "./fhir/buildComposition";

function App() {
  const [mode, setMode] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [imcGlobal, setImcGlobal] = useState(null);
  const [imcObs, setImcObs] = useState(null);
  const [findriscObs, setFindriscObs] = useState(null);
  const [framinghamObs, setFraminghamObs] = useState(null);
  const [compositionJson, setCompositionJson] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const patientAge = useMemo(() => {
    if (!selectedPatient?.birthDate) return null;
    const hoy = new Date();
    const nacimiento = new Date(selectedPatient.birthDate);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }, [selectedPatient]);

  const allObservationsReady = useMemo(
    () =>
      imcObs?.valueQuantity &&
      findriscObs?.valueInteger &&
      framinghamObs?.valueDecimal &&
      patientAge !== null,
    [imcObs, findriscObs, framinghamObs, patientAge],
  );

  useEffect(() => {
    if (!selectedPatient) {
      setCompositionJson(null);
      setImcGlobal(null);
      setImcObs(null);
      setFindriscObs(null);
      setFraminghamObs(null);
    }
  }, [selectedPatient]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleGenerateComposition = async () => {
    if (!allObservationsReady) return;

    setIsGenerating(true);
    try {
      const composition = buildComposition(
        selectedPatient.id,
        findriscObs,
        imcObs,
        framinghamObs,
      );
      setCompositionJson(composition);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyComposition = () => {
    if (compositionJson) {
      navigator.clipboard.writeText(JSON.stringify(compositionJson, null, 2));
    }
  };

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
            <PatientSelector onPatientSelect={handlePatientSelect} />

            {selectedPatient && patientAge && (
              <>
                <div style={{ marginTop: "2rem" }}>
                  <h3>Datos del paciente ({patientAge} años)</h3>
                  <p>
                    Nombre: {selectedPatient.name[0].given.join(" ")}{" "}
                    {selectedPatient.name[0].family}
                  </p>
                  <p>Género: {selectedPatient.gender}</p>
                  <p>Fecha de nacimiento: {selectedPatient.birthDate}</p>
                </div>

                <FindriscForm
                  age={patientAge}
                  gender={selectedPatient.gender}
                  patientId={selectedPatient.id}
                  setImcGlobal={setImcGlobal}
                  setImcObs={setImcObs}
                  setFindriscObs={setFindriscObs}
                />

                <FraminghamForm
                  age={patientAge}
                  gender={selectedPatient.gender}
                  patientId={selectedPatient.id}
                  imc={imcGlobal}
                  setFraminghamObs={setFraminghamObs}
                />

                {allObservationsReady ? (
                  <button
                    style={{ marginTop: "2rem" }}
                    onClick={handleGenerateComposition}
                    disabled={isGenerating}
                  >
                    {isGenerating
                      ? "Generando Documento FHIR..."
                      : "Generar Documento Clínico (FHIR Composition)"}
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: "2rem",
                      padding: "1rem",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      color: "#92400e",
                    }}
                  >
                    Completa todos los formularios para generar el documento
                    clínico FHIR
                  </div>
                )}

                {compositionJson && (
                  <div style={{ marginTop: "2rem" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <h3>Documento Clínico FHIR generado</h3>
                      <button
                        onClick={copyComposition}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                      >
                        Copiar JSON
                      </button>
                    </div>
                    <pre
                      style={{
                        backgroundColor: "#0f172a",
                        color: "#f1f5f9",
                        padding: "1.5rem",
                        borderRadius: "8px",
                        overflowX: "auto",
                        fontSize: "0.8rem",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {JSON.stringify(compositionJson, null, 2)}
                    </pre>
                  </div>
                )}
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
