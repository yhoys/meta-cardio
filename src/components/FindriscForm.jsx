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

      <div>
        <label>Actividad física regular:</label>
        <select
          name="actividadFisica"
          value={formData.actividadFisica}
          onChange={handleChange}
        >
          <option value="">Seleccione</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label>Consumo diario de frutas/verduras:</label>
        <select
          name="frutasVerduras"
          value={formData.frutasVerduras}
          onChange={handleChange}
        >
          <option value="">Seleccione</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label>Uso de antihipertensivos:</label>
        <select
          name="antihipertensivos"
          value={formData.antihipertensivos}
          onChange={handleChange}
        >
          <option value="">Seleccione</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label>Historia de glucosa elevada:</label>
        <select
          name="glucosaAlta"
          value={formData.glucosaAlta}
          onChange={handleChange}
        >
          <option value="">Seleccione</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
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
