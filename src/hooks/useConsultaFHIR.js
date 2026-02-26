import { useReducer, useMemo, useCallback } from "react";
import { consultaReducer, initialState } from "../reducers/consultaReducer";
import { buildComposition } from "../fhir/buildComposition";
import { buildTransactionBundle } from "../fhir/buildTransactionBundle";
import { sendTransactionBundle } from "../fhir/fhirClient";
import deviceResource from "../data/device.json";

export function calcularEdad(birthDate) {
  if (!birthDate) return null;
  const hoy = new Date();
  const nacimiento = new Date(birthDate);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

export function useConsultaFHIR() {
  const [state, dispatch] = useReducer(consultaReducer, initialState);
  const { selectedPatient, observations, compositionJson } = state;

  const patientAge = useMemo(
    () => calcularEdad(selectedPatient?.birthDate),
    [selectedPatient],
  );

  const allObservationsReady = useMemo(
    () =>
      observations.imc !== null &&
      observations.findrisc !== null &&
      observations.framingham !== null &&
      observations.waist !== null &&
      patientAge !== null,
    [observations, patientAge],
  );

  const handleStart = useCallback(() => dispatch({ type: "START" }), []);
  const handleResetAll = useCallback(() => dispatch({ type: "RESET" }), []);
  const handleSetActiveStep = useCallback(
    (step) => dispatch({ type: "SET_ACTIVE_STEP", payload: step }),
    [],
  );
  const handlePatientSelect = useCallback(
    (patient) => dispatch({ type: "SELECT_PATIENT", payload: patient }),
    [],
  );

  const setImcGlobal = useCallback(
    (value) => dispatch({ type: "SET_IMC_GLOBAL", payload: value }),
    [],
  );
  const setImcObs = useCallback(
    (value) =>
      dispatch({ type: "SET_OBSERVATION", payload: { key: "imc", value } }),
    [],
  );
  const setFindriscObs = useCallback(
    (value) =>
      dispatch({
        type: "SET_OBSERVATION",
        payload: { key: "findrisc", value },
      }),
    [],
  );
  const setFraminghamObs = useCallback(
    (value) =>
      dispatch({
        type: "SET_OBSERVATION",
        payload: { key: "framingham", value },
      }),
    [],
  );
  const setWaistObs = useCallback(
    (value) =>
      dispatch({ type: "SET_OBSERVATION", payload: { key: "waist", value } }),
    [],
  );

  const handleGenerateComposition = useCallback(async () => {
    if (!allObservationsReady) return;
    dispatch({ type: "GENERATING_COMPOSITION" });
    try {
      const composition = buildComposition(
        "urn:uuid:patient-1",
        "urn:uuid:obs-2", // findrisc
        "urn:uuid:obs-3", // imc
        "urn:uuid:obs-1", // framingham
        "urn:uuid:obs-4", // waist
      );
      dispatch({ type: "SET_COMPOSITION", payload: composition });
    } catch {
      dispatch({ type: "COMPOSITION_ERROR" });
    }
  }, [allObservationsReady]);

  const handleSendToFhir = useCallback(async () => {
    if (!selectedPatient || !compositionJson) return;
    dispatch({ type: "SENDING_FHIR" });
    try {
      const bundle = buildTransactionBundle({
        patient: selectedPatient,
        device: deviceResource,
        observations: [
          observations.framingham,
          observations.findrisc,
          observations.imc,
          observations.waist,
        ].filter(Boolean),
      });

      const { ok, status, body } = await sendTransactionBundle(bundle);

      if (!ok) {
        let errorText = `Error HTTP ${status}`;
        if (body?.resourceType === "OperationOutcome" && body.issue?.length) {
          errorText = body.issue
            .map((issue, i) => {
              const detalle =
                issue.diagnostics ||
                issue.details?.text ||
                issue.code ||
                "Error desconocido";
              const ubicacion = issue.location?.length
                ? ` [${issue.location.join(", ")}]`
                : "";
              const severidad = issue.severity ? `[${issue.severity}]` : "";
              return `${i + 1}. ${severidad}${detalle}${ubicacion}`;
            })
            .join("\n");
        }
        dispatch({
          type: "SEND_FHIR_ERROR",
          payload: { status, errorText, links: [] },
        });
        return;
      }

      let links = [];
      if (body?.resourceType === "Bundle" && Array.isArray(body.entry)) {
        links = body.entry
          .map((e) => e.response?.location)
          .filter(Boolean)
          .map((loc) => `http://fhirserver.hl7fundamentals.org/fhir/${loc}`);
      }
      dispatch({
        type: "SEND_FHIR_SUCCESS",
        payload: { status, links, errorText: null },
      });
    } catch (e) {
      dispatch({
        type: "SEND_FHIR_ERROR",
        payload: { status: 0, errorText: e.message, links: [] },
      });
    }
  }, [selectedPatient, compositionJson, observations]);

  const handleCopyComposition = useCallback(() => {
    if (!compositionJson) return;
    navigator.clipboard.writeText(JSON.stringify(compositionJson, null, 2));
    dispatch({ type: "SET_COPIED", payload: true });
    setTimeout(() => dispatch({ type: "SET_COPIED", payload: false }), 1500);
  }, [compositionJson]);

  const handleCopyActiveObservation = useCallback(
    (tab) => {
      const obs = observations[tab] ?? null;
      if (!obs) return;
      navigator.clipboard.writeText(JSON.stringify(obs, null, 2));
      dispatch({ type: "SET_COPIED_OBS", payload: true });
      setTimeout(
        () => dispatch({ type: "SET_COPIED_OBS", payload: false }),
        1500,
      );
    },
    [observations],
  );

  const handleShowObsModal = useCallback(
    () => dispatch({ type: "SHOW_OBS_MODAL" }),
    [],
  );
  const handleHideObsModal = useCallback(
    () => dispatch({ type: "HIDE_OBS_MODAL" }),
    [],
  );
  const handleSetObsTab = useCallback(
    (tab) => dispatch({ type: "SET_OBS_TAB", payload: tab }),
    [],
  );

  const handleSetCopiedObs = useCallback(
    (value) => dispatch({ type: "SET_COPIED_OBS", payload: value }),
    [],
  );

  const isStepEnabled = useCallback(
    (id) => {
      if (!selectedPatient || !patientAge) return id === "paciente";
      if (id === "paciente") return true;
      if (id === "findrisc") return true;
      if (id === "framingham") return !!observations.findrisc;
      if (id === "reporte") return !!compositionJson || allObservationsReady;
      if (id === "referencias") return !!compositionJson;
      return false;
    },
    [
      selectedPatient,
      patientAge,
      observations.findrisc,
      compositionJson,
      allObservationsReady,
    ],
  );

  return {
    state,
    patientAge,
    allObservationsReady,
    handleStart,
    handleResetAll,
    handleSetActiveStep,
    handlePatientSelect,
    setImcGlobal,
    setImcObs,
    setFindriscObs,
    setFraminghamObs,
    setWaistObs,
    handleGenerateComposition,
    handleSendToFhir,
    handleCopyComposition,
    handleCopyActiveObservation,
    handleShowObsModal,
    handleHideObsModal,
    handleSetObsTab,
    handleSetCopiedObs,
    isStepEnabled,
  };
}
