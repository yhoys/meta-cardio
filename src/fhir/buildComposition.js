export function buildComposition(
  patientRef,
  findriscRef,
  imcRef,
  framinghamRef,
  waistRef,
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
      reference: patientRef,
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
        text: {
          status: "generated",
          div: "<div>Índice de masa corporal calculado a partir de peso y talla, clasificado según rangos de IMC.</div>",
        },
        entry: [
          {
            reference: imcRef,
          },
        ],
      },
      {
        title: "Riesgo de Diabetes Tipo 2 (FINDRISC)",
        text: {
          status: "generated",
          div: "<div>Puntaje total de FINDRISC y categoría de riesgo estimado a 10 años para diabetes tipo 2.</div>",
        },
        entry: [
          {
            reference: findriscRef,
          },
        ],
      },
      {
        title: "Riesgo Cardiovascular a 10 años (Framingham Colombia)",
        text: {
          status: "generated",
          div: "<div>Riesgo cardiovascular a 10 años según modelo de Framingham, con riesgo original y riesgo ajustado (factor 0.75 recomendado para Colombia).</div>",
        },
        entry: [
          {
            reference: framinghamRef,
          },
        ],
      },
      {
        title: "Perímetro Abdominal",
        text: {
          status: "generated",
          div: "<div>Perímetro abdominal medido en centímetros, utilizado como indicador de riesgo cardiometabólico.</div>",
        },
        entry: [
          {
            reference: waistRef,
          },
        ],
      },
    ],
  };
}
