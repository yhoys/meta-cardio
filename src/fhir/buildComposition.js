export function buildComposition(
  patientId,
  findriscObservation,
  imcObservation,
  framinghamObservation,
) {
  return {
    resourceType: "Composition",
    id: `meta-cardio-${Date.now()}`,
    status: "final",

    category: [
      {
        coding: [
          {
            system: "http://loinc.org",
            code: "LP183761-8",
            display: "Report",
          },
        ],
      },
    ],

    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "83539-7",
          display: "Cardiology Risk assessment and screening note",
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
        reference: "Device/meta-cardio-app",
        display: "Meta Cardio App",
      },
    ],

    title: "Informe de Evaluación de Riesgo Cardiovascular y Metabólico",

    section: [
      {
        title: "Índice de Masa Corporal (IMC)",
        entry: [
          {
            reference: `Observation/${imcObservation.id}`,
          },
        ],
      },
      {
        title: "Riesgo de Diabetes Tipo 2 (FINDRISC)",
        entry: [
          {
            reference: `Observation/${findriscObservation.id}`,
          },
        ],
      },
      {
        title: "Riesgo Cardiovascular a 10 años (Framingham Colombia)",
        entry: [
          {
            reference: `Observation/${framinghamObservation.id}`,
          },
        ],
      },
    ],
  };
}
