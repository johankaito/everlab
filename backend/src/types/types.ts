export interface JSONObject {
  [k: string]: number | string | JSONObject;
}

export interface DiagnosticGroup {
  name: string;
  diagnostic_metrics: string;
}

export interface Diagnostic {
  name: string;
  diagnostic_groups: string;
  diagnostic_metrics: string;
}

export interface DiagnosticMetric {
  diagnostic: string;
  diagnostic_groups: string;
  everlab_higher: string;
  everlab_lower: string;
  gender: string;
  max_age: string;
  min_age: string;
  name: string;
  oru_sonic_codes: string;
  oru_sonic_units: string;
  standard_higher: string;
  standard_lower: string;
  units: string;
}

export interface Condition {
  name: string;
  diagnostic_metrics: string;
}

export interface Analysis {
  observation: OBX;
  metric: DiagnosticMetric;
  isStandardRisk: boolean;
  isEverlabRisk: boolean;
}

interface ObservationUnit {
  identifier: string;
  text: string;
}

interface ObservationIdentifier {
  identifier: string;
  text: string;
  codingSystem: string;
}

export interface PID {
  id?: string;
  origin?: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  gender?: string;
  streetName?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
}

interface ObservationValue {
  type: string;
  text1: string;
  text2: string;
}

export interface OBX {
  identifier: ObservationIdentifier;
  value: ObservationValue;
  units: ObservationUnit;
  referencesRange: string;
}

export interface HL7File {
  pid: PID[];
  obx: OBX[];
}
