import patientsBundle from "../data/patients.json";

function PatientSelector({ onPatientSelect }) {
  const patients = patientsBundle.entry
    .map((e) => e.resource)
    .filter((p) => p.active);

  return (
    <div>
      <h2>Seleccionar paciente</h2>

      <select
        onChange={(e) => {
          const selected = patients.find((p) => p.id === e.target.value);
          onPatientSelect(selected);
        }}
        defaultValue=""
      >
        <option value="" disabled>
          -- Seleccione un paciente --
        </option>

        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name[0].given.join(" ")} {patient.name[0].family}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PatientSelector;
