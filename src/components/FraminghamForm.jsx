import { useState } from "react";
import { buildFraminghamObservation } from "../fhir/buildFraminghamObservation";

const isMale = (g) => g === "male" || g === "M" || g === "masculino";
const isFemale = (g) => g === "female" || g === "F" || g === "femenino";
const esSi = (v) => v === "si" || v === "sí";

function calcularModeloLipidico({
  colesterol,
  hdl,
  pas,
  formData,
  age,
  gender,
}) {
  const lnEdad = Math.log(age);
  const lnCol = Math.log(colesterol);
  const lnHdl = Math.log(hdl);
  const lnPas = Math.log(pas);
  const tto = esSi(formData.tratamiento);
  const fuma = esSi(formData.fumador);
  const dm = esSi(formData.diabetes);

  let sum, s0, media;

  if (isMale(gender)) {
    sum =
      3.06117 * lnEdad +
      1.1237 * lnCol +
      -0.93263 * lnHdl +
      (tto ? 1.99881 : 1.93303) * lnPas +
      (fuma ? 0.65451 : 0) +
      (dm ? 0.57367 : 0);
    s0 = 0.88936;
    media = 23.9802;
  } else {
    sum =
      2.32888 * lnEdad +
      1.20904 * lnCol +
      -0.70833 * lnHdl +
      (tto ? 2.82263 : 2.76157) * lnPas +
      (fuma ? 0.52873 : 0) +
      (dm ? 0.69154 : 0);
    s0 = 0.95012;
    media = 26.0145;
  }

  return (1 - Math.pow(s0, Math.exp(sum - media))) * 100;
}

function calcularModeloIMC({ imcValue, pas, formData, age, gender }) {
  const lnEdad = Math.log(age);
  const lnIMC = Math.log(imcValue);
  const lnPas = Math.log(pas);
  const tto = esSi(formData.tratamiento);
  const fuma = esSi(formData.fumador);
  const dm = esSi(formData.diabetes);

  let sum, s0, media;

  if (isMale(gender)) {
    sum =
      3.11296 * lnEdad +
      0.79277 * lnIMC +
      (tto ? 1.92672 : 1.85508) * lnPas +
      (fuma ? 0.70953 : 0) +
      (dm ? 0.5316 : 0);
    s0 = 0.88431;
    media = 23.9388;
  } else {
    sum =
      2.72107 * lnEdad +
      0.51125 * lnIMC +
      (tto ? 2.81291 : 2.88267) * lnPas +
      (fuma ? 0.61868 : 0) +
      (dm ? 0.77763 : 0);
    s0 = 0.94833;
    media = 26.0145;
  }

  return (1 - Math.pow(s0, Math.exp(sum - media))) * 100;
}

function clasificarRiesgo(porcentaje) {
  if (porcentaje < 10) return { nivel: "Bajo", color: "#16a34a" };
  if (porcentaje < 20) return { nivel: "Intermedio", color: "#f97316" };
  return { nivel: "Alto", color: "#dc2626" };
}

function FraminghamForm({ age, gender, imc, setFraminghamObs }) {
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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleCalcular = () => {
    if (!usaLaboratorio) {
      setError("Debe seleccionar si tiene o no laboratorio.");
      return;
    }
    if (
      !formData.pas ||
      !formData.tratamiento ||
      !formData.fumador ||
      !formData.diabetes
    ) {
      setError("Completar presión, tratamiento, tabaquismo y diabetes.");
      return;
    }
    if (!isMale(gender) && !isFemale(gender)) {
      setError("Género del paciente no reconocido para el modelo Framingham.");
      return;
    }

    const pas = parseFloat(formData.pas);
    if (!pas || pas <= 0) {
      setError("Ingrese una presión arterial sistólica válida.");
      return;
    }

    let riesgoOriginal = null;

    if (usaLaboratorio === "si") {
      const colesterol = parseFloat(formData.colesterolTotal);
      const hdl = parseFloat(formData.hdl);
      if (!colesterol || colesterol <= 0 || !hdl || hdl <= 0) {
        setError(
          "Debe ingresar colesterol total, HDL y presión arterial sistólica válidos.",
        );
        return;
      }
      riesgoOriginal = calcularModeloLipidico({
        colesterol,
        hdl,
        pas,
        formData,
        age,
        gender,
      });
    } else {
      if (!imc) {
        setError("Debe existir un IMC calculado en el paso FINDRISC.");
        return;
      }
      riesgoOriginal = calcularModeloIMC({
        imcValue: imc,
        pas,
        formData,
        age,
        gender,
      });
    }

    if (riesgoOriginal === null || isNaN(riesgoOriginal)) return;

    setError("");

    const riesgoAjustado = riesgoOriginal * 0.75; // Ajuste por población colombiana
    const r = {
      original: parseFloat(riesgoOriginal.toFixed(2)),
      ajustado: parseFloat(riesgoAjustado.toFixed(2)),
    };

    const clasificacion = clasificarRiesgo(r.ajustado);
    const modeloUsado =
      usaLaboratorio === "si" ? "Lipid-based model" : "BMI-based model";

    setFraminghamObs(
      buildFraminghamObservation(
        r.original,
        r.ajustado,
        clasificacion.nivel,
        modeloUsado,
      ),
    );
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
              onChange={() => {
                setUsaLaboratorio("si");
                setError("");
              }}
            />
            Sí
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="no"
              checked={usaLaboratorio === "no"}
              onChange={() => {
                setUsaLaboratorio("no");
                setError("");
              }}
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
                value={formData.colesterolTotal}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>HDL (mg/dL):</label>
              <input
                type="number"
                name="hdl"
                value={formData.hdl}
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
            value={formData.pas}
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

      {error && (
        <p
          style={{
            color: "#dc2626",
            marginBottom: "0.75rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </p>
      )}

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
