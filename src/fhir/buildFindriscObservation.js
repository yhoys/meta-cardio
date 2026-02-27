const CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "survey",
  display: "Survey",
};

const CODE_LOINC = {
  system: "http://loinc.org",
  code: "97064-0",
  display: "Total risk score FINDRISC",
};

const METHOD_SNOMED = {
  system: "http://snomed.info/sct",
  code: "450321004",
  display: "Finnish diabetes risk score",
};

const UCUM_PERCENT = {
  unit: "%",
  system: "http://unitsofmeasure.org",
  code: "%",
};

const UCUM_SCORE = {
  unit: "points",
};

const INTERPRETATION_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation";

const INTERPRETATION_MAP = {
  Bajo: "L",
  "Ligeramente elevado": "N",
  Moderado: "H",
  Alto: "HH",
  "Muy alto": "HH",
};

function mapInterpretation(classification) {
  return {
    coding: [
      {
        system: INTERPRETATION_SYSTEM,
        code: INTERPRETATION_MAP[classification] ?? "N",
      },
    ],
    text: classification,
  };
}

function normalizePercentage(value) {
  return typeof value === "string" ? parseFloat(value.replace("%", "")) : value;
}

export function buildFindriscObservation(
  score,
  classification,
  riskPercentage,
) {
  if (score == null || classification == null || riskPercentage == null) {
    throw new Error(
      "Datos incompletos para construir la observación FINDRISC.",
    );
  }

  const riskValue = normalizePercentage(riskPercentage);

  return {
    resourceType: "Observation",
    status: "final",

    category: [{ coding: [CATEGORY] }],

    code: {
      coding: [CODE_LOINC],
      text: "Puntaje total FINDRISC",
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: score,
      ...UCUM_SCORE,
    },

    interpretation: [mapInterpretation(classification)],

    component: [
      {
        code: { text: "Estimated 10-year risk of diabetes mellitus" },
        valueQuantity: {
          value: riskValue,
          ...UCUM_PERCENT,
        },
      },
    ],

    method: {
      coding: [METHOD_SNOMED],
      text: "FINDRISC questionnaire (Lindström & Tuomilehto, 2003)",
    },
  };
}
