// src/fhir/fhirClient.js
const FHIR_BASE = "http://fhirserver.hl7fundamentals.org/fhir";

export async function sendTransactionBundle(bundle) {
  const response = await fetch(`${FHIR_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/fhir+json",
    },
    body: JSON.stringify(bundle),
  });

  const body = await response.json();

  return { ok: response.ok, status: response.status, body };
}
