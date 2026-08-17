import { FAMILY_SEEDS } from "../data/families";
import type { AccessibilitySettings, FamilySeedId, GameState, HiddenTraits, TeenPattern } from "../types";

function mulberry32(seed: number) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function freshSeed(): number {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] || Date.now();
  }
  return Date.now();
}

function createTraits(seed: number, familyId: FamilySeedId): HiddenTraits {
  const random = mulberry32(seed);
  const family = FAMILY_SEEDS.find((item) => item.id === familyId) ?? FAMILY_SEEDS[0];
  const base: HiddenTraits = {
    biologicalSensitivity: 30 + random() * 50,
    moodVulnerability: 25 + random() * 55,
    attentionRegulation: 22 + random() * 64,
    perceptualSensitivity: 18 + random() * 60,
    traumaLoad: 12 + random() * 50,
    sleepDebt: 18 + random() * 38,
    familyStress: 20 + random() * 42,
    financialStress: 12 + random() * 38,
    stigmaExposure: 15 + random() * 40,
    masking: 14 + random() * 35,
    selfBlame: 18 + random() * 38,
    socialSupport: 25 + random() * 48,
    professionalSupport: 0,
  };

  for (const [key, value] of Object.entries(family.modifiers)) {
    const trait = key as keyof HiddenTraits;
    base[trait] = clamp(base[trait] + (value ?? 0));
  }
  return base;
}

export function deriveTeenPattern(traits: HiddenTraits, seed: number): TeenPattern {
  const random = mulberry32(seed ^ 0x9e3779b9);
  const scores: Record<TeenPattern, number> = {
    surge: traits.moodVulnerability + traits.biologicalSensitivity * 0.35 + random() * 28,
    low: traits.moodVulnerability * 0.7 + traits.selfBlame * 0.55 + traits.sleepDebt * 0.35 + random() * 28,
    perception: traits.perceptualSensitivity + traits.sleepDebt * 0.28 + traits.biologicalSensitivity * 0.2 + random() * 28,
    alarm: traits.traumaLoad + traits.familyStress * 0.42 + traits.stigmaExposure * 0.2 + random() * 28,
  };
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "low") as TeenPattern;
}

export function createLife(seed: number, settings?: AccessibilitySettings): GameState {
  const familyId = FAMILY_SEEDS[Math.abs(seed) % FAMILY_SEEDS.length].id;
  const traits = createTraits(seed, familyId);
  return {
    version: 2,
    phase: "notice",
    age: 0,
    seed,
    familyId,
    teenPattern: deriveTeenPattern(traits, seed),
    traits,
    flags: {},
    memories: [],
    explored: [],
    inventory: [],
    counters: {
      pretendedOkay: 0,
      saidNotOkay: 0,
      deletedMessages: 0,
      forgotWhy: 0,
      actionRetries: 0,
      missedBus: 0,
      ordinaryDays: 0,
      laughedHard: 1,
      goodFood: 2,
      workedWhileExhausted: 0,
      cancelledPlans: 0,
      onTimeAppointments: 0,
      missedAppointments: 0,
      maskedAtWork: 0,
      projectsCompleted: 0,
      peopleBelieved: 0,
      hospitalTrips: 1,
      caregivingTrips: 0,
      bureaucracyTrips: 0,
      lateNightJokes: 0,
      plantsKeptAlive: 0,
      groupMessages: 0,
    },
    signals: {
      sleep: "不知道算不算睡過",
      mind: "還沒有名字",
      body: "正在長大",
      people: "先看大人的臉色",
      next: "今天先呼吸",
      unread: 0,
    },
    settings: settings ?? { softMode: false, reducedDistractions: false },
    morning: { completed: [], attempts: {}, distractions: [], listHidden: false, actions: 0 },
    teenActions: [],
    adultActions: [],
    groupReplies: [],
    chapterProgress: 0,
    clinicStep: 0,
    lastText: "你不能選起點。很多事情也還沒有名字。",
  };
}

export function createHomeState(): GameState {
  return { ...createLife(81017), phase: "home" };
}
