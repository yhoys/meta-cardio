import { useState } from "react";
import { buildFindriscObservation } from "../fhir/buildFindriscObservation";
import { buildIMCObservation } from "../fhir/buildIMCObservation";
import { buildWaistObservation } from "../fhir/buildWaistObservation";

function FindriscForm({
  age,
  gender,
  patientId,
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calcularIMC = () => {
    const peso = parseFloat(formData.peso);
    const tallaCm = parseFloat(formData.talla);

    if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
      const tallaM = tallaCm / 100; // Convertir cm a metros
      return peso / (tallaM * tallaM);
    }
    return null;
  };

  const clasificarIMC = (imc) => {
    if (imc < 18.5) {
      return { nivel: "Bajo peso", color: "#3b82f6" };
    }
    if (imc < 25) {
      return { nivel: "Normal", color: "#16a34a" };
    }
    if (imc < 30) {
      return { nivel: "Sobrepeso", color: "#f97316" };
    }
    return { nivel: "Obesidad", color: "#dc2626" };
  };

  const calcularFindrisc = () => {
    let puntos = 0;

    // Edad
    if (age < 45) puntos += 0;
    else if (age <= 54) puntos += 2;
    else if (age <= 64) puntos += 3;
    else puntos += 4;

    // IMC
    const imc = calcularIMC();
    if (!isNaN(imc)) {
      if (imc < 25) puntos += 0;
      else if (imc < 30) puntos += 1;
      else puntos += 3;
    }

    // Perímetro
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

    // Actividad física
    if (formData.actividadFisica === "no") puntos += 2;

    // Frutas y verduras
    if (formData.frutasVerduras === "no") puntos += 1;

    // Antihipertensivos
    if (formData.antihipertensivos === "sí") puntos += 2;

    // Glucosa
    if (formData.glucosaAlta === "sí") puntos += 5;

    // Antecedentes familiares
    if (formData.antecedentes === "segundoGrado") puntos += 3;
    else if (formData.antecedentes === "primerGrado") puntos += 5;

    return puntos;
  };

  const clasificarRiesgo = (puntos) => {
    if (puntos < 7) {
      return { nivel: "Bajo", riesgoEstimado: "1%", color: "#16a34a" };
    }
    if (puntos <= 11) {
      return {
        nivel: "Ligeramente elevado",
        riesgoEstimado: "4%",
        color: "#eab308",
      };
    }
    if (puntos <= 14) {
      return { nivel: "Moderado", riesgoEstimado: "17%", color: "#f97316" };
    }
    if (puntos <= 20) {
      return { nivel: "Alto", riesgoEstimado: "33%", color: "#dc2626" };
    }
    return { nivel: "Muy alto", riesgoEstimado: "50%", color: "#7f1d1d" };
  };

  const handleCalcular = () => {
    const imcValue = calcularIMC();
    if (!imcValue) {
      alert("Debe ingresar peso y talla válidos.");
      return;
    }

    if (!formData.perimetro) {
      alert("Debe ingresar un perímetro abdominal.");
      return;
    }

    if (
      !formData.actividadFisica ||
      !formData.frutasVerduras ||
      !formData.antihipertensivos ||
      !formData.glucosaAlta ||
      !formData.antecedentes
    ) {
      alert("Complete todas las preguntas del FINDRISC.");
      return;
    }

    setImcGlobal(imcValue);

    const puntos = calcularFindrisc();
    setResultado(puntos);

    const riesgo = clasificarRiesgo(puntos);
    const findriscObservation = buildFindriscObservation(
      patientId,
      puntos,
      riesgo.nivel,
      riesgo.riesgoEstimado,
    );

    const imcClasificacion = clasificarIMC(imcValue);
    const imcObservation = buildIMCObservation(
      patientId,
      imcValue,
      imcClasificacion.nivel,
    );

    const perimetro = parseFloat(formData.perimetro);
    const waistObservation = buildWaistObservation(patientId, perimetro);

    setFindriscObs(findriscObservation);
    setImcObs(imcObservation);
    setWaistObs(waistObservation);
  };

  const imcActual = calcularIMC();
  const imcInfo = imcActual ? clasificarIMC(imcActual) : null;

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
            value={formData.talla || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Perímetro abdominal (cm):</label>
          <input
            type="number"
            name="perimetro"
            value={formData.perimetro || ""}
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
          <label>Uso de antihipertensivos:</label>
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
              <p>
                {riesgo.nivel === "Bajo" &&
                  "Riesgo reducido de desarrollar diabetes tipo 2 en los próximos 10 años."}

                {riesgo.nivel === "Ligeramente elevado" &&
                  "Existe un riesgo leve. Se recomienda mantener hábitos saludables."}

                {riesgo.nivel === "Moderado" &&
                  "Riesgo intermedio. Se recomienda evaluación médica y cambios en estilo de vida."}

                {riesgo.nivel === "Alto" &&
                  "Alto riesgo. Se recomienda evaluación clínica y control metabólico."}

                {riesgo.nivel === "Muy alto" &&
                  "Riesgo muy elevado. Se recomienda intervención médica inmediata."}
              </p>
              <strong>Riesgo estimado a 10 años:</strong>{" "}
              {riesgo.riesgoEstimado}
            </div>
          );
        })()}
    </div>
  );
}

export default FindriscForm;
