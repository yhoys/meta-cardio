import { useState } from "react";

function FindriscForm({ age }) {
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
    </div>
  );
}

export default FindriscForm;
