// src/fhir/buildTransactionBundle.js
export function buildTransactionBundle({
  patient,
  device,
  observations,
  composition,
}) {
  const patientFullUrl = "urn:uuid:patient-1";
  const deviceFullUrl = "urn:uuid:device-1";

  const { id: ID_UNUSED, ...patientWithoutId } = patient;

  const observationsWithRefs = observations.map((obs) => ({
    ...obs,
    subject: { reference: patientFullUrl },
    device: { reference: deviceFullUrl },
  }));

  const compositionWithRefs = {
    ...composition,
    subject: { reference: patientFullUrl },
  };

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: [
      {
        fullUrl: patientFullUrl,
        resource: patientWithoutId,
        request: {
          method: "POST",
          url: "Patient",
        },
      },
      {
        fullUrl: deviceFullUrl,
        resource: device,
        request: {
          method: "PUT",
          url: "Device/meta-cardio-app",
        },
      },
      ...observationsWithRefs.map((obs, i) => ({
        fullUrl: `urn:uuid:obs-${i + 1}`,
        resource: obs,
        request: {
          method: "POST",
          url: "Observation",
        },
      })),
      {
        fullUrl: "urn:uuid:composition-1",
        resource: compositionWithRefs,
        request: {
          method: "POST",
          url: "Composition",
        },
      },
    ],
  };
}
