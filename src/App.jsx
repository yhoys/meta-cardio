import "./App.css";
import ModeSelector from "./components/ModeSelector";
import PatientSelector from "./components/PatientSelector";
import FindriscForm from "./components/FindriscForm";
import FraminghamForm from "./components/FraminghamForm";
import { useConsultaFHIR } from "./hooks/useConsultaFHIR";
import {
  FaUser,
  FaHeartbeat,
  FaNotesMedical,
  FaFileAlt,
  FaBook,
} from "react-icons/fa";
import { FaRegCopy, FaCheck, FaArrowsRotate } from "react-icons/fa6";

const STEPS = [
  { id: "paciente", label: "Paciente", icon: <FaUser size={14} /> },
  { id: "findrisc", label: "FINDRISC", icon: <FaHeartbeat size={14} /> },
  { id: "framingham", label: "Framingham", icon: <FaNotesMedical size={14} /> },
  { id: "reporte", label: "Documento FHIR", icon: <FaFileAlt size={14} /> },
  { id: "referencias", label: "Referencias", icon: <FaBook size={14} /> },
];

const OBS_TABS = [
  { key: "findrisc", label: "FINDRISC" },
  { key: "imc", label: "IMC" },
  { key: "waist", label: "Cintura" },
  { key: "framingham", label: "Framingham" },
];

function getGeneroLabel(gender) {
  if (gender === "female") return "Femenino";
  if (gender === "male") return "Masculino";
  return gender ?? "No especificado";
}

function CopyButton({ onClick, copied, label = "Copiar JSON" }) {
  return (
    <button
      onClick={onClick}
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
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function PatientSummary({ patient, age }) {
  return (
    <div className="patient-summary">
      <div className="patient-card">
        <div className="patient-card-header">
          <div className="patient-avatar">
            {patient.name[0].given[0][0]}
            {patient.name[0].family[0][0]}
          </div>
          <div>
            <h3>Datos del paciente ({age} años)</h3>
            <p>ID FHIR: {patient.id}</p>
          </div>
        </div>
        <div className="patient-card-body">
          <div className="patient-row">
            <span className="label">Nombre completo</span>
            <span className="value">
              {patient.name[0].given.join(" ")} {patient.name[0].family}
            </span>
          </div>
          <div className="patient-row two-cols">
            <div>
              <span className="label">Género: </span>
              <span className="value">{getGeneroLabel(patient.gender)}</span>
            </div>
            <div>
              <span className="label">Fecha de nacimiento: </span>
              <span className="value">{patient.birthDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SendResult({ sendResult }) {
  if (!sendResult) return null;
  return (
    <div
      className={"fhir-send-result " + (sendResult.ok ? "success" : "error")}
    >
      {sendResult.ok ? (
        <>
          <p>
            <strong>Envío exitoso</strong> al servidor FHIR (HTTP{" "}
            {sendResult.status}).
          </p>
          {sendResult.links?.length > 0 && (
            <>
              <p>Recursos creados/actualizados:</p>
              <ul className="fhir-links-list">
                {sendResult.links.map((url) => {
                  const cleanUrl = url.replace(/\/_history\/\d+$/, "");
                  const parts = cleanUrl.split("/");
                  const resourceType = parts[parts.length - 2];
                  const id = parts[parts.length - 1];
                  return (
                    <li key={url}>
                      <strong>{resourceType}</strong> ({id}){" "}
                      <a href={cleanUrl} target="_blank" rel="noreferrer">
                        abrir
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <p>Falló el envío al servidor FHIR (HTTP {sendResult.status}).</p>
          {sendResult.errorText && (
            <pre
              style={{
                margin: 0,
                fontSize: "0.82rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {sendResult.errorText}
            </pre>
          )}
        </>
      )}
    </div>
  );
}

function buildObservationPreview(obs) {
  if (!obs) return null;

  const { id: _id, ...rest } = obs;

  return {
    ...rest,
    subject: { reference: "urn:uuid:patient-1" },
    device: { reference: "urn:uuid:device-1" },
  };
}

function ObsModal({
  observations,
  activeObsTab,
  copiedObs,
  onClose,
  onSetTab,
  onSetCopiedObs,
}) {
  const rawObs = observations[activeObsTab] ?? null;
  const previewObs = buildObservationPreview(rawObs);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(JSON.stringify(previewObs, null, 2));
    onSetCopiedObs(true);
    setTimeout(() => onSetCopiedObs(false), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Observations FHIR</h3>
          <div className="modal-header-actions">
            <CopyButton onClick={handleCopyPreview} copied={copiedObs} />
            <button type="button" className="modal-close" onClick={onClose}>
              x
            </button>
          </div>
        </div>
        <div className="modal-tabs">
          {OBS_TABS.map(({ key, label }) => (
            <button
              key={key}
              className={"modal-tab" + (activeObsTab === key ? " active" : "")}
              onClick={() => onSetTab(key)}
              disabled={!observations[key]}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {previewObs && (
            <pre className="fhir-json-pre--modal">
              {JSON.stringify(previewObs, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function ReferencesSection() {
  return (
    <div className="section-card referencias-card">
      <h2>Protocolos y referencias</h2>
      <small>
        Puntos de corte de las escalas y bibliografía utilizada para el cálculo
        del riesgo.
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
            <td>Mantener estilos de vida saludables. Reevaluar en 5 años.</td>
          </tr>
          <tr>
            <td>7-11</td>
            <td>4 % (Ligero)</td>
            <td>Consejería breve. Reevaluar en 3 años.</td>
          </tr>
          <tr>
            <td>12-14</td>
            <td>17 % (Moderado)</td>
            <td>Intervención en estilo de vida. Tamizaje de glucemia.</td>
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
      <ul className="refs-biblio-list">
        <li>
          Lindström J, Tuomilehto J. The Diabetes Risk Score: a practical tool
          to predict type 2 diabetes. Diabetes Care. 2003;26(3):725-31.
        </li>
        <li>
          D&apos;Agostino RB Sr, Vasan RS, Pencina MJ, Wolf PA, Cobain M,
          Massaro JM, et al. General cardiovascular risk profile for use in
          primary care: the Framingham Heart Study. Circulation.
          2008;117(6):743-53.
        </li>
        <li>
          Wilson PWF, D&apos;Agostino RB, Levy D, Belanger AM, Silbershatz H,
          Kannel WB. Prediction of coronary heart disease using risk factor
          categories. Circulation. 1998;97(18):1837-47.
        </li>
        <li>
          Muñoz OM, Rodríguez NI, Ruiz Á, Rondón M. Validación de los modelos de
          predicción de Framingham y PROCAM como estimadores del riesgo
          cardiovascular en una población colombiana. Rev Colomb Cardiol.
          2014;21(4):202-12. doi:10.1016/j.rccar.2014.02.001.
        </li>
        <li>
          Guías y documentos nacionales adicionales para riesgo cardiovascular y
          diabetes mellitus tipo 2 (DM2).
        </li>
      </ul>
    </div>
  );
}

function App() {
  const {
    state,
    patientAge,
    allObservationsReady,
    handleStart,
    handleResetAll,
    handleSetActiveStep,
    handlePatientSelect,
    setImcGlobal,
    setImcObs,
    setFindriscObs,
    setFraminghamObs,
    setWaistObs,
    handleGenerateComposition,
    handleSendToFhir,
    handleCopyComposition,
    handleShowObsModal,
    handleHideObsModal,
    handleSetObsTab,
    handleSetCopiedObs,
    isStepEnabled,
  } = useConsultaFHIR();

  const {
    started,
    selectedPatient,
    patientSelectionEnabled,
    observations,
    imcGlobal,
    compositionJson,
    isCompositionStale,
    isGenerating,
    sending,
    sendResult,
    activeStep,
    ui: { showObsModal, activeObsTab, copied, copiedObs },
  } = state;

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
        {!started && <ModeSelector onStart={handleStart} />}

        {started && (
          <>
            <PatientSelector
              onPatientSelect={handlePatientSelect}
              disabled={!patientSelectionEnabled}
            />

            {selectedPatient && patientAge && (
              <>
                <div className="steps-header">
                  <nav className="step-nav">
                    {STEPS.map((step, index) => {
                      const completed =
                        (step.id === "paciente" && !!selectedPatient) ||
                        (step.id === "findrisc" && !!observations.findrisc) ||
                        (step.id === "framingham" &&
                          !!observations.framingham) ||
                        (step.id === "reporte" && !!compositionJson) ||
                        (step.id === "referencias" && !!compositionJson);

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
                        <div key={step.id} className="step-wrapper">
                          {index > 0 && (
                            <span className="step-separator">›</span>
                          )}
                          <button
                            type="button"
                            className={classes}
                            onClick={() =>
                              enabled && handleSetActiveStep(step.id)
                            }
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
                    title="Iniciar nueva consulta"
                  >
                    <FaArrowsRotate size={14} />
                  </button>
                </div>

                {activeStep === "paciente" && (
                  <PatientSummary patient={selectedPatient} age={patientAge} />
                )}

                <div className="forms-wrapper">
                  <div
                    style={{
                      display: activeStep === "findrisc" ? "block" : "none",
                    }}
                  >
                    <FindriscForm
                      age={patientAge}
                      gender={selectedPatient.gender}
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
                      imc={imcGlobal}
                      setFraminghamObs={setFraminghamObs}
                    />
                  </div>
                </div>

                {activeStep === "reporte" && (
                  <>
                    {allObservationsReady && (
                      <div className="fhir-actions-row">
                        {(!compositionJson || isCompositionStale) && (
                          <button
                            type="button"
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
                        {compositionJson && (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={handleSendToFhir}
                            disabled={sending}
                          >
                            {sending
                              ? "Enviando Bundle a FHIR..."
                              : "Enviar a servidor FHIR (Bundle transaction)"}
                          </button>
                        )}
                      </div>
                    )}

                    {!allObservationsReady && (
                      <div className="alert-warning">
                        Completa los formularios de FINDRISC e IMC/Framingham
                        para generar el documento clínico FHIR.
                      </div>
                    )}

                    <SendResult sendResult={sendResult} />

                    {compositionJson && (
                      <div className="fhir-json-container">
                        <div className="fhir-json-header">
                          <h3>Documento Clínico FHIR (Composition)</h3>
                        </div>
                        <div className="fhir-json-actions">
                          <CopyButton
                            onClick={handleCopyComposition}
                            copied={copied}
                          />
                          <button
                            type="button"
                            className="copy-button"
                            onClick={handleShowObsModal}
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

                {activeStep === "referencias" && <ReferencesSection />}
              </>
            )}
          </>
        )}

        {showObsModal && (
          <ObsModal
            observations={observations}
            activeObsTab={activeObsTab}
            copiedObs={copiedObs}
            onClose={handleHideObsModal}
            onSetTab={handleSetObsTab}
            onSetCopiedObs={handleSetCopiedObs}
          />
        )}
      </main>
    </div>
  );
}

export default App;
