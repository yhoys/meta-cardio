export function buildComposition(patientId, findriscObservation) {
  return {
    resourceType: "Composition",
    id: "meta-cardio-" + Date.now(),
    status: "final",

    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "34117-2",
          display: "Cardiovascular assessment report",
        },
      ],
      text: "Evaluación de Riesgo Cardiovascular y Metabólico",
    },

    subject: {
      reference: `Patient/${patientId}`,
    },

    date: new Date().toISOString(),

    author: [
      {
        display: "Meta Cardio App",
      },
    ],

    title: "Informe de Evaluación de Riesgo Cardiovascular y Metabólico",

    section: [
      {
        title: "Riesgo de Diabetes Tipo 2 (FINDRISC)",
        entry: [
          {
            reference: `Observation/${findriscObservation.id}`,
          },
        ],
      },
    ],
  };
}
