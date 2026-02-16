function ModeSelector({ onSelect }) {
  return (
    <div className="mode-container">
      <h2>¿Cómo deseas realizar la evaluación?</h2>

      <div className="mode-cards">
        <div
          className="mode-card"
          role="button"
          tabIndex={0}
          onClick={() => onSelect("profesional")}
          onKeyDown={(e) => e.key === "Enter" && onSelect("profesional")}
        >
          <h3>Profesional de Salud</h3>
          <p>Seleccionar paciente desde el sistema.</p>
        </div>

        <div
          className="mode-card"
          role="button"
          tabIndex={0}
          onClick={() => onSelect("paciente")}
          onKeyDown={(e) => e.key === "Enter" && onSelect("paciente")}
        >
          <h3>Paciente</h3>
          <p>Ingresar información manualmente.</p>
        </div>
      </div>
    </div>
  );
}

export default ModeSelector;
