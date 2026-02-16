import { useState } from "react";

function FraminghamForm({ age, gender, imc }) {
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

  // Modelo Lipídico
  const calcularModeloLipidico = () => {
    const colesterol = parseFloat(formData.colesterolTotal);
    const hdl = parseFloat(formData.hdl);
    const pas = parseFloat(formData.pas);

    if (!colesterol || !hdl || !pas) return null;

    const lnEdad = Math.log(age);
    const lnCol = Math.log(colesterol);
    const lnHdl = Math.log(hdl);
    const lnPas = Math.log(pas);

    let sum = 0;
    let s0 = 0;
    let media = 0;

    if (gender === "male") {
      sum =
        3.06117 * lnEdad +
        1.1237 * lnCol +
        -0.93263 * lnHdl +
        (formData.tratamiento === "si" ? 1.99881 * lnPas : 1.93303 * lnPas) +
        (formData.fumador === "si" ? 0.65451 : 0) +
        (formData.diabetes === "si" ? 0.57367 : 0);

      s0 = 0.88936;
      media = 23.9802;
    }

    if (gender === "female") {
      sum =
        2.32888 * lnEdad +
        1.20904 * lnCol +
        -0.70833 * lnHdl +
        (formData.tratamiento === "si" ? 2.82263 * lnPas : 2.76157 * lnPas) +
        (formData.fumador === "si" ? 0.52873 : 0) +
        (formData.diabetes === "si" ? 0.69154 : 0);

      s0 = 0.95012;
      media = 26.1931;
    }

    return (1 - Math.pow(s0, Math.exp(sum - media))) * 100;
  };

  // Modelo basado en IMC
  const calcularModeloIMC = () => {
    const imcValue = imc;
    const pas = parseFloat(formData.pas);

    if (!imcValue || !pas) return null;

    const lnEdad = Math.log(age);
    const lnIMC = Math.log(imc);
    const lnPas = Math.log(pas);

    let sum = 0;
    let s0 = 0;
    let media = 0;

    if (gender === "male") {
      sum =
        3.11296 * lnEdad +
        0.79277 * lnIMC +
        (formData.tratamiento === "si" ? 1.92672 * lnPas : 1.85508 * lnPas) +
        (formData.fumador === "si" ? 0.70953 : 0) +
        (formData.diabetes === "si" ? 0.5316 : 0);

      s0 = 0.88431;
      media = 23.9388;
    }

    if (gender === "female") {
      sum =
        2.72107 * lnEdad +
        0.51125 * lnIMC +
        (formData.tratamiento === "si" ? 2.81291 * lnPas : 2.88267 * lnPas) +
        (formData.fumador === "si" ? 0.61868 : 0) +
        (formData.diabetes === "si" ? 0.77763 : 0);

      s0 = 0.94833;
      media = 26.0145;
    }

    return (1 - Math.pow(s0, Math.exp(sum - media))) * 100;
  };

  const calcularFramingham = () => {
    let riesgoOriginal = null;

    if (usaLaboratorio === "si") {
      riesgoOriginal = calcularModeloLipidico();
    } else if (usaLaboratorio === "no") {
      riesgoOriginal = calcularModeloIMC();
    }

    if (!riesgoOriginal) return null;

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

  return (
    <div style={{ marginTop: "3rem" }}>
      <h2>Riesgo Cardiovascular a 10 años (Framingham)</h2>

      <div>
        <label>¿Dispone de resultados de colesterol total y HDL?</label>
        <div>
          <label>
            <input
              type="radio"
              value="si"
              checked={usaLaboratorio === "si"}
              onChange={() => setUsaLaboratorio("si")}
            />
            Sí
          </label>

          <label style={{ marginLeft: "1rem" }}>
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

      {usaLaboratorio === "si" && (
        <>
          <div>
            <label>Colesterol total (mg/dL):</label>
            <input
              type="number"
              name="colesterolTotal"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>HDL (mg/dL):</label>
            <input type="number" name="hdl" onChange={handleChange} />
          </div>
        </>
      )}

      <div>
        <label>Presión arterial sistólica (mmHg):</label>
        <input type="number" name="pas" onChange={handleChange} />
      </div>

      <div>
        <label>Tratamiento antihipertensivo:</label>
        <input
          type="radio"
          name="tratamiento"
          value="si"
          onChange={handleChange}
        />{" "}
        Sí
        <input
          type="radio"
          name="tratamiento"
          value="no"
          onChange={handleChange}
          style={{ marginLeft: "1rem" }}
        />{" "}
        No
      </div>

      <div>
        <label>Fumador:</label>
        <input
          type="radio"
          name="fumador"
          value="si"
          onChange={handleChange}
        />{" "}
        Sí
        <input
          type="radio"
          name="fumador"
          value="no"
          onChange={handleChange}
          style={{ marginLeft: "1rem" }}
        />{" "}
        No
      </div>

      <div>
        <label>Diabetes:</label>
        <input
          type="radio"
          name="diabetes"
          value="si"
          onChange={handleChange}
        />{" "}
        Sí
        <input
          type="radio"
          name="diabetes"
          value="no"
          onChange={handleChange}
          style={{ marginLeft: "1rem" }}
        />{" "}
        No
      </div>

      <button
        style={{ marginTop: "2rem" }}
        onClick={() => {
          const r = calcularFramingham();
          if (!r) return;
          setResultado(r);
        }}
      >
        Calcular riesgo cardiovascular
      </button>

      {resultado && (
        <div style={{ marginTop: "1.5rem" }}>
          {(() => {
            const clasificacion = clasificarRiesgo(resultado.ajustado);

            return (
              <div
                style={{
                  padding: "1rem",
                  borderLeft: `6px solid ${clasificacion.color}`,
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                }}
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
      )}
    </div>
  );
}

export default FraminghamForm;
