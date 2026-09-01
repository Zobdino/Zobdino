export type CanonicalVoiceId = "sulafat" | "schedar";
export type CanonicalVoiceRole = "female" | "male";

export interface ApprovedVoiceProfile {
  id: CanonicalVoiceId;
  displayName: string;
  displayNameFa: string;
  role: CanonicalVoiceRole;
  providerVoice: string;
  profileVersion: string;
  productionApproved: true;
  legacyAliases: readonly string[];
}

export const APPROVED_VOICE_REGISTRY: Readonly<Record<CanonicalVoiceId, ApprovedVoiceProfile>> = {
  sulafat: {
    id: "sulafat",
    displayName: "Sulafat",
    displayNameFa: "سولافات",
    role: "female",
    providerVoice: "Sulafat",
    profileVersion: "1.0.0",
    productionApproved: true,
    legacyAliases: [],
  },
  schedar: {
    id: "schedar",
    displayName: "Schedar",
    displayNameFa: "شِدار",
    role: "male",
    providerVoice: "Schedar",
    profileVersion: "1.0.0",
    productionApproved: true,
    // Iapetus remains only as a migration alias for historical metadata/contracts.
    // New production metadata must use the canonical `schedar` product identity.
    legacyAliases: ["iapetus"],
  },
};

export const APPROVED_PRODUCTION_VOICE_IDS = Object.freeze(
  Object.keys(APPROVED_VOICE_REGISTRY) as CanonicalVoiceId[],
);

export function canonicalVoiceId(value: string): CanonicalVoiceId | null {
  const normalized = value.trim().toLowerCase();
  if (normalized in APPROVED_VOICE_REGISTRY) return normalized as CanonicalVoiceId;

  for (const profile of Object.values(APPROVED_VOICE_REGISTRY)) {
    if (profile.legacyAliases.includes(normalized)) return profile.id;
  }
  return null;
}

export function approvedVoiceProfile(value: string): ApprovedVoiceProfile | null {
  const id = canonicalVoiceId(value);
  return id ? APPROVED_VOICE_REGISTRY[id] : null;
}

export function assertApprovedProductionVoice(value: string): ApprovedVoiceProfile {
  const profile = approvedVoiceProfile(value);
  if (!profile) throw new Error(`production-voice-not-approved:${value}`);
  return profile;
}
