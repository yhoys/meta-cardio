export function buildFindriscObservation(patientId, score, classification) {
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
          system: "http://snomed.info/sct",
          code: "44054006",
          display: "Diabetes mellitus type 2 risk",
        },
      ],
      text: "FINDRISC Score",
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

    method: {
      text: "FINDRISC questionnaire",
    },
  };
}
