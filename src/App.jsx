import { useState, useEffect, useMemo } from "react";
import "./App.css";
import ModeSelector from "./components/ModeSelector";
import PatientSelector from "./components/PatientSelector";
import FindriscForm from "./components/FindriscForm";
import FraminghamForm from "./components/FraminghamForm";
import { buildComposition } from "./fhir/buildComposition";

function App() {
  const [started, setStarted] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [imcGlobal, setImcGlobal] = useState(null);
  const [imcObs, setImcObs] = useState(null);
  const [findriscObs, setFindriscObs] = useState(null);
  const [framinghamObs, setFraminghamObs] = useState(null);
  const [compositionJson, setCompositionJson] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [waistObs, setWaistObs] = useState(null);
  const [copied, setCopied] = useState(false);

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
      !!imcObs?.id &&
      !!findriscObs?.id &&
      !!framinghamObs?.id &&
      !!waistObs?.id &&
      patientAge !== null,
    [imcObs, findriscObs, framinghamObs, waistObs, patientAge],
  );

  useEffect(() => {
    if (!selectedPatient) {
      setCompositionJson(null);
      setImcGlobal(null);
      setImcObs(null);
      setFindriscObs(null);
      setFraminghamObs(null);
      setWaistObs(null);
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
        waistObs,
      );
      setCompositionJson(composition);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyComposition = () => {
    if (compositionJson) {
      navigator.clipboard.writeText(JSON.stringify(compositionJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
        {!started && <ModeSelector onStart={() => setStarted(true)} />}

        {started && (
          <>
            <PatientSelector onPatientSelect={handlePatientSelect} />

            {selectedPatient && patientAge && (
              <>
                <nav
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "1.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  {[
                    { id: "paciente", label: "Paciente" },
                    { id: "findrisc", label: "FINDRISC" },
                    { id: "framingham", label: "Framingham" },
                    { id: "reporte", label: "Documento FHIR" },
                    { id: "referencias", label: "Referencias" },
                  ].map((step, index) => {
                    const isCompleted =
                      (step.id === "paciente" && selectedPatient) ||
                      (step.id === "findrisc" && findriscObs) ||
                      (step.id === "framingham" && framinghamObs) ||
                      (step.id === "reporte" && compositionJson);

                    return (
                      <div
                        key={step.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#64748b",
                        }}
                      >
                        {index > 0 && (
                          <span
                            style={{
                              margin: "0 0.25rem",
                              color: "#cbd5f5",
                            }}
                          >
                            ,
                          </span>
                        )}
                        <span
                          style={{
                            padding: "0.3rem 0.8rem",
                            borderRadius: "999px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: isCompleted
                              ? "#0f172a"
                              : "#ffffff",
                            color: isCompleted ? "#ffffff" : "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </nav>

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
                  setWaistObs={setWaistObs}
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
                    className="primary-button"
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
                  <>
                    <div style={{ marginTop: "2rem", textAlign: "left" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>Documento Clínico FHIR</h3>
                        <button
                          onClick={copyComposition}
                          style={{
                            padding: "0.35rem 0.8rem",
                            fontSize: "0.8rem",
                            borderRadius: "999px",
                            border: "1px solid #cbd5f5",
                            backgroundColor: copied ? "#dcfce7" : "#e2e8f0",
                            color: copied ? "#166534" : "#0f172a",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          {copied ? (
                            <>
                              <span style={{ fontSize: "0.9rem" }}>✔</span>
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: "0.9rem" }}>📄📄</span>
                              <span>Copiar JSON</span>
                            </>
                          )}
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
                          margin: 0,
                        }}
                      >
                        {JSON.stringify(compositionJson, null, 2)}
                      </pre>
                    </div>

                    <div
                      className="section-card"
                      style={{ marginTop: "2rem", textAlign: "left" }}
                    >
                      <h2>Referencias clínicas y escalas utilizadas</h2>
                      <small>
                        Resumen de los puntos de corte y referencias
                        bibliográficas para las escalas FINDRISC y Framingham
                        empleadas en este cálculo.
                      </small>
                      <h3
                        style={{
                          marginTop: "1rem",
                          fontSize: "1rem",
                        }}
                      >
                        1. Escala FINDRISC (riesgo de diabetes tipo 2 a 10 años)
                      </h3>
                      <ul
                        style={{
                          fontSize: "0.9rem",
                          color: "#475569",
                          paddingLeft: "1.2rem",
                        }}
                      >
                        <li>Puntuación &lt; 7: riesgo bajo (≈ 1%).</li>
                        <li>7–11: riesgo ligeramente elevado (≈ 4%).</li>
                        <li>12–14: riesgo moderado (≈ 17%).</li>
                        <li>15–20: riesgo alto (≈ 33%).</li>
                        <li>&gt; 20: riesgo muy alto (≈ 50%).</li>
                      </ul>

                      <h3
                        style={{
                          marginTop: "1rem",
                          fontSize: "1rem",
                        }}
                      >
                        2. Riesgo de Framingham (evento cardiovascular a 10
                        años)
                      </h3>
                      <ul
                        style={{
                          fontSize: "0.9rem",
                          color: "#475569",
                          paddingLeft: "1.2rem",
                        }}
                      >
                        <li>&lt; 10 %: riesgo bajo.</li>
                        <li>10–20 %: riesgo intermedio.</li>
                        <li>&gt; 20 %: riesgo alto.</li>
                        <li>
                          En este proyecto se aplica un factor de ajuste 0.75
                          para población colombiana.
                        </li>
                      </ul>

                      <h3
                        style={{
                          marginTop: "1rem",
                          fontSize: "1rem",
                        }}
                      >
                        3. Bibliografía principal
                      </h3>
                      <ul
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          paddingLeft: "1.2rem",
                        }}
                      >
                        <li>
                          D&apos;Agostino RB et al. General cardiovascular risk
                          profile for use in primary care. Circulation, 2008.
                          (Framingham general CVD 10 años)
                        </li>
                        <li>
                          Wilson PWF et al. Prediction of coronary heart disease
                          using risk factor categories. Circulation, 1998.
                        </li>
                        <li>
                          Lindström J, Tuomilehto J. The Diabetes Risk Score: a
                          practical tool to predict type 2 diabetes risk.
                          Diabetes Care, 2003.
                        </li>
                        <li>
                          [Artículo nacional]
                          4883-Texto-del-articulo-22710-1-10-20251028
                          (adaptación/uso en contexto colombiano).
                        </li>
                        <li>
                          13043951 (documento de soporte adicional para
                          estratificación de riesgo cardiovascular).
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
