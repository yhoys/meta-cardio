const CATEGORY_LOINC = {
  system: "http://loinc.org",
  code: "LP183761-8",
  display: "Report",
};

const TYPE_LOINC = {
  system: "http://loinc.org",
  code: "75492-9",
  display: "Risk assessment and screening note",
};

const FHIR_PROFILE = "http://hl7.org/fhir/StructureDefinition/Composition";

function generateDiv(text) {
  return `<div xmlns="http://www.w3.org/1999/xhtml">${text}</div>`;
}

function buildSection(title, divText, ref) {
  return {
    title,
    text: {
      status: "generated",
      div: generateDiv(divText),
    },
    entry: [{ reference: ref }],
  };
}

export function buildComposition(
  patientRef,
  findriscRef,
  imcRef,
  framinghamRef,
  waistRef,
) {
  if (!patientRef || !findriscRef || !imcRef || !framinghamRef || !waistRef) {
    throw new Error(
      "Referencias incompletas: no se puede construir el Composition.",
    );
  }

  return {
    resourceType: "Composition",
    meta: {
      profile: [FHIR_PROFILE],
    },
    status: "final",

    category: [{ coding: [CATEGORY_LOINC] }],

    type: {
      coding: [TYPE_LOINC],
      text: "Evaluación de Riesgo Cardiovascular y Metabólico",
    },

    subject: { reference: patientRef },

    date: new Date().toISOString(),

    author: [
      {
        reference: "urn:uuid:device-1",
        display: "Meta Cardio App",
      },
    ],

    title: "Informe de Evaluación de Riesgo Cardiovascular y Metabólico",

    section: [
      buildSection(
        "Índice de Masa Corporal (IMC)",
        "Índice de masa corporal calculado a partir de peso y talla, clasificado según rangos clínicos establecidos.",
        imcRef,
      ),
      buildSection(
        "Riesgo de Diabetes Tipo 2 (FINDRISC)",
        "Puntaje total de FINDRISC y categoría de riesgo estimado a 10 años para diabetes tipo 2.",
        findriscRef,
      ),
      buildSection(
        "Riesgo Cardiovascular a 10 años (Framingham Colombia)",
        "Estimación del riesgo cardiovascular a 10 años según modelo de Framingham, incluyendo ajuste recomendado para población colombiana.",
        framinghamRef,
      ),
      buildSection(
        "Perímetro Abdominal",
        "Medición del perímetro abdominal en centímetros como indicador de riesgo cardiometabólico.",
        waistRef,
      ),
    ],
  };
}
