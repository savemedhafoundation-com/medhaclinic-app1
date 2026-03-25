type PatientGenderKey = 'female' | 'male' | 'other' | null;

type ImmunityParameterKey =
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

type HormonalParameterKey =
  | 'menstrualRegularity'
  | 'libidoStability';

type SystemScoreKey =
  | 'digestive'
  | 'immune'
  | 'energy'
  | 'cardiovascular'
  | 'respiratory'
  | 'hormonal';

type ImmunityLevel = 'Excellent' | 'Good' | 'Moderate' | 'Low';
type ImmunityApiLevel = 'excellent' | 'good' | 'moderate' | 'low';

type SystemScoreSummary = {
  key: SystemScoreKey;
  score: number;
} | null;

type SubmissionScoreInput = Partial<Record<ImmunityParameterKey, number | null | undefined>>;

type ValidationInput = {
  immunityScore?: number | null;
  immunityLevel?: string | null;
};

export type ServerImmunityAssessment = {
  immunityScore: number;
  roundedScore: number;
  level: ImmunityLevel;
  apiLevel: ImmunityApiLevel;
  baseWeightedScore: number;
  penaltyApplied: number;
  systemScores: Record<SystemScoreKey, number | null>;
  weakestSystem: SystemScoreSummary;
  strongestSystem: SystemScoreSummary;
  hormonalParameterKeyUsed: HormonalParameterKey | null;
  answeredParameters: ImmunityParameterKey[];
  normalizedScores: Partial<Record<ImmunityParameterKey, number | null>>;
};

export type ClientAssessmentValidation = {
  scoreProvided: boolean;
  levelProvided: boolean;
  scoreMatches: boolean;
  levelMatches: boolean;
  matches: boolean;
  providedScore: number | null;
  providedLevel: string | null;
  expectedScore: number;
  expectedLevel: ImmunityApiLevel;
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

const SCORE_KEYS: ImmunityParameterKey[] = [
  'physicalEnergy',
  'appetite',
  'digestionComfort',
  'burningPain',
  'bloatingGas',
  'bloodPressure',
  'swelling',
  'fever',
  'infection',
  'breathingProblem',
  'menstrualRegularity',
  'libidoStability',
  'hairHealth',
  'sleepHours',
];

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

function getImmunityLevel(score: number): ImmunityLevel {
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

function getImmunityApiLevel(level: ImmunityLevel): ImmunityApiLevel {
  switch (level) {
    case 'Excellent':
      return 'excellent';
    case 'Good':
      return 'good';
    case 'Moderate':
      return 'moderate';
    default:
      return 'low';
  }
}

function normalizeClientLevel(value?: string | null) {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case 'excellent':
      return 'excellent' as const;
    case 'good':
      return 'good' as const;
    case 'moderate':
      return 'moderate' as const;
    case 'low':
      return 'low' as const;
    case 'high':
      return 'excellent' as const;
    case 'medium':
      return 'moderate' as const;
    default:
      return null;
  }
}

export function normalizeGenderKey(value?: string | null): PatientGenderKey {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith('m')) {
    return 'male';
  }

  if (normalized.startsWith('f')) {
    return 'female';
  }

  return 'other';
}

export function buildServerImmunityAssessment(
  input: SubmissionScoreInput,
  gender: PatientGenderKey = null
): ServerImmunityAssessment {
  const answeredMap = new Map<ImmunityParameterKey, number>();

  for (const key of SCORE_KEYS) {
    const value = input[key];

    if (isValidScore(value)) {
      answeredMap.set(key, value);
    }
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

  const rawWeightedScore = calculateWeightedScore(answeredMap);
  const baseWeightedScore = round2(rawWeightedScore);
  const penaltyApplied = calculatePenalty(answeredMap);
  const immunityScore = round2(clampScore(rawWeightedScore - penaltyApplied));
  const level = getImmunityLevel(immunityScore);

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

  const normalizedScores = SCORE_KEYS.reduce<
    Partial<Record<ImmunityParameterKey, number | null>>
  >((accumulator, key) => {
    accumulator[key] = answeredMap.has(key) ? answeredMap.get(key) ?? null : null;
    return accumulator;
  }, {});

  return {
    immunityScore,
    roundedScore: Math.round(immunityScore),
    level,
    apiLevel: getImmunityApiLevel(level),
    baseWeightedScore,
    penaltyApplied,
    systemScores,
    weakestSystem: findExtremeSystem(systemScores, 'min'),
    strongestSystem: findExtremeSystem(systemScores, 'max'),
    hormonalParameterKeyUsed,
    answeredParameters: [...answeredMap.keys()],
    normalizedScores,
  };
}

export function validateClientImmunityAssessment(
  input: ValidationInput,
  assessment: ServerImmunityAssessment
): ClientAssessmentValidation {
  const providedScore =
    typeof input.immunityScore === 'number' && Number.isFinite(input.immunityScore)
      ? input.immunityScore
      : null;
  const providedLevel = input.immunityLevel?.trim() || null;
  const normalizedClientLevel = normalizeClientLevel(providedLevel);

  const scoreProvided = providedScore !== null;
  const levelProvided = providedLevel !== null;
  const scoreMatches = !scoreProvided || Math.round(providedScore) === assessment.roundedScore;
  const levelMatches = !levelProvided || normalizedClientLevel === assessment.apiLevel;

  return {
    scoreProvided,
    levelProvided,
    scoreMatches,
    levelMatches,
    matches: scoreMatches && levelMatches,
    providedScore,
    providedLevel,
    expectedScore: assessment.roundedScore,
    expectedLevel: assessment.apiLevel,
  };
}
