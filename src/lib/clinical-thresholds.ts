import { VitalMetrics, AlertSeverity } from '../types';

export interface EvaluationResult {
  severity: AlertSeverity;
  flags: {
    metric: string;
    value: string;
    rule: string;
    severity: AlertSeverity;
  }[];
  overallRiskScore: number;
}

/**
 * Clinical Threshold Evaluator according to JNC 8 (Blood Pressure) & ADA (Blood Glucose) guidelines
 */
export function evaluateVitals(vitals: VitalMetrics): EvaluationResult {
  const flags: EvaluationResult['flags'] = [];
  let maxSeverity: AlertSeverity = 'INFO';

  const updateSeverity = (s: AlertSeverity) => {
    if (s === 'CRITICAL') maxSeverity = 'CRITICAL';
    else if (s === 'WARNING' && maxSeverity !== 'CRITICAL') maxSeverity = 'WARNING';
  };

  // 1. Blood Pressure (JNC 8 Guidelines)
  // Systolic: Normal (90-120), Warning (121-139), Critical (140+)
  // Diastolic: Normal (60-80), Warning (81-89), Critical (90+)
  if (vitals.systolicBp >= 180 || vitals.diastolicBp >= 120) {
    flags.push({
      metric: 'Blood Pressure',
      value: `${vitals.systolicBp}/${vitals.diastolicBp} mmHg`,
      rule: 'JNC 8 Hypertensive Crisis (>=180 or >=120 mmHg)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) {
    flags.push({
      metric: 'Blood Pressure',
      value: `${vitals.systolicBp}/${vitals.diastolicBp} mmHg`,
      rule: 'JNC 8 Stage 2 Hypertension (>=140 or >=90 mmHg)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.systolicBp >= 121 || vitals.diastolicBp >= 81) {
    flags.push({
      metric: 'Blood Pressure',
      value: `${vitals.systolicBp}/${vitals.diastolicBp} mmHg`,
      rule: 'JNC 8 Elevated / Stage 1 Hypertension (121-139 or 81-89 mmHg)',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  } else if (vitals.systolicBp < 90 || vitals.diastolicBp < 60) {
    flags.push({
      metric: 'Blood Pressure',
      value: `${vitals.systolicBp}/${vitals.diastolicBp} mmHg`,
      rule: 'Hypotension Alert (<90 or <60 mmHg)',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  }

  // 2. Blood Glucose (ADA Guidelines)
  // Fasting: Normal (70-100), Warning (101-125 / elevated), Critical (<70 Hypoglycemia or >300 Severe Hyperglycemia)
  const isFasting = vitals.isGlucoseFasting ?? true;
  if (vitals.bloodGlucose < 70) {
    flags.push({
      metric: 'Blood Glucose',
      value: `${vitals.bloodGlucose} mg/dL`,
      rule: 'ADA Critical Hypoglycemia (<70 mg/dL)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.bloodGlucose > 300) {
    flags.push({
      metric: 'Blood Glucose',
      value: `${vitals.bloodGlucose} mg/dL`,
      rule: 'ADA Severe Hyperglycemia Crisis (>300 mg/dL)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (isFasting && vitals.bloodGlucose >= 126) {
    flags.push({
      metric: 'Blood Glucose',
      value: `${vitals.bloodGlucose} mg/dL (Fasting)`,
      rule: 'ADA Diabetes Fasting Threshold (>=126 mg/dL)',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  } else if (!isFasting && vitals.bloodGlucose >= 200) {
    flags.push({
      metric: 'Blood Glucose',
      value: `${vitals.bloodGlucose} mg/dL (Random)`,
      rule: 'ADA Elevated Random Glucose (>=200 mg/dL)',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  }

  // 3. SpO2 Oxygen Saturation
  // Normal (95-100%), Warning (90-94%), Critical (<90%)
  if (vitals.spO2 < 90) {
    flags.push({
      metric: 'SpO2 Oxygen Saturation',
      value: `${vitals.spO2}%`,
      rule: 'Severe Hypoxemia (<90%)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.spO2 <= 94) {
    flags.push({
      metric: 'SpO2 Oxygen Saturation',
      value: `${vitals.spO2}%`,
      rule: 'Mild Hypoxemia (90-94%)',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  }

  // 4. Heart Rate (bpm)
  // Normal (60-100), Warning (100-120 or 50-60), Critical (>120 Tachycardia or <50 Bradycardia)
  if (vitals.heartRate > 120) {
    flags.push({
      metric: 'Heart Rate',
      value: `${vitals.heartRate} bpm`,
      rule: 'Severe Tachycardia (>120 bpm)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.heartRate < 50) {
    flags.push({
      metric: 'Heart Rate',
      value: `${vitals.heartRate} bpm`,
      rule: 'Severe Bradycardia (<50 bpm)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.heartRate > 100 || vitals.heartRate < 60) {
    flags.push({
      metric: 'Heart Rate',
      value: `${vitals.heartRate} bpm`,
      rule: 'Elevated or Low Heart Rate (Outside 60-100 bpm)',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  }

  // 5. Temperature (°F)
  if (vitals.temperature >= 103) {
    flags.push({
      metric: 'Body Temperature',
      value: `${vitals.temperature} °F`,
      rule: 'High Fever Hyperthermia (>=103 °F)',
      severity: 'CRITICAL',
    });
    updateSeverity('CRITICAL');
  } else if (vitals.temperature >= 100.4 || vitals.temperature <= 95) {
    flags.push({
      metric: 'Body Temperature',
      value: `${vitals.temperature} °F`,
      rule: 'Fever or Hypothermia Warning',
      severity: 'WARNING',
    });
    updateSeverity('WARNING');
  }

  // Calculate composite numerical Risk Score (0 to 100)
  let riskScore = 15; // baseline low risk
  if ((maxSeverity as string) === 'CRITICAL') riskScore += 55;
  else if ((maxSeverity as string) === 'WARNING') riskScore += 30;

  riskScore += flags.length * 8;
  if (vitals.systolicBp > 130) riskScore += Math.floor((vitals.systolicBp - 130) / 2);
  if (vitals.bloodGlucose > 110) riskScore += Math.floor((vitals.bloodGlucose - 110) / 5);
  if (vitals.spO2 < 95) riskScore += (95 - vitals.spO2) * 5;

  riskScore = Math.min(Math.max(riskScore, 5), 98);

  return {
    severity: maxSeverity,
    flags,
    overallRiskScore: riskScore,
  };
}
