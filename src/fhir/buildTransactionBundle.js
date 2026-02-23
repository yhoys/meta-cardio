// src/fhir/buildTransactionBundle.js
export function buildTransactionBundle({
  patient,
  device,
  observations,
  composition,
}) {
  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: [
      {
        resource: patient,
        request: {
          method: "POST",
          url: `Patient/${patient.id}`,
        },
      },
      {
        resource: device,
        request: {
          method: "POST",
          url: "Device/meta-cardio-app",
        },
      },
      ...observations.map((obs) => ({
        resource: obs,
        request: {
          method: "POST",
          url: "Observation",
        },
      })),
      {
        resource: composition,
        request: {
          method: "POST",
          url: "Composition",
        },
      },
    ],
  };
}
