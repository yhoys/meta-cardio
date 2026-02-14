import { useState } from "react";

function FindriscForm({ age, gender }) {
  const [formData, setFormData] = useState({
    imc: "",
    perimetro: "",
    actividadFisica: "",
    frutasVerduras: "",
    antihipertensivos: "",
    glucosaAlta: "",
    antecedentes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calcularFindrisc = () => {
    let puntos = 0;

    // Edad
    if (age < 45) puntos += 0;
    else if (age <= 54) puntos += 2;
    else if (age <= 64) puntos += 3;
    else puntos += 4;

    // IMC
    const imc = parseFloat(formData.imc);
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
      }

      if (gender === "female") {
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
      return { nivel: "Bajo", color: "#16a34a" };
    }
    if (puntos <= 11) {
      return { nivel: "Ligeramente elevado", color: "#eab308" };
    }
    if (puntos <= 14) {
      return { nivel: "Moderado", color: "#f97316" };
    }
    if (puntos <= 20) {
      return { nivel: "Alto", color: "#dc2626" };
    }
    return { nivel: "Muy alto", color: "#7f1d1d" };
  };

  const [resultado, setResultado] = useState(null);

  return (
    <div style={{ marginTop: "3rem" }}>
      <h2>Escala FINDRISC</h2>

      <p>Edad: {age} años</p>

      <div>
        <label>IMC:</label>
        <input
          type="number"
          name="imc"
          value={formData.imc}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Perímetro abdominal (cm):</label>
        <input
          type="number"
          name="perimetro"
          value={formData.perimetro}
          onChange={handleChange}
        />
      </div>

      <label>Actividad física regular:</label>
      <div>
        <label>
          <input
            type="radio"
            name="actividadFisica"
            value="sí"
            checked={formData.actividadFisica === "sí"}
            onChange={handleChange}
          />
          Sí
        </label>

        <label style={{ marginLeft: "1rem" }}>
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

      <label>Consumo diario de frutas y verduras:</label>
      <div>
        <label>
          <input
            type="radio"
            name="frutasVerduras"
            value="sí"
            checked={formData.frutasVerduras === "sí"}
            onChange={handleChange}
          />
          Sí
        </label>
        <label style={{ marginLeft: "1rem" }}>
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

      <label>Uso de antihipertensivos:</label>
      <div>
        <label>
          <input
            type="radio"
            name="antihipertensivos"
            value="sí"
            checked={formData.antihipertensivos === "sí"}
            onChange={handleChange}
          />
          Sí
        </label>
        <label style={{ marginLeft: "1rem" }}>
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

      <label>Glucosa alta en sangre:</label>
      <div>
        <label>
          <input
            type="radio"
            name="glucosaAlta"
            value="sí"
            checked={formData.glucosaAlta === "sí"}
            onChange={handleChange}
          />
          Sí
        </label>
        <label style={{ marginLeft: "1rem" }}>
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

      <div>
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

      <button
        style={{ marginTop: "2rem" }}
        onClick={() => setResultado(calcularFindrisc())}
      >
        Calcular riesgo
      </button>

      {resultado !== null && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Puntaje FINDRISC: {resultado}</h3>

          {(() => {
            const riesgo = clasificarRiesgo(resultado);

            return (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  borderLeft: `6px solid ${riesgo.color}`,
                }}
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
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default FindriscForm;
