import { useState, useEffect, useMemo } from "react";
import "./App.css";
import ModeSelector from "./components/ModeSelector";
import PatientSelector from "./components/PatientSelector";
import FindriscForm from "./components/FindriscForm";
import FraminghamForm from "./components/FraminghamForm";
import { buildComposition } from "./fhir/buildComposition";
import {
  FaUser,
  FaHeartbeat,
  FaNotesMedical,
  FaFileAlt,
  FaBook,
} from "react-icons/fa";
import { FaRegCopy, FaCheck, FaArrowsRotate } from "react-icons/fa6";

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
  const [copiedObs, setCopiedObs] = useState(false);
  const [isCompositionStale, setIsCompositionStale] = useState(false);

  const [activeStep, setActiveStep] = useState("paciente");

  const [showObsModal, setShowObsModal] = useState(false);
  const [activeObsTab, setActiveObsTab] = useState("findrisc");

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

  useEffect(() => {
    if (compositionJson) {
      setIsCompositionStale(true);
    }
  }, [
    imcObs,
    findriscObs,
    framinghamObs,
    waistObs,
    imcGlobal,
    compositionJson,
  ]);

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
      setIsCompositionStale(false);
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

  const copyActiveObservation = () => {
    let obs = null;
    if (activeObsTab === "findrisc") obs = findriscObs;
    else if (activeObsTab === "imc") obs = imcObs;
    else if (activeObsTab === "waist") obs = waistObs;
    else if (activeObsTab === "framingham") obs = framinghamObs;
    if (!obs) return;
    navigator.clipboard.writeText(JSON.stringify(obs, null, 2));
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 1500);
  };

  // Resetear todo el estado para iniciar un nuevo cálculo
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
    setCopiedObs(false);
    setActiveStep("paciente");
  };

  const steps = [
    { id: "paciente", label: "Paciente", icon: <FaUser size={14} /> },
    { id: "findrisc", label: "FINDRISC", icon: <FaHeartbeat size={14} /> },
    {
      id: "framingham",
      label: "Framingham",
      icon: <FaNotesMedical size={14} />,
    },
    { id: "reporte", label: "Documento FHIR", icon: <FaFileAlt size={14} /> },
    { id: "referencias", label: "Referencias", icon: <FaBook size={14} /> },
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

  const getGeneroLabel = (gender) => {
    if (gender === "female") return "Femenino";
    if (gender === "male") return "Masculino";
    return gender ?? "No especificado";
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-wrapper">
              <img
                src="/meta-cardio-logo.svg"
                alt="MetaCardio"
                className="logo"
              />
            </div>
            <div className="header-text">
              <p className="app-title">MetaCardio</p>
              <p className="subtitle">
                Evaluación de riesgo cardiovascular y metabólico basada en FHIR
              </p>
            </div>
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
                            {step.icon}
                            <span>{step.label}</span>
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
                    <FaArrowsRotate size={14} />
                  </button>
                </div>

                {/* 1. Paciente */}
                {activeStep === "paciente" && (
                  <div className="patient-summary">
                    <div className="patient-card">
                      <div className="patient-card-header">
                        <div className="patient-avatar">
                          {selectedPatient.name[0].given[0][0]}
                          {selectedPatient.name[0].family[0][0]}
                        </div>
                        <div>
                          <h3>Datos del paciente ({patientAge} años)</h3>
                          <p>ID FHIR: {selectedPatient.id}</p>
                        </div>
                      </div>

                      <div className="patient-card-body">
                        <div className="patient-row">
                          <span className="label">Nombre completo</span>
                          <span className="value">
                            {selectedPatient.name[0].given.join(" ")}{" "}
                            {selectedPatient.name[0].family}
                          </span>
                        </div>

                        <div className="patient-row two-cols">
                          <div>
                            <span className="value">
                              {getGeneroLabel(selectedPatient.gender)}
                            </span>
                          </div>
                          <div>
                            <span className="label">Fecha de nacimiento: </span>
                            <span className="value">
                              {selectedPatient.birthDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    {allObservationsReady &&
                      (!compositionJson || isCompositionStale) && (
                        <button
                          className="primary-button"
                          onClick={handleGenerateComposition}
                          disabled={isGenerating}
                        >
                          {isGenerating
                            ? "Generando documento FHIR..."
                            : isCompositionStale
                              ? "Regenerar documento clínico (FHIR Composition)"
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
                        </div>

                        <div
                          style={{
                            marginTop: "0.5rem",
                            marginBottom: "0.75rem",
                            display: "flex",
                            gap: "0.75rem",
                          }}
                        >
                          <button
                            onClick={copyComposition}
                            className={`copy-button ${copied ? "copied" : ""}`}
                          >
                            {copied ? (
                              <>
                                <FaCheck size={12} />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <FaRegCopy size={12} />
                                <span>Copiar JSON</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="copy-button"
                            onClick={() => setShowObsModal(true)}
                          >
                            Ver Observations FHIR
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

        {showObsModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowObsModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Observations FHIR</h3>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={copyActiveObservation}
                    className={`copy-button ${copiedObs ? "copied" : ""}`}
                  >
                    {copiedObs ? (
                      <>
                        <FaCheck size={12} />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <FaRegCopy size={12} />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setShowObsModal(false)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="modal-tabs">
                <button
                  className={
                    "modal-tab" + (activeObsTab === "findrisc" ? " active" : "")
                  }
                  onClick={() => setActiveObsTab("findrisc")}
                  disabled={!findriscObs}
                >
                  FINDRISC
                </button>
                <button
                  className={
                    "modal-tab" + (activeObsTab === "imc" ? " active" : "")
                  }
                  onClick={() => setActiveObsTab("imc")}
                  disabled={!imcObs}
                >
                  IMC
                </button>
                <button
                  className={
                    "modal-tab" + (activeObsTab === "waist" ? " active" : "")
                  }
                  onClick={() => setActiveObsTab("waist")}
                  disabled={!waistObs}
                >
                  Cintura
                </button>
                <button
                  className={
                    "modal-tab" +
                    (activeObsTab === "framingham" ? " active" : "")
                  }
                  onClick={() => setActiveObsTab("framingham")}
                  disabled={!framinghamObs}
                >
                  Framingham
                </button>
              </div>
              <div className="modal-body">
                {activeObsTab === "findrisc" && findriscObs && (
                  <pre className="fhir-json-pre--modal">
                    {JSON.stringify(findriscObs, null, 2)}
                  </pre>
                )}
                {activeObsTab === "imc" && imcObs && (
                  <pre className="fhir-json-pre--modal">
                    {JSON.stringify(imcObs, null, 2)}
                  </pre>
                )}
                {activeObsTab === "waist" && waistObs && (
                  <pre className="fhir-json-pre--modal">
                    {JSON.stringify(waistObs, null, 2)}
                  </pre>
                )}
                {activeObsTab === "framingham" && framinghamObs && (
                  <pre className="fhir-json-pre--modal">
                    {JSON.stringify(framinghamObs, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
