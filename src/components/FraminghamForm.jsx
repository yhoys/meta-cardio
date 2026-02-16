import { useState } from "react";
import { buildFraminghamObservation } from "../fhir/buildFraminghamObservation";

function FraminghamForm({ age, gender, imc, patientId, setFraminghamObs }) {
  const [usaLaboratorio, setUsaLaboratorio] = useState(null);

  const [formData, setFormData] = useState({
    colesterolTotal: "",
    hdl: "",
    pas: "",
    tratamiento: "",
    fumador: "",
    diabetes: "",
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isMale = gender === "male" || gender === "M" || gender === "masculino";
  const isFemale =
    gender === "female" || gender === "F" || gender === "femenino";

  // Modelo Lipídico
  const calcularModeloLipidico = () => {
    const colesterol = parseFloat(formData.colesterolTotal);
    const hdl = parseFloat(formData.hdl);
    const pas = parseFloat(formData.pas);

    if (
      !colesterol ||
      !hdl ||
      !pas ||
      pas <= 0 ||
      colesterol <= 0 ||
      hdl <= 0
    ) {
      alert(
        "Debe ingresar colesterol total, HDL y presión arterial sistólica válidos",
      );
      return null;
    }

    if (!isMale && !isFemale) {
      alert("Género del paciente no reconocido para el modelo Framingham.");
      return null;
    }

    const lnEdad = Math.log(age);
    const lnCol = Math.log(colesterol);
    const lnHdl = Math.log(hdl);
    const lnPas = Math.log(pas);

    let sum = 0;
    let s0 = 0;
    let media = 0;

    if (isMale) {
      sum =
        3.06117 * lnEdad +
        1.1237 * lnCol +
        -0.93263 * lnHdl +
        (formData.tratamiento === "si" || formData.tratamiento === "sí"
          ? 1.99881 * lnPas
          : 1.93303 * lnPas) +
        (formData.fumador === "si" || formData.fumador === "sí" ? 0.65451 : 0) +
        (formData.diabetes === "si" || formData.diabetes === "sí"
          ? 0.57367
          : 0);

      s0 = 0.88936;
      media = 23.9802;
    }

    if (isFemale) {
      sum =
        2.32888 * lnEdad +
        1.20904 * lnCol +
        -0.70833 * lnHdl +
        (formData.tratamiento === "si" || formData.tratamiento === "sí"
          ? 2.82263 * lnPas
          : 2.76157 * lnPas) +
        (formData.fumador === "si" || formData.fumador === "sí" ? 0.52873 : 0) +
        (formData.diabetes === "si" || formData.diabetes === "sí"
          ? 0.69154
          : 0);

      s0 = 0.95012;
      media = 26.0145;
    }

    return (1 - Math.pow(s0, Math.exp(sum - media))) * 100;
  };

  // Modelo basado en IMC
  const calcularModeloIMC = () => {
    const imcValue = imc;
    const pas = parseFloat(formData.pas);

    if (!imcValue || !pas || pas <= 0) {
      alert("Debe existir un IMC calculado y una presión sistólica válida.");
      return null;
    }

    if (!isMale && !isFemale) {
      alert("Género del paciente no reconocido para el modelo Framingham.");
      return null;
    }

    const lnEdad = Math.log(age);
    const lnIMC = Math.log(imcValue);
    const lnPas = Math.log(pas);

    let sum = 0;
    let s0 = 0;
    let media = 0;

    if (isMale) {
      sum =
        3.11296 * lnEdad +
        0.79277 * lnIMC +
        (formData.tratamiento === "si" || formData.tratamiento === "sí"
          ? 1.92672 * lnPas
          : 1.85508 * lnPas) +
        (formData.fumador === "si" || formData.fumador === "sí" ? 0.70953 : 0) +
        (formData.diabetes === "si" || formData.diabetes === "sí" ? 0.5316 : 0);

      s0 = 0.88431;
      media = 23.9388;
    }

    if (isFemale) {
      sum =
        2.72107 * lnEdad +
        0.51125 * lnIMC +
        (formData.tratamiento === "si" || formData.tratamiento === "sí"
          ? 2.81291 * lnPas
          : 2.88267 * lnPas) +
        (formData.fumador === "si" || formData.fumador === "sí" ? 0.61868 : 0) +
        (formData.diabetes === "si" || formData.diabetes === "sí"
          ? 0.77763
          : 0);

      s0 = 0.94833;
      media = 26.0145;
    }

    return (1 - Math.pow(s0, Math.exp(sum - media))) * 100;
  };

  const calcularFramingham = () => {
    if (!usaLaboratorio) {
      alert("Debe seleccionar si tiene o no laboratorio.");
      return null;
    }

    if (
      !formData.pas ||
      !formData.tratamiento ||
      !formData.fumador ||
      !formData.diabetes
    ) {
      alert("Completar presión, tratamiento, tabaquismo y diabetes.");
      return null;
    }

    let riesgoOriginal = null;

    if (usaLaboratorio === "si") {
      riesgoOriginal = calcularModeloLipidico();
    } else if (usaLaboratorio === "no") {
      riesgoOriginal = calcularModeloIMC();
    }

    if (riesgoOriginal === null || isNaN(riesgoOriginal)) return null;

    const riesgoAjustado = riesgoOriginal * 0.75; // Ajuste por población colombiana

    return {
      original: parseFloat(riesgoOriginal.toFixed(2)),
      ajustado: parseFloat(riesgoAjustado.toFixed(2)),
    };
  };

  const clasificarRiesgo = (porcentaje) => {
    if (porcentaje < 10) return { nivel: "Bajo", color: "#16a34a" };
    if (porcentaje < 20) return { nivel: "Intermedio", color: "#f97316" };
    return { nivel: "Alto", color: "#dc2626" };
  };

  const handleCalcular = () => {
    const r = calcularFramingham();
    if (!r) return;

    const clasificacion = clasificarRiesgo(r.ajustado);
    const modeloUsado =
      usaLaboratorio === "si" ? "Lipid-based model" : "BMI-based model";

    const observation = buildFraminghamObservation(
      patientId,
      r.original,
      r.ajustado,
      clasificacion.nivel,
      modeloUsado,
    );

    setFraminghamObs(observation);
    setResultado(r);
  };

  return (
    <div className="section-card">
      <h2>Riesgo Cardiovascular a 10 años (Framingham)</h2>
      <small>
        Estimación del riesgo de infarto y ACV en 10 años (ajustado para
        población colombiana).
      </small>

      <div className="form-field">
        <label>¿Dispone de resultados de colesterol total y HDL?</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              value="si"
              checked={usaLaboratorio === "si"}
              onChange={() => setUsaLaboratorio("si")}
            />
            Sí
          </label>

          <label className="radio-option">
            <input
              type="radio"
              value="no"
              checked={usaLaboratorio === "no"}
              onChange={() => setUsaLaboratorio("no")}
            />
            No
          </label>
        </div>
      </div>

      <div className="form-grid">
        {usaLaboratorio === "si" && (
          <>
            <div className="form-field">
              <label>Colesterol total (mg/dL):</label>
              <input
                type="number"
                name="colesterolTotal"
                value={formData.colesterolTotal || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>HDL (mg/dL):</label>
              <input
                type="number"
                name="hdl"
                value={formData.hdl || ""}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="form-field">
          <label>Presión arterial sistólica (mmHg):</label>
          <input
            type="number"
            name="pas"
            value={formData.pas || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Tratamiento antihipertensivo:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="tratamiento"
                value="si"
                checked={formData.tratamiento === "si"}
                onChange={handleChange}
              />
              Sí
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="tratamiento"
                value="no"
                checked={formData.tratamiento === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>Fumador:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="fumador"
                value="si"
                checked={formData.fumador === "si"}
                onChange={handleChange}
              />
              Sí
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="fumador"
                value="no"
                checked={formData.fumador === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>Diabetes conocida:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="diabetes"
                value="si"
                checked={formData.diabetes === "si"}
                onChange={handleChange}
              />
              Sí
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="diabetes"
                value="no"
                checked={formData.diabetes === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>
      </div>

      <button className="primary-button" onClick={handleCalcular}>
        Calcular riesgo cardiovascular
      </button>

      {resultado &&
        (() => {
          const clasificacion = clasificarRiesgo(resultado.ajustado);

          return (
            <div
              className="result-card"
              style={{ borderLeftColor: clasificacion.color }}
            >
              <p>
                <strong>Modelo original:</strong> {resultado.original}%
              </p>
              <p>
                <strong>Riesgo ajustado (Colombia):</strong>{" "}
                {resultado.ajustado}%
              </p>
              <h4 style={{ color: clasificacion.color }}>
                Clasificación (ajustado): {clasificacion.nivel}
              </h4>
            </div>
          );
        })()}
    </div>
  );
}

export default FraminghamForm;
