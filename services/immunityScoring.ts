export type PatientGenderKey = 'female' | 'male' | 'other' | null;

export type ImmunityParameterKey =
  | 'physicalEnergy'
  | 'appetite'
  | 'digestionComfort'
  | 'burningPain'
  | 'bloatingGas'
  | 'bloodPressure'
  | 'swelling'
  | 'fever'
  | 'infection'
  | 'breathingProblem'
  | 'menstrualRegularity'
  | 'libidoStability'
  | 'hairHealth'
  | 'sleepHours';

export type HormonalParameterKey =
  | 'menstrualRegularity'
  | 'libidoStability';

export type SystemScoreKey =
  | 'digestive'
  | 'immune'
  | 'energy'
  | 'cardiovascular'
  | 'respiratory'
  | 'hormonal';

export type ImmunityLevel = 'Excellent' | 'Good' | 'Moderate' | 'Low';

export type AnsweredImmunityParameter = {
  key: ImmunityParameterKey;
  score?: number | null;
  answered?: boolean;
};

export type SystemScoreSummary = {
  key: SystemScoreKey;
  score: number;
} | null;

export type ImmunityAssessmentResult = {
  immunityScore: number;
  roundedScore: number;
  level: ImmunityLevel;
  baseWeightedScore: number;
  penaltyApplied: number;
  systemScores: Record<SystemScoreKey, number | null>;
  weakestSystem: SystemScoreSummary;
  strongestSystem: SystemScoreSummary;
  hormonalParameterKeyUsed: HormonalParameterKey | null;
  answeredParameters: ImmunityParameterKey[];
};

const PARAMETER_WEIGHTS: Record<ImmunityParameterKey, number> = {
  physicalEnergy: 1.3,
  appetite: 1.3,
  digestionComfort: 1.3,
  burningPain: 1.1,
  bloatingGas: 1.1,
  bloodPressure: 1.1,
  swelling: 0.9,
  fever: 1.5,
  infection: 1.5,
  breathingProblem: 1.5,
  menstrualRegularity: 1.0,
  libidoStability: 1.0,
  hairHealth: 0.9,
  sleepHours: 1.4,
};

const SYSTEM_SCORE_ORDER: SystemScoreKey[] = [
  'digestive',
  'immune',
  'energy',
  'cardiovascular',
  'respiratory',
  'hormonal',
];

function round2(value: number) {
  return Number(value.toFixed(2));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(10, value));
}

function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10;
}

function averageDefinedScores(values: (number | undefined)[]) {
  const definedValues = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (!definedValues.length) {
    return null;
  }

  return round2(
    definedValues.reduce((total, value) => total + value, 0) / definedValues.length
  );
}

function buildAnsweredParameterMap(
  entries: AnsweredImmunityParameter[],
  gender: PatientGenderKey
) {
  const answeredMap = new Map<ImmunityParameterKey, number>();

  for (const entry of entries) {
    if (entry.answered === false || !isValidScore(entry.score)) {
      continue;
    }

    answeredMap.set(entry.key, entry.score);
  }

  const hormonalParameterKeyUsed = resolveHormonalParameterKey(answeredMap, gender);

  if (hormonalParameterKeyUsed === 'menstrualRegularity') {
    answeredMap.delete('libidoStability');
  } else if (hormonalParameterKeyUsed === 'libidoStability') {
    answeredMap.delete('menstrualRegularity');
  } else {
    answeredMap.delete('menstrualRegularity');
    answeredMap.delete('libidoStability');
  }

  return {
    answeredMap,
    hormonalParameterKeyUsed,
  };
}

function resolveHormonalParameterKey(
  answeredMap: Map<ImmunityParameterKey, number>,
  gender: PatientGenderKey
): HormonalParameterKey | null {
  if (gender === 'female') {
    return answeredMap.has('menstrualRegularity') ? 'menstrualRegularity' : null;
  }

  if (gender === 'male') {
    return answeredMap.has('libidoStability') ? 'libidoStability' : null;
  }

  if (answeredMap.has('menstrualRegularity')) {
    return 'menstrualRegularity';
  }

  if (answeredMap.has('libidoStability')) {
    return 'libidoStability';
  }

  return null;
}

function calculateWeightedScore(answeredMap: Map<ImmunityParameterKey, number>) {
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const [key, score] of answeredMap.entries()) {
    const weight = PARAMETER_WEIGHTS[key];
    weightedTotal += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return weightedTotal / totalWeight;
}

function calculatePenalty(answeredMap: Map<ImmunityParameterKey, number>) {
  return answeredMap.get('fever') === 3 || answeredMap.get('infection') === 3 ? 0.5 : 0;
}

function scoreFor(answeredMap: Map<ImmunityParameterKey, number>, key: ImmunityParameterKey) {
  return answeredMap.get(key);
}

function findExtremeSystem(
  systemScores: Record<SystemScoreKey, number | null>,
  direction: 'min' | 'max'
): SystemScoreSummary {
  const scoredSystems = SYSTEM_SCORE_ORDER.flatMap(key => {
    const score = systemScores[key];
    return typeof score === 'number' ? [{ key, score }] : [];
  });

  if (!scoredSystems.length) {
    return null;
  }

  return scoredSystems.reduce((current, candidate) => {
    if (direction === 'min') {
      return candidate.score < current.score ? candidate : current;
    }

    return candidate.score > current.score ? candidate : current;
  });
}

export function getImmunityLevel(score: number): ImmunityLevel {
  if (score >= 8.2) {
    return 'Excellent';
  }

  if (score >= 6.8) {
    return 'Good';
  }

  if (score >= 5.2) {
    return 'Moderate';
  }

  return 'Low';
}

export function buildImmunityAssessment(
  entries: AnsweredImmunityParameter[],
  gender: PatientGenderKey = null
): ImmunityAssessmentResult {
  const { answeredMap, hormonalParameterKeyUsed } = buildAnsweredParameterMap(
    entries,
    gender
  );
  const rawWeightedScore = calculateWeightedScore(answeredMap);
  const baseWeightedScore = round2(rawWeightedScore);
  const penaltyApplied = calculatePenalty(answeredMap);
  const immunityScore = round2(clampScore(rawWeightedScore - penaltyApplied));

  const systemScores: Record<SystemScoreKey, number | null> = {
    digestive: averageDefinedScores([
      scoreFor(answeredMap, 'appetite'),
      scoreFor(answeredMap, 'digestionComfort'),
      scoreFor(answeredMap, 'bloatingGas'),
    ]),
    immune: averageDefinedScores([
      scoreFor(answeredMap, 'fever'),
      scoreFor(answeredMap, 'infection'),
      scoreFor(answeredMap, 'swelling'),
    ]),
    energy: averageDefinedScores([
      scoreFor(answeredMap, 'physicalEnergy'),
      scoreFor(answeredMap, 'sleepHours'),
    ]),
    cardiovascular: averageDefinedScores([scoreFor(answeredMap, 'bloodPressure')]),
    respiratory: averageDefinedScores([scoreFor(answeredMap, 'breathingProblem')]),
    hormonal: hormonalParameterKeyUsed
      ? averageDefinedScores([scoreFor(answeredMap, hormonalParameterKeyUsed)])
      : null,
  };

  return {
    immunityScore,
    roundedScore: Math.round(immunityScore),
    level: getImmunityLevel(immunityScore),
    baseWeightedScore,
    penaltyApplied,
    systemScores,
    weakestSystem: findExtremeSystem(systemScores, 'min'),
    strongestSystem: findExtremeSystem(systemScores, 'max'),
    hormonalParameterKeyUsed,
    answeredParameters: [...answeredMap.keys()],
  };
}
