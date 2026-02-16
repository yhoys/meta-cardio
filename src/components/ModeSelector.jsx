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
        style={{
          marginTop: "2rem",
          padding: "0.9rem 2.2rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#0f766e",
          color: "white",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(15,118,110,0.3)",
        }}
      >
        Iniciar Evaluación
      </button>
    </div>
  );
}

export default ModeSelector;
