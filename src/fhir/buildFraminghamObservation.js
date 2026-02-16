export function buildFraminghamObservation(
  patientId,
  riesgoOriginal,
  riesgoAjustado,
  clasificacion,
  modeloUsado,
) {
  return {
    resourceType: "Observation",
    id: `framingham-${Date.now()}`,
    status: "final",

    category: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "survey",
            display: "Survey",
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
      system: "http://unitsofmeasure.org",
      code: "%",
    },

    referenceRange: [
      {
        high: {
          value: 10,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%",
        },
        text: "Bajo Riesgo",
      },
      {
        low: {
          value: 10,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%",
        },
        high: {
          value: 20,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%",
        },
        text: "Riesgo Intermedio",
      },
      {
        low: {
          value: 20,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%",
        },
        text: "Alto Riesgo",
      },
    ],

    interpretation: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
            code: riesgoAjustado < 10 ? "L" : riesgoAjustado < 20 ? "N" : "H",
            display:
              riesgoAjustado < 10
                ? "Low"
                : riesgoAjustado < 20
                  ? "Normal/Intermediate"
                  : "High",
          },
        ],
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
          system: "http://unitsofmeasure.org",
          code: "%",
        },
      },
      {
        code: {
          text: "Adjustment Factor Applied",
        },
        valueDecimal: 0.75,
      },
      {
        code: {
          text: "Risk model type",
        },
        valueString: modeloUsado,
      },
    ],

    method: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "450759008",
          display: "Framingham risk score",
        },
      ],
      text: "D'Agostino 2008 General CVD Risk Profile (adjusted x0.75 Colombia)",
    },
  };
}
