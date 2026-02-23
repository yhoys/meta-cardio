export function buildWaistObservation(waistCm) {
  return {
    resourceType: "Observation",
    id: `waist-${Date.now()}`,
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
          code: "56115-9",
          display: "Waist circumference",
        },
      ],
      text: "Perímetro abdominal",
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: parseFloat(waistCm),
      unit: "cm",
      system: "http://unitsofmeasure.org",
      code: "cm",
    },
  };
}
