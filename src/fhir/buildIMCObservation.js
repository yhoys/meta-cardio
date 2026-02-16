export function buildIMCObservation(patientId, imcValue, classification) {
  return {
    resourceType: "Observation",
    id: "imc-" + Date.now(),
    status: "final",

    category: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs",
          },
        ],
      },
    ],

    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "39156-5",
          display: "Body mass index (BMI)",
        },
      ],
      text: "Índice de Masa Corporal",
    },

    subject: {
      reference: `Patient/${patientId}`,
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: parseFloat(imcValue.toFixed(2)),
      unit: "kg/m2",
    },

    interpretation: [
      {
        text: classification,
      },
    ],
  };
}
