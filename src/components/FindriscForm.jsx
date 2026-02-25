import { useState } from "react";
import { buildFindriscObservation } from "../fhir/buildFindriscObservation";
import { buildIMCObservation } from "../fhir/buildIMCObservation";
import { buildWaistObservation } from "../fhir/buildWaistObservation";

function calcularIMC(peso, tallaCm) {
  if (!peso || !tallaCm || tallaCm <= 0) return null;
  const tallaM = tallaCm / 100;
  return peso / (tallaM * tallaM);
}

function clasificarIMC(imc) {
  if (imc < 18.5) return { nivel: "Bajo peso", color: "#3b82f6" };
  if (imc < 25) return { nivel: "Normal", color: "#16a34a" };
  if (imc < 30) return { nivel: "Sobrepeso", color: "#f97316" };
  return { nivel: "Obesidad", color: "#dc2626" };
}

function calcularPuntosFindrisc(formData, imc, age, gender) {
  let puntos = 0;

  // Edad
  if (age < 45) puntos += 0;
  else if (age <= 54) puntos += 2;
  else if (age <= 64) puntos += 3;
  else puntos += 4;

  // IMC
  if (imc !== null) {
    if (imc < 25) puntos += 0;
    else if (imc < 30) puntos += 1;
    else puntos += 3;
  }

  // Perímetro abdominal
  const perimetro = parseFloat(formData.perimetro);
  if (!isNaN(perimetro)) {
    if (gender === "male") {
      if (perimetro < 94) puntos += 0;
      else if (perimetro <= 102) puntos += 3;
      else puntos += 4;
    } else if (gender === "female") {
      if (perimetro < 80) puntos += 0;
      else if (perimetro <= 88) puntos += 3;
      else puntos += 4;
    }
  }

  if (formData.actividadFisica === "no") puntos += 2;
  if (formData.frutasVerduras === "no") puntos += 1;
  if (formData.antihipertensivos === "sí") puntos += 2;
  if (formData.glucosaAlta === "sí") puntos += 5;
  if (formData.antecedentes === "segundoGrado") puntos += 3;
  if (formData.antecedentes === "primerGrado") puntos += 5;

  return puntos;
}

function clasificarRiesgo(puntos) {
  if (puntos < 7)
    return { nivel: "Bajo", riesgoEstimado: "1%", color: "#16a34a" };
  if (puntos <= 11)
    return {
      nivel: "Ligeramente elevado",
      riesgoEstimado: "4%",
      color: "#eab308",
    };
  if (puntos <= 14)
    return { nivel: "Moderado", riesgoEstimado: "17%", color: "#f97316" };
  if (puntos <= 20)
    return { nivel: "Alto", riesgoEstimado: "33%", color: "#dc2626" };
  return { nivel: "Muy alto", riesgoEstimado: "50%", color: "#7f1d1d" };
}

const MENSAJES_RIESGO = {
  Bajo: "Riesgo reducido de desarrollar diabetes tipo 2 en los próximos 10 años.",
  "Ligeramente elevado":
    "Existe un riesgo leve. Se recomienda mantener hábitos saludables.",
  Moderado:
    "Riesgo intermedio. Se recomienda evaluación médica y cambios en estilo de vida.",
  Alto: "Alto riesgo. Se recomienda evaluación clínica y control metabólico.",
  "Muy alto":
    "Riesgo muy elevado. Se recomienda intervención médica inmediata.",
};

function FindriscForm({
  age,
  gender,
  setImcGlobal,
  setImcObs,
  setFindriscObs,
  setWaistObs,
}) {
  const [formData, setFormData] = useState({
    peso: "",
    talla: "",
    perimetro: "",
    actividadFisica: "",
    frutasVerduras: "",
    antihipertensivos: "",
    glucosaAlta: "",
    antecedentes: "",
  });

  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const imcActual = calcularIMC(
    parseFloat(formData.peso),
    parseFloat(formData.talla),
  );
  const imcInfo = imcActual ? clasificarIMC(imcActual) : null;

  const handleCalcular = () => {
    if (!imcActual) {
      setError("Debe ingresar peso y talla válidos.");
      return;
    }
    if (!formData.perimetro) {
      setError("Debe ingresar un perímetro abdominal.");
      return;
    }
    if (
      !formData.actividadFisica ||
      !formData.frutasVerduras ||
      !formData.antihipertensivos ||
      !formData.glucosaAlta ||
      !formData.antecedentes
    ) {
      setError("Complete todas las preguntas del FINDRISC.");
      return;
    }

    setError("");
    setImcGlobal(imcActual);

    const puntos = calcularPuntosFindrisc(formData, imcActual, age, gender);
    const riesgo = clasificarRiesgo(puntos);

    setFindriscObs(
      buildFindriscObservation(puntos, riesgo.nivel, riesgo.riesgoEstimado),
    );
    setImcObs(buildIMCObservation(imcActual, clasificarIMC(imcActual).nivel));
    setWaistObs(buildWaistObservation(parseFloat(formData.perimetro)));
    setResultado(puntos);
  };

  return (
    <div className="section-card">
      <h2>Escala FINDRISC</h2>
      <small>
        Evaluación del riesgo de desarrollar diabetes tipo 2 en 10 años.
      </small>

      <p style={{ marginTop: 0, marginBottom: "1rem", color: "#64748b" }}>
        Edad: {age} años
      </p>

      <div className="form-grid">
        <div className="form-field">
          <label>Peso (kg):</label>
          <input
            type="number"
            name="peso"
            value={formData.peso || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Talla (cm)</label>
          <input
            type="number"
            name="talla"
            value={formData.talla}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Perímetro abdominal (cm):</label>
          <input
            type="number"
            name="perimetro"
            value={formData.perimetro}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Actividad física regular:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="actividadFisica"
                value="sí"
                checked={formData.actividadFisica === "sí"}
                onChange={handleChange}
              />
              Sí
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="actividadFisica"
                value="no"
                checked={formData.actividadFisica === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>Consumo diario de frutas y verduras:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="frutasVerduras"
                value="sí"
                checked={formData.frutasVerduras === "sí"}
                onChange={handleChange}
              />
              Sí
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="frutasVerduras"
                value="no"
                checked={formData.frutasVerduras === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>Tratamiento antihipertensivo:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="antihipertensivos"
                value="sí"
                checked={formData.antihipertensivos === "sí"}
                onChange={handleChange}
              />
              Sí
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="antihipertensivos"
                value="no"
                checked={formData.antihipertensivos === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>Glucosa alta en sangre:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="glucosaAlta"
                value="sí"
                checked={formData.glucosaAlta === "sí"}
                onChange={handleChange}
              />
              Sí
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="glucosaAlta"
                value="no"
                checked={formData.glucosaAlta === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>Antecedentes familiares de diabetes:</label>
          <select
            name="antecedentes"
            value={formData.antecedentes}
            onChange={handleChange}
          >
            <option value="">Seleccione</option>
            <option value="ninguno">Ninguno</option>
            <option value="segundoGrado">Segundo grado</option>
            <option value="primerGrado">Primer grado</option>
          </select>
        </div>
      </div>

      {imcActual && imcInfo && (
        <div className="result-card" style={{ borderLeftColor: imcInfo.color }}>
          <strong>IMC:</strong> {imcActual.toFixed(2)} kg/m²
          <br />
          <strong>Clasificación:</strong>{" "}
          <span style={{ color: imcInfo.color }}>{imcInfo.nivel}</span>
        </div>
      )}

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
        Calcular riesgo FINDRISC
      </button>

      {resultado !== null &&
        (() => {
          const riesgo = clasificarRiesgo(resultado);
          return (
            <div
              className="result-card"
              style={{ borderLeftColor: riesgo.color }}
            >
              <h4 style={{ color: riesgo.color }}>Riesgo: {riesgo.nivel}</h4>
              <p>{MENSAJES_RIESGO[riesgo.nivel]}</p>
              <strong>Riesgo estimado a 10 años:</strong>{" "}
              {riesgo.riesgoEstimado}
            </div>
          );
        })()}
    </div>
  );
}

export default FindriscForm;
