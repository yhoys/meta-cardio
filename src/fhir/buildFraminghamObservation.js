const CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "survey",
  display: "Survey",
};

const CODE_LOINC = {
  system: "http://loinc.org",
  code: "65853-4",
  display: "General cardiovascular disease 10Y risk [#] Framingham.D'Agostino",
};

const METHOD_SNOMED = {
  system: "http://snomed.info/sct",
  code: "450759008",
  display: "Framingham risk score",
};

const INTERPRETATION_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation";

const UCUM_PERCENT = {
  unit: "%",
  system: "http://unitsofmeasure.org",
  code: "%",
};

const RIESGO_INTERPRETATION = {
  bajo: { code: "L", display: "Low" },
  intermedio: { code: "N", display: "Normal/Intermediate" },
  alto: { code: "H", display: "High" },
};

function resolverInterpretacion(riesgoAjustado) {
  if (riesgoAjustado < 10) return RIESGO_INTERPRETATION.bajo;
  if (riesgoAjustado < 20) return RIESGO_INTERPRETATION.intermedio;
  return RIESGO_INTERPRETATION.alto;
}

export function buildFraminghamObservation(
  riesgoOriginal,
  riesgoAjustado,
  clasificacion,
  modeloUsado,
) {
  if (
    riesgoOriginal == null ||
    riesgoAjustado == null ||
    clasificacion == null ||
    modeloUsado == null
  ) {
    throw new Error(
      "Datos incompletos para construir la observación Framingham.",
    );
  }

  const interpretacion = resolverInterpretacion(riesgoAjustado);

  return {
    resourceType: "Observation",
    status: "final",

    category: [{ coding: [CATEGORY] }],

    code: {
      coding: [CODE_LOINC],
      text: "Framingham General Cardiovascular Risk (D'Agostino 2008)",
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: riesgoAjustado,
      ...UCUM_PERCENT,
    },

    referenceRange: [
      {
        high: { value: 10, ...UCUM_PERCENT },
        text: "Bajo Riesgo",
      },
      {
        low: { value: 10, ...UCUM_PERCENT },
        high: { value: 20, ...UCUM_PERCENT },
        text: "Riesgo Intermedio",
      },
      {
        low: { value: 20, ...UCUM_PERCENT },
        text: "Alto Riesgo",
      },
    ],

    interpretation: [
      {
        coding: [
          {
            system: INTERPRETATION_SYSTEM,
            code: interpretacion.code,
            display: interpretacion.display,
          },
        ],
        text: clasificacion,
      },
    ],

    component: [
      {
        code: { text: "Original Framingham risk" },
        valueQuantity: { value: riesgoOriginal, ...UCUM_PERCENT },
      },
      {
        code: { text: "Adjustment Factor Applied" },
        valueDecimal: 0.75,
      },
      {
        code: { text: "Risk model type" },
        valueString: modeloUsado,
      },
    ],

    method: {
      coding: [METHOD_SNOMED],
      text: "D'Agostino 2008 General CVD Risk Profile (adjusted x0.75 Colombia)",
    },
  };
}
