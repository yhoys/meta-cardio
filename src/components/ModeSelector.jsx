function ModeSelector({ onStart }) {
  return (
    <div className="mode-container">
      <h2>Meta Cardio - Evaluación de Riesgo</h2>
      <p style={{ marginTop: "0.5rem", color: "#64748b" }}>
        Esta herramienta permite calcular el riesgo cardiovascular y metabólico
        de un paciente, generando un documento clínico FHIR con los resultados.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="primary-button"
        style={{ marginTop: "2rem" }}
      >
        Iniciar Evaluación
      </button>
    </div>
  );
}

export default ModeSelector;
