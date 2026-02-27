const CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "vital-signs",
  display: "Vital Signs",
};

const CODE_LOINC = {
  system: "http://loinc.org",
  code: "39156-5",
  display: "Body mass index (BMI)",
};

const CODE_SNOMED = {
  system: "http://snomed.info/sct",
  code: "60621009",
  display: "Body mass index (observable entity)",
};

const UCUM_KG_M2 = {
  unit: "kg/m2",
  system: "http://unitsofmeasure.org",
  code: "kg/m2",
};

const IMC_SNOMED_MAP = {
  "Bajo peso": { code: "248342006", display: "Underweight (finding)" },
  Normal: { code: "43664005", display: "Normal weight (finding)" },
  Sobrepeso: { code: "238131007", display: "Overweight (finding)" },
  Obesidad: {
    code: "162864005",
    display: "Body mass index 30+ - obesity (finding)",
  },
  "Obesidad mórbida": {
    code: "238136002",
    display: "Morbid obesity (disorder)",
  },
};

function resolverClasificacionIMC(imcValue) {
  if (imcValue < 18.5) return "Bajo peso";
  if (imcValue < 25) return "Normal";
  if (imcValue < 30) return "Sobrepeso";
  if (imcValue < 40) return "Obesidad";
  return "Obesidad mórbida";
}

export function buildIMCObservation(imcValue, classification) {
  const numericImc =
    typeof imcValue === "string" ? parseFloat(imcValue) : imcValue;

  const clasificacionSnomed = resolverClasificacionIMC(numericImc);
  const snomed = IMC_SNOMED_MAP[clasificacionSnomed];

  return {
    resourceType: "Observation",
    status: "final",

    category: [{ coding: [CATEGORY] }],

    code: {
      coding: [CODE_LOINC, CODE_SNOMED],
      text: "Índice de Masa Corporal (IMC)",
    },

    effectiveDateTime: new Date().toISOString(),

    valueQuantity: {
      value: Number(numericImc.toFixed(2)),
      ...UCUM_KG_M2,
    },

    interpretation: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: snomed.code,
            display: snomed.display,
          },
        ],
        text: classification,
      },
    ],
  };
}
