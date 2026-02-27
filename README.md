# MetaCardio

> Evaluación de riesgo cardiovascular y metabólico basada en FHIR R4

Prototipo académico desarrollado en el marco del **FHIR Camp 2026 — HL7 Colombia**, que demuestra interoperabilidad estructurada mediante la construcción y envío de recursos FHIR R4 a un servidor real.

---

## Descripción del proyecto

MetaCardio es una aplicación web que permite calcular el riesgo cardiovascular y metabólico de un paciente aplicando dos escalas clínicas validadas:

- **FINDRISC** — riesgo de desarrollar diabetes tipo 2 en 10 años (Lindström & Tuomilehto, 2003)
- **Framingham (ajustado Colombia)** — riesgo cardiovascular a 10 años con factor de corrección 0.75 para población colombiana (D'Agostino, 2008)

Los resultados se codifican como recursos **FHIR R4** (`Observation`, `Composition`) y se envían a un servidor FHIR mediante un **Bundle de tipo transaction**, garantizando atomicidad en la persistencia de todos los recursos.

---

## Tecnologías utilizadas

| Tecnología                          | Uso                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| React 18                            | Interfaz de usuario                                                              |
| Vite                                | Bundler y entorno de desarrollo                                                  |
| `useReducer` + hooks personalizados | Manejo de estado centralizado                                                    |
| FHIR R4                             | Estándar de interoperabilidad en salud                                           |
| SNOMED CT                           | Vocabulario controlado clínico (códigos de observación, método e interpretación) |
| LOINC                               | Identificación de observaciones clínicas (secundario a SNOMED CT)                |
| UCUM                                | Unidades de medida estandarizadas (kg/m², cm, %)                                 |
| HL7 Fundamentals FHIR Server        | Servidor de práctica para persistencia                                           |
| React Icons                         | Iconografía                                                                      |

---

## Arquitectura y estructura de archivos

El proyecto sigue una arquitectura de tres capas bien diferenciadas:

```
META-CARDIO/
├── public/
├── src/
│   ├── components/          # Capa de presentación
│   │   ├── FindriscForm.jsx       — Formulario y cálculo FINDRISC, IMC y perímetro
│   │   ├── FraminghamForm.jsx     — Formulario y cálculo Framingham
│   │   ├── ModeSelector.jsx       — Pantalla de inicio
│   │   └── PatientSelector.jsx    — Selector de paciente
│   │
│   ├── fhir/                # Capa FHIR — construcción de recursos
│   │   ├── buildFindriscObservation.js   — Observation LOINC 97064-0 · SNOMED 450321004
│   │   ├── buildIMCObservation.js        — Observation LOINC 39156-5 · SNOMED 60621009
│   │   ├── buildWaistObservation.js      — Observation LOINC 56115-9 · SNOMED 276361009
│   │   ├── buildFraminghamObservation.js — Observation LOINC 65853-4 · SNOMED 450759008
│   │   ├── buildComposition.js           — Composition clínica LOINC 83539-7
│   │   ├── buildTransactionBundle.js     — Bundle transaction con urn:uuid
│   │   └── fhirClient.js                 — Cliente HTTP hacia el servidor FHIR
│   │
│   ├── hooks/
│   │   └── useConsultaFHIR.js     — Lógica de negocio, handlers y orquestación
│   │
│   ├── reducers/
│   │   └── consultaReducer.js     — Estado centralizado de la consulta
│   │
│   ├── data/
│   │   ├── patients.json          — Pacientes de prueba
│   │   └── device.json            — Recurso Device de la aplicación
│   │
│   ├── App.jsx              # Capa de presentación raíz
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
└── package.json
```

**Principios de diseño aplicados:**

- Los builders FHIR son funciones puras sin efectos secundarios.
- `App.jsx` es capa de presentación pura — sin `useState` ni `useEffect` directos.
- El estado de la consulta vive íntegramente en `consultaReducer.js`.
- La lógica de negocio y los handlers están encapsulados en `useConsultaFHIR.js`.

---

## Flujo de uso

```
1. Inicio          →  Seleccionar modo de evaluación
2. Paciente        →  Seleccionar paciente de la lista
3. FINDRISC        →  Ingresar peso, talla, perímetro y responder preguntas
                       → Se generan Observations de IMC, perímetro y FINDRISC
4. Framingham      →  Ingresar datos clínicos (con o sin laboratorio)
                       → Se genera Observation de riesgo cardiovascular
5. Documento FHIR  →  Generar la Composition clínica
                       → Revisar el JSON de la Composition
                       → Revisar las Observations individuales
                       → Enviar Bundle transaction al servidor FHIR
6. Referencias     →  Consultar tablas de interpretación y bibliografía
```

En cualquier momento se puede reiniciar la consulta con el botón ↺.

---

## Estructura FHIR

### Recursos generados por consulta

| Recurso       | Código SNOMED CT                         | Código LOINC | Descripción                                 |
| ------------- | ---------------------------------------- | ------------ | ------------------------------------------- |
| `Observation` | 450321004 — Finnish diabetes risk score  | 97064-0      | Puntaje total FINDRISC                      |
| `Observation` | 60621009 — Body mass index               | 39156-5      | Índice de Masa Corporal (IMC)               |
| `Observation` | 276361009 — Waist circumference          | 56115-9      | Perímetro abdominal                         |
| `Observation` | 450759008 — Framingham risk score        | 65853-4      | Riesgo cardiovascular Framingham            |
| `Composition` | —                                        | 83539-7      | Documento clínico de evaluación             |
| `Patient`     | —                                        | —            | Paciente (sin ID local, el servidor asigna) |
| `Device`      | 706689003 — Application program software | —            | Dispositivo autor                           |

La interpretación clínica de cada `Observation` también utiliza SNOMED CT:

| Observación | Interpretación              | Código SNOMED CT               |
| ----------- | --------------------------- | ------------------------------ |
| IMC         | Bajo peso                   | 248342006 — Underweight        |
| IMC         | Normal                      | 43664005 — Normal body weight  |
| IMC         | Sobrepeso                   | 238131007 — Overweight         |
| IMC         | Obesidad (IMC 30–39.9)      | 162864005 — Obesity            |
| IMC         | Obesidad mórbida (IMC ≥ 40) | 238136002 — Morbid obesity     |
| Waist       | Sitio anatómico             | 62413002 — Abdominal structure |

### Bundle transaction

Todos los recursos se envían en un único `Bundle` de tipo `transaction`, lo que garantiza que se persistan de forma atómica. Las referencias internas se resuelven mediante identificadores temporales `urn:uuid:`:

```
urn:uuid:patient-1      →  Patient/XXXXX  (asignado por el servidor)
urn:uuid:device-1       →  Device/meta-cardio-app
urn:uuid:obs-1          →  Observation/XXXXX  (Framingham)
urn:uuid:obs-2          →  Observation/XXXXX  (FINDRISC)
urn:uuid:obs-3          →  Observation/XXXXX  (IMC)
urn:uuid:obs-4          →  Observation/XXXXX  (Perímetro)
urn:uuid:composition-1  →  Composition/XXXXX
```

Ningún recurso incluye un `id` generado localmente — el servidor FHIR es quien asigna todos los identificadores finales.

---

## Instalación y ejecución

### Requisitos

- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd meta-cardio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env
# Editar .env si se desea apuntar a otro servidor FHIR

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Build para producción
npm run build
```

### Variables de entorno

| Variable             | Descripción                | Valor por defecto                             |
| -------------------- | -------------------------- | --------------------------------------------- |
| `VITE_FHIR_BASE_URL` | URL base del servidor FHIR | `https://fhirserver.hl7fundamentals.org/fhir` |

Si no se define `VITE_FHIR_BASE_URL`, la aplicación usa el servidor de práctica de HL7 Fundamentals.

### Despliegue en Vercel

El proyecto es compatible con Vercel sin configuración adicional. Si se desea usar un servidor FHIR diferente, agregar `VITE_FHIR_BASE_URL` en el panel de Environment Variables de Vercel.

---

## Limitaciones y trabajo futuro

### Limitaciones actuales

El proyecto es un **prototipo académico** orientado a demostrar interoperabilidad estructurada con FHIR R4. No incorpora elementos propios de un entorno productivo hospitalario:

- **Autenticación y autorización** — no implementa OAuth 2.0, tokens JWT ni SMART on FHIR con scopes clínicos.
- **Control de acceso por roles (RBAC)** — no hay gestión de usuarios ni permisos diferenciados.
- **Consentimiento informado** — no se gestiona el recurso FHIR `Consent`.
- **Trazabilidad** — no se genera el recurso `Provenance` para auditoría de cambios.
- **Persistencia propia** — depende exclusivamente del servidor FHIR como capa de persistencia, sin base de datos institucional adicional.
- **Pacientes de prueba** — los pacientes están definidos en un archivo JSON local, no se consultan desde un servidor real.

Estos aspectos corresponden a una fase de despliegue hospitalario y están fuera del alcance académico del prototipo.

### Trabajo futuro

- Integración con SMART on FHIR para autenticación clínica real.
- Consulta de pacientes desde un servidor FHIR mediante operación `$search`.
- Generación del recurso `Provenance` por cada Bundle enviado.
- Soporte para múltiples idiomas (i18n).
- Modo offline con sincronización diferida.

---

## Créditos

Desarrollado como proyecto académico en el marco del **FHIR Camp 2026 — HL7 Colombia**.

Servidor FHIR de práctica proporcionado por [HL7 Fundamentals](http://fhirserver.hl7fundamentals.org/fhir).

**Bibliografía clínica:**

- Lindström J, Tuomilehto J. _The Diabetes Risk Score: a practical tool to predict type 2 diabetes._ Diabetes Care, 2003.
- D'Agostino RB et al. _General cardiovascular risk profile for use in primary care._ Circulation, 2008.
- Wilson PWF et al. _Prediction of coronary heart disease using risk factor categories._ Circulation, 1998.
- Muñoz OM, Rodríguez NI, Ruiz Á, Rondón M. _Validación de los modelos de predicción de Framingham y PROCAM como estimadores del riesgo cardiovascular en una población colombiana._ Revista Colombiana de Cardiología, Vol. 21, Issue 4, 2014, pp. 202-212. https://doi.org/10.1016/j.rccar.2014.02.001
