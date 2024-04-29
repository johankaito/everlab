import {
  Analysis,
  DiagnosticMetric,
  HL7File,
  JSONObject,
  OBX,
  PID,
} from './types/types';
import fs from 'fs';
import readline from 'readline';
import multer from 'multer';
import { decode } from '@rimiti/hl7-object-parser';
import mapping from './mapping.json';

export const processHL7File = (filename: string) =>
  decode(fs.readFileSync(filename).toString(), mapping);

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, 'uploads/');
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
export const upload = multer({ storage: storage });

export const analyseTestResults = (
  testResults: HL7File,
  metrics: DiagnosticMetric[],
): Analysis[] => {
  const sonicCodeToMetrics = metrics.reduce<{
    [k: string]: DiagnosticMetric[];
  }>((acc, m) => {
    // flatten the codes
    const codeArr = m.oru_sonic_codes.split(';');
    codeArr.forEach((code) => {
      if (acc[code]) {
        acc[code].push(m);
      }

      acc[code] = [m];
    });

    return acc;
  }, {});

  const pid = testResults.pid[0];
  // run through all the observations
  return testResults.obx.reduce<Analysis[]>((acc, observation) => {
    // check if there are matching ones
    const metrics = sonicCodeToMetrics[observation.identifier.text];
    if (!metrics) {
      return acc;
    }

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const { isStandardRisk, isEverlabRisk } = assess(
        pid,
        observation,
        metric,
      );
      if (isStandardRisk || isEverlabRisk) {
        // check range
        acc.push({
          observation,
          metric,
          isStandardRisk,
          isEverlabRisk,
        });
      }
    }
    return acc;
  }, []);
};

const assess = (
  pid: PID,
  observation: OBX,
  metric: DiagnosticMetric,
): { isStandardRisk: boolean; isEverlabRisk: boolean } => {
  // check units
  if (observation.units.text != metric.oru_sonic_units) {
    // invalid units, not applicable
    return { isStandardRisk: false, isEverlabRisk: false };
  }

  // check gender
  if (metric.gender !== 'Any') {
    if (metric.gender.charAt(0).toLowerCase() !== pid.gender?.toLowerCase()) {
      // wrong gender, not applicable
      return { isStandardRisk: false, isEverlabRisk: false };
    }
  }

  // check age
  const age = getAge(pid.birthdate);
  if (
    !isWithinRange(
      age.toString(),
      age.toString(),
      metric.min_age,
      metric.max_age,
    )
  ) {
    // patient age not within age range of metrics, not applicable
    return { isStandardRisk: false, isEverlabRisk: false };
  }

  // check risk factor
  const value = observation.value.text1 + observation.value.text2;
  let minValue = value,
    maxValue = value;
  if (observation.value.type === 'SN') {
    switch (true) {
      case value.includes('>'):
        minValue = value.replace('>', '');
        maxValue = Number.MAX_VALUE.toString();
        break;
      case value.includes('<'):
        minValue = '0';
        maxValue = value.replace('>', '');
        break;
    }
  }
  const isStandardRisk = !isWithinRange(
    minValue,
    maxValue,
    metric.standard_lower,
    metric.standard_higher,
  );
  const isEverlabRisk = !isWithinRange(
    minValue,
    maxValue,
    metric.everlab_lower,
    metric.everlab_higher,
  );

  return { isStandardRisk, isEverlabRisk };
};

const isWithinRange = (
  testMin: string,
  testMax: string,
  min: string,
  max: string,
): boolean => {
  const testMinNum = parseFloat(testMin);
  const testMaxNum = parseFloat(testMax);
  const minNum = parseFloat(min);
  const maxNum = parseFloat(max);

  switch (true) {
    case isNaN(testMinNum) || isNaN(testMaxNum):
      return false;
    case isNaN(minNum) && isNaN(maxNum):
      return false;
    case !isNaN(minNum) && !isNaN(maxNum):
      return testMinNum >= minNum && testMaxNum <= maxNum;
    case isNaN(minNum):
      return testMinNum >= 0 && testMaxNum <= maxNum;
    case isNaN(maxNum):
      return testMinNum >= minNum;
  }
  return false;
};

const getAge = (dateStr?: string): number => {
  if (!dateStr) return NaN;

  const date = new Date(
    parseInt(dateStr.substr(0, 4)),
    parseInt(dateStr.substr(4, 2)),
    parseInt(dateStr.substr(6, 2)),
  );
  return new Date().getUTCFullYear() - date.getUTCFullYear();
};
