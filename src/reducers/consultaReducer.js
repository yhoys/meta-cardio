export const initialState = {
  started: false,
  activeStep: "paciente",
  selectedPatient: null,
  patientSelectionEnabled: true,
  observations: {
    imc: null,
    findrisc: null,
    framingham: null,
    waist: null,
  },
  imcGlobal: null,
  compositionJson: null,
  isCompositionStale: false,
  isGenerating: false,
  sending: false,
  sendResult: null,
  ui: {
    showObsModal: false,
    activeObsTab: "findrisc",
    copied: false,
    copiedObs: false,
  },
};

export function consultaReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, started: true };

    case "RESET":
      return { ...initialState };

    case "SET_ACTIVE_STEP":
      return { ...state, activeStep: action.payload };

    case "SELECT_PATIENT":
      return {
        ...state,
        selectedPatient: action.payload,
        patientSelectionEnabled: false,
        activeStep: "paciente",
        observations: initialState.observations,
        imcGlobal: null,
        compositionJson: null,
        isCompositionStale: false,
        sendResult: null,
      };

    case "SET_IMC_GLOBAL":
      return { ...state, imcGlobal: action.payload };

    case "SET_OBSERVATION":
      return {
        ...state,
        observations: {
          ...state.observations,
          [action.payload.key]: action.payload.value,
        },
        isCompositionStale: state.compositionJson !== null,
      };

    case "GENERATING_COMPOSITION":
      return { ...state, isGenerating: true };

    case "SET_COMPOSITION":
      return {
        ...state,
        compositionJson: action.payload,
        isCompositionStale: false,
        isGenerating: false,
        patientSelectionEnabled: false,
        activeStep: "reporte",
      };

    case "COMPOSITION_ERROR":
      return { ...state, isGenerating: false };

    case "SENDING_FHIR":
      return { ...state, sending: true, sendResult: null };

    case "SEND_FHIR_SUCCESS":
      return {
        ...state,
        sending: false,
        sendResult: { ok: true, ...action.payload },
      };

    case "SEND_FHIR_ERROR":
      return {
        ...state,
        sending: false,
        sendResult: { ok: false, ...action.payload },
      };

    case "SHOW_OBS_MODAL":
      return { ...state, ui: { ...state.ui, showObsModal: true } };

    case "HIDE_OBS_MODAL":
      return { ...state, ui: { ...state.ui, showObsModal: false } };

    case "SET_OBS_TAB":
      return { ...state, ui: { ...state.ui, activeObsTab: action.payload } };

    case "SET_COPIED":
      return { ...state, ui: { ...state.ui, copied: action.payload } };

    case "SET_COPIED_OBS":
      return { ...state, ui: { ...state.ui, copiedObs: action.payload } };

    default:
      return state;
  }
}
