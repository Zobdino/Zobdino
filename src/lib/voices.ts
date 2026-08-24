export const APPROVED_VOICE_PROFILES = {
  "sulafat-v1": {
    id: "sulafat-v1",
    providerVoice: "Sulafat",
    role: "female",
    labelFa: "صدای زن زبدینو",
    status: "approved",
  },
  "schedar-v1": {
    id: "schedar-v1",
    providerVoice: "Schedar",
    role: "male",
    labelFa: "صدای مرد زبدینو",
    status: "approved",
  },
} as const;

export type ApprovedVoiceProfileId = keyof typeof APPROVED_VOICE_PROFILES;
export type VoiceProfileId = ApprovedVoiceProfileId | "legacy-unverified";

export function getVoiceProfileLabelFa(profileId: VoiceProfileId | undefined) {
  if (!profileId || profileId === "legacy-unverified") {
    return "صدای قدیمی · در انتظار جایگزینی";
  }

  return APPROVED_VOICE_PROFILES[profileId].labelFa;
}

export function isApprovedVoiceProfile(
  profileId: VoiceProfileId | undefined,
): profileId is ApprovedVoiceProfileId {
  return Boolean(profileId && profileId in APPROVED_VOICE_PROFILES);
}
