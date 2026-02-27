const CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "exam",
  display: "Exam",
};

const CODE_LOINC = {
  system: "http://loinc.org",
  code: "56115-9",
  display: "Waist circumference",
};

const CODE_SNOMED = {
  system: "http://snomed.info/sct",
  code: "276361009",
  display: "Waist circumference (observable entity)",
};

const BODY_SITE_SNOMED = {
  system: "http://snomed.info/sct",
  code: "62413002",
  display: "Abdominal structure (body structure)",
};

const UCUM_CM = {
  unit: "cm",
  system: "http://unitsofmeasure.org",
  code: "cm",
};

export function buildWaistObservation(waistCm) {
  return {
    resourceType: "Observation",
    status: "final",

    category: [{ coding: [CATEGORY] }],

    code: {
      coding: [CODE_LOINC, CODE_SNOMED],
      text: "Perímetro abdominal",
    },

    effectiveDateTime: new Date().toISOString(),

    bodySite: {
      coding: [BODY_SITE_SNOMED],
      text: "Abdomen",
    },

    valueQuantity: {
      value: parseFloat(waistCm),
      ...UCUM_CM,
    },
  };
}
