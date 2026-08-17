export type Phase =
  | "home"
  | "notice"
  | "birth"
  | "childhood-room"
  | "family-talk"
  | "school-morning"
  | "ordinary-day"
  | "teen-event"
  | "wrong-explanation"
  | "counselor"
  | "clinic-trip"
  | "clinic-room"
  | "memory-return"
  | "slice-ending";

export type FamilySeedId = "unspoken" | "closed" | "warm" | "stretched" | "caregiving";
export type TeenPattern = "surge" | "low" | "perception" | "alarm";

export type HiddenTraits = {
  biologicalSensitivity: number;
  moodVulnerability: number;
  attentionRegulation: number;
  perceptualSensitivity: number;
  traumaLoad: number;
  sleepDebt: number;
  familyStress: number;
  financialStress: number;
  stigmaExposure: number;
  masking: number;
  selfBlame: number;
  socialSupport: number;
  professionalSupport: number;
};

export type HiddenEffect = Partial<HiddenTraits>;

export type LifeCounters = {
  pretendedOkay: number;
  saidNotOkay: number;
  deletedMessages: number;
  forgotWhy: number;
  actionRetries: number;
  missedBus: number;
  ordinaryDays: number;
  laughedHard: number;
  goodFood: number;
};

export type MemoryFragment = {
  id: string;
  ageFound: number;
  titleAtTime: string;
  descriptionAtTime: string;
  interpretation?: string;
  reinterpretAtAge?: number;
  linkedEventIds: string[];
};

export type BodySignals = {
  sleep: string;
  mind: string;
  body: string;
  people: string;
  next: string;
  unread: number;
};

export type AccessibilitySettings = {
  softMode: boolean;
  reducedDistractions: boolean;
};

export type MorningState = {
  completed: string[];
  attempts: Record<string, number>;
  distractions: string[];
  listHidden: boolean;
  actions: number;
};

export type GameFlags = Record<string, boolean>;

export type GameState = {
  version: 2;
  phase: Phase;
  age: number;
  seed: number;
  familyId: FamilySeedId;
  teenPattern: TeenPattern;
  traits: HiddenTraits;
  flags: GameFlags;
  memories: MemoryFragment[];
  explored: string[];
  inventory: string[];
  counters: LifeCounters;
  signals: BodySignals;
  settings: AccessibilitySettings;
  morning: MorningState;
  teenActions: string[];
  clinicStep: number;
  lastText: string;
};

export type EventCondition = {
  trait?: keyof HiddenTraits;
  min?: number;
  flag?: string;
};

export type DialogueNode = {
  speaker: string;
  text: string;
};

export type LifeEvent = {
  id: string;
  ageRange: [number, number];
  conditions: EventCondition[];
  scene: string;
  dialogue: DialogueNode[];
  hiddenEffects?: HiddenEffect;
  memoryUnlock?: string[];
  futureFlags?: string[];
};

export type GameAction =
  | { type: "NEW_LIFE"; seed: number; settings?: AccessibilitySettings }
  | { type: "HYDRATE"; state: GameState }
  | { type: "GO"; phase: Phase; age?: number; text?: string }
  | { type: "SET_SETTING"; key: keyof AccessibilitySettings; value: boolean }
  | { type: "INSPECT"; objectId: string; memoryId?: string; text: string }
  | { type: "APPLY_CHOICE"; effects?: HiddenEffect; flags?: string[]; counters?: Partial<LifeCounters>; text: string; next?: Phase; age?: number }
  | { type: "MORNING_ACTION"; actionId: string }
  | { type: "ADD_DISTRACTION"; distractionId: string }
  | { type: "CLEAR_DISTRACTIONS" }
  | { type: "TEEN_ACTION"; actionId: string; effects?: HiddenEffect; text: string }
  | { type: "CLINIC_NEXT"; text: string }
  | { type: "REINTERPRET_MEMORY"; memoryId: string; interpretation: string }
  | { type: "UNLOCK_MEMORY"; memoryId: string }
  | { type: "SET_TEXT"; text: string };
