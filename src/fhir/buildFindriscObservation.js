export function buildFindriscObservation(
  patientId,
  score,
  classification,
  riskPercentage,
) {
  return {
    resourceType: "Observation",
    id: "findrisc-" + Date.now(),
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
          code: "97064-0",
          display: "Total risk score FINDRISC",
        },
      ],
      text: "Puntaje total FINDRISC",
    },

    subject: {
      reference: `Patient/${patientId}`,
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: score,
      unit: "points",
    },

    interpretation: [
      {
        text: classification,
      },
    ],

    component: [
      {
        code: {
          text: "Estimated 10-year risk",
        },
        valueQuantity: {
          value: parseInt(riskPercentage),
          unit: "%",
        },
      },
    ],

    method: {
      text: "FINDRISC questionnaire (Lindström & Tuomilehto, 2003)",
    },
  };
}
