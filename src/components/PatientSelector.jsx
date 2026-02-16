import patientsBundle from "../data/patients.json";

function PatientSelector({ onPatientSelect }) {
  const patients = (patientsBundle.entry || [])
    .map((e) => e.resource)
    .filter((p) => p && p.active);

  const handleChange = (e) => {
    const id = e.target.value;
    const selected = patients.find((p) => p.id === id) || null;
    onPatientSelect(selected);
  };

  if (!patients.length) {
    return <p>No se encontraron pacientes activos.</p>;
  }

  return (
    <div>
      <h2>Seleccionar paciente</h2>

      <select onChange={handleChange} defaultValue="">
        <option value="" disabled>
          -- Seleccione un paciente --
        </option>

        {patients.map((patient) => {
          const name = patient.name?.[0];
          const given = name?.given?.join(" ") || "";
          const family = name?.family || "";
          const label = `${given} ${family}`.trim() || `Paciente ${patient.id}`;

          return (
            <option key={patient.id} value={patient.id}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default PatientSelector;
