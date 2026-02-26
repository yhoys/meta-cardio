const FHIR_BASE = (
  import.meta.env.VITE_FHIR_BASE_URL ??
  "https://fhirserver.hl7fundamentals.org/fhir"
).replace(/\/$/, "");

export async function sendTransactionBundle(bundle) {
  const response = await fetch(FHIR_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
    },
    body: JSON.stringify(bundle),
  });

  let body = null;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("json")) {
    body = await response.json();
  }

  return { ok: response.ok, status: response.status, body };
}
