export function buildFraminghamObservation(
  patientId,
  riesgoOriginal,
  riesgoAjustado,
  clasificacion,
  modeloUsado,
) {
  return {
    resourceType: "Observation",
    id: "framingham-" + Date.now(),
    status: "final",

    category: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "exam",
            display: "Exam",
          },
        ],
      },
    ],

    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "65853-4",
          display:
            "General cardiovascular disease 10Y risk [#] Framingham.D'Agostino",
        },
      ],
      text: "Framingham General Cardiovascular Risk (D'Agostino 2008)",
    },

    subject: {
      reference: `Patient/${patientId}`,
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: riesgoAjustado,
      unit: "%",
    },

    interpretation: [
      {
        text: clasificacion,
      },
    ],

    component: [
      {
        code: {
          text: "Original Framingham risk",
        },
        valueQuantity: {
          value: riesgoOriginal,
          unit: "%",
        },
      },
      {
        code: {
          text: "Risk model type",
        },
        valueString: modeloUsado,
      },
    ],

    method: {
      text: "D'Agostino 2008 General CVD Risk Profile (adjusted x0.75 Colombia)",
    },
  };
}
