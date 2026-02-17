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
  const [waistObs, setWaistObs] = useState(null);
  const [compositionJson, setCompositionJson] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeStep, setActiveStep] = useState("paciente");

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
      setActiveStep("paciente");
    }
  }, [selectedPatient]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveStep("paciente");
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
      setActiveStep("reporte");
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

  // Nuevo: resetear TODO (como refrescar la página)
  const handleResetAll = () => {
    setStarted(false);
    setSelectedPatient(null);
    setImcGlobal(null);
    setImcObs(null);
    setFindriscObs(null);
    setFraminghamObs(null);
    setWaistObs(null);
    setCompositionJson(null);
    setIsGenerating(false);
    setCopied(false);
    setActiveStep("paciente");
  };

  const steps = [
    { id: "paciente", label: "Paciente" },
    { id: "findrisc", label: "FINDRISC" },
    { id: "framingham", label: "Framingham" },
    { id: "reporte", label: "Documento FHIR" },
    { id: "referencias", label: "Referencias" },
  ];

  const isStepEnabled = (id) => {
    if (!selectedPatient || !patientAge) return id === "paciente";

    if (id === "paciente") return true;
    if (id === "findrisc") return true;
    if (id === "framingham") return !!findriscObs;
    if (id === "reporte") return !!compositionJson || allObservationsReady;
    if (id === "referencias") return !!compositionJson;
    return false;
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
                {/* Barra de pasos + botón Nuevo cálculo */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "1.5rem",
                    gap: "0.5rem",
                  }}
                >
                  <nav className="step-nav" style={{ flex: 1 }}>
                    {steps.map((step, index) => {
                      const completed =
                        (step.id === "paciente" && selectedPatient) ||
                        (step.id === "findrisc" && findriscObs) ||
                        (step.id === "framingham" && framinghamObs) ||
                        (step.id === "reporte" && compositionJson) ||
                        (step.id === "referencias" && compositionJson);

                      const enabled = isStepEnabled(step.id);

                      const classes = [
                        "step-button",
                        activeStep === step.id && "active",
                        completed && "completed",
                        !enabled && "disabled",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <div
                          key={step.id}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {index > 0 && (
                            <span className="step-separator">›</span>
                          )}
                          <button
                            type="button"
                            className={classes}
                            onClick={() => enabled && setActiveStep(step.id)}
                          >
                            {step.label}
                          </button>
                        </div>
                      );
                    })}
                  </nav>

                  <button
                    type="button"
                    className="step-button"
                    onClick={handleResetAll}
                  >
                    Nuevo cálculo
                  </button>
                </div>

                {/* 1. Paciente */}
                {activeStep === "paciente" && (
                  <div style={{ marginTop: "2rem" }}>
                    <h3>Datos del paciente ({patientAge} años)</h3>
                    <p>
                      Nombre: {selectedPatient.name[0].given.join(" ")}{" "}
                      {selectedPatient.name[0].family}
                    </p>
                    <p>Género: {selectedPatient.gender}</p>
                    <p>Fecha de nacimiento: {selectedPatient.birthDate}</p>
                  </div>
                )}

                {/* Formularios SIEMPRE montados, solo ocultos por pestaña */}
                <div style={{ marginTop: "2rem" }}>
                  <div
                    style={{
                      display: activeStep === "findrisc" ? "block" : "none",
                    }}
                  >
                    <FindriscForm
                      age={patientAge}
                      gender={selectedPatient.gender}
                      patientId={selectedPatient.id}
                      setImcGlobal={setImcGlobal}
                      setImcObs={setImcObs}
                      setFindriscObs={setFindriscObs}
                      setWaistObs={setWaistObs}
                    />
                  </div>

                  <div
                    style={{
                      display: activeStep === "framingham" ? "block" : "none",
                    }}
                  >
                    <FraminghamForm
                      age={patientAge}
                      gender={selectedPatient.gender}
                      patientId={selectedPatient.id}
                      imc={imcGlobal}
                      setFraminghamObs={setFraminghamObs}
                    />
                  </div>
                </div>

                {/* 4. Documento FHIR */}
                {activeStep === "reporte" && (
                  <>
                    {allObservationsReady && !compositionJson && (
                      <button
                        className="primary-button"
                        onClick={handleGenerateComposition}
                        disabled={isGenerating}
                      >
                        {isGenerating
                          ? "Generando documento FHIR..."
                          : "Generar documento clínico (FHIR Composition)"}
                      </button>
                    )}

                    {!allObservationsReady && (
                      <div className="alert-warning">
                        Completa los formularios de FINDRISC e IMC/Framingham
                        para generar el documento clínico FHIR.
                      </div>
                    )}

                    {compositionJson && (
                      <div className="fhir-json-container">
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <h3 style={{ margin: 0 }}>
                            Documento Clínico FHIR (Composition)
                          </h3>
                          <button
                            onClick={copyComposition}
                            className={`copy-button ${copied ? "copied" : ""}`}
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

                        <pre className="fhir-json-pre">
                          {JSON.stringify(compositionJson, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {/* 5. Referencias */}
                {activeStep === "referencias" && (
                  <div
                    className="section-card"
                    style={{ marginTop: "2rem", textAlign: "left" }}
                  >
                    <h2>Protocolos y referencias</h2>
                    <small>
                      Puntos de corte de las escalas y bibliografía utilizada
                      para el cálculo del riesgo.
                    </small>

                    <h3 style={{ marginTop: "1rem", fontSize: "1rem" }}>
                      1. Escala FINDRISC (Diabetes T2)
                    </h3>
                    <table className="refs-table">
                      <thead>
                        <tr>
                          <th>Puntuación</th>
                          <th>Riesgo (10 años)</th>
                          <th>Recomendación clínica</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>&lt; 7</td>
                          <td>1 % (Bajo)</td>
                          <td>
                            Mantener estilos de vida saludables. Reevaluar en 5
                            años.
                          </td>
                        </tr>
                        <tr>
                          <td>7-11</td>
                          <td>4 % (Ligero)</td>
                          <td>Consejería breve. Reevaluar en 3 años.</td>
                        </tr>
                        <tr>
                          <td>12-14</td>
                          <td>17 % (Moderado)</td>
                          <td>
                            Intervención en estilo de vida. Tamizaje de
                            glucemia.
                          </td>
                        </tr>
                        <tr className="refs-row-high">
                          <td>15-20</td>
                          <td>33 % (Alto)</td>
                          <td>Derivación médica. PTOG o HbA1c.</td>
                        </tr>
                        <tr className="refs-row-very-high">
                          <td>&gt; 20</td>
                          <td>50 % (Muy alto)</td>
                          <td>Derivación prioritaria. Sospecha DM2.</td>
                        </tr>
                      </tbody>
                    </table>

                    <h3 style={{ marginTop: "1.5rem", fontSize: "1rem" }}>
                      2. Riesgo Framingham (Cardiovascular)
                    </h3>
                    <table className="refs-table">
                      <thead>
                        <tr>
                          <th>Riesgo</th>
                          <th>Categoría</th>
                          <th>Recomendación (ATP III)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>&lt; 10 %</td>
                          <td>Bajo</td>
                          <td>Reforzar hábitos. Reevaluar en 2-5 años.</td>
                        </tr>
                        <tr>
                          <td>10-20 %</td>
                          <td>Intermedio</td>
                          <td>Monitoreo frecuente. Considerar estatinas.</td>
                        </tr>
                        <tr className="refs-row-very-high">
                          <td>&gt; 20 %</td>
                          <td>Alto</td>
                          <td>Intervención farmacológica estricta.</td>
                        </tr>
                      </tbody>
                    </table>

                    <h3 style={{ marginTop: "1.5rem", fontSize: "1rem" }}>
                      3. Bibliografía (sustento científico)
                    </h3>
                    <ul
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        paddingLeft: "1.2rem",
                      }}
                    >
                      <li>
                        Lindström J, Tuomilehto J. The Diabetes Risk Score: a
                        practical tool to predict type 2 diabetes. Diabetes
                        Care.
                      </li>
                      <li>
                        D&apos;Agostino RB et al. General cardiovascular risk
                        profile for use in primary care. Circulation, 2008.
                      </li>
                      <li>
                        Wilson PWF et al. Prediction of coronary heart disease
                        using risk factor categories. Circulation, 1998.
                      </li>
                      <li>
                        Guías y documentos nacionales adicionales para riesgo
                        cardiovascular y DM2.
                      </li>
                    </ul>
                  </div>
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
