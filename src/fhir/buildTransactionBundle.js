import { buildComposition } from "./buildComposition";

const LOINC_IMC = "39156-5";
const LOINC_FINDRISC = "97064-0";
const LOINC_FRAMINGHAM = "65853-4";
const LOINC_WAIST = "8280-0";

const LOINC_BASE = new Set([LOINC_IMC, LOINC_WAIST]);

function hasLoinc(obs, code) {
  return obs.code?.coding?.some(
    (c) => c.system === "http://loinc.org" && c.code === code,
  );
}

function getRefByLoinc(observations, obsFullUrls, loincCode) {
  const index = observations.findIndex((obs) => hasLoinc(obs, loincCode));
  if (index === -1) {
    throw new Error(
      `No se encontró la observación con código LOINC ${loincCode}.`,
    );
  }
  return obsFullUrls[index];
}

function isBase(obs) {
  return obs.code?.coding?.some(
    (c) => c.system === "http://loinc.org" && LOINC_BASE.has(c.code),
  );
}

export function buildTransactionBundle({ patient, device, observations }) {
  if (!patient || !device || !Array.isArray(observations)) {
    throw new Error("Datos incompletos para construir el Bundle.");
  }
  if (observations.length !== 4) {
    throw new Error(
      "Se requieren exactamente 4 observaciones (IMC, FINDRISC, Framingham, Waist).",
    );
  }

  const patientFullUrl = "urn:uuid:patient-1";
  const deviceFullUrl = "urn:uuid:device-1";

  const { id: _id, ...patientWithoutId } = patient;

  const obsFullUrls = observations.map((_obs, i) => `urn:uuid:obs-${i + 1}`);

  const imcRef = getRefByLoinc(observations, obsFullUrls, LOINC_IMC);
  const findriscRef = getRefByLoinc(observations, obsFullUrls, LOINC_FINDRISC);
  const framinghamRef = getRefByLoinc(
    observations,
    obsFullUrls,
    LOINC_FRAMINGHAM,
  );
  const waistRef = getRefByLoinc(observations, obsFullUrls, LOINC_WAIST);

  const observationsWithRefs = observations.map((obs) => ({
    ...obs,
    subject: { reference: patientFullUrl },
    device: { reference: deviceFullUrl },
    ...(!isBase(obs) && {
      derivedFrom: [{ reference: imcRef }, { reference: waistRef }],
    }),
  }));

  const composition = buildComposition(
    patientFullUrl,
    findriscRef,
    imcRef,
    framinghamRef,
    waistRef,
  );

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: [
      {
        fullUrl: patientFullUrl,
        resource: patientWithoutId,
        request: { method: "POST", url: "Patient" },
      },
      {
        fullUrl: deviceFullUrl,
        resource: device,
        request: { method: "PUT", url: "Device/meta-cardio-app" },
      },
      ...observationsWithRefs.map((obs, i) => ({
        fullUrl: obsFullUrls[i],
        resource: obs,
        request: { method: "POST", url: "Observation" },
      })),
      {
        fullUrl: "urn:uuid:composition-1",
        resource: composition,
        request: { method: "POST", url: "Composition" },
      },
    ],
  };
}
