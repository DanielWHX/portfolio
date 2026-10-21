import { funFactLinks } from "./fun-facts";

// Public Fun Facts grounding and request-only background are kept separate.
// Only the public object is included in the ordinary resume tool result.
export const personalProfile = {
  source: "Shared directly by Hongxiang Wang",
  public: {
    personality: {
      mbti: "ENTP",
      selfDescription: [
        "Enjoys questioning ideas and considering different perspectives",
        "Curious about many subjects",
        "Enjoys exchanging ideas with people from different countries and regions",
      ],
      note: "Self-described personality and MBTI, not a scientific assessment or proof of ability.",
    },
    interests: ["Fitness", "Travel", "Skydiving", "Skiing", "Gaming", "Spending time with friends", "LeetCode", "SaaS companies"],
    pet: { name: "Luca", breed: "Bichon Frise", reportedAgeYears: 11, ageReportedAt: "2026-10-21" },
    notion: { label: "LeetCode notes", url: funFactLinks.leetcode },
    whatnot: {
      activity: "Collaborated with friends on Whatnot livestream selling during college",
      peakMonthlyGrossSalesUsd: 22_000,
      lifetimeGrossSalesUsd: 150_000,
      metricsNote: "User-reported gross sales for the collaboration, not profit or Hongxiang's personal income.",
      unsharedDetails: ["Exact dates", "Ownership structure", "Account", "Profit", "Personal income"],
    },
  },
} as const;

// Not exported as part of the public profile, including in client card imports.
const agentReferenceProfile = {
  nationalIdentity: "Chinese",
  grewUpIn: "Beijing",
  highSchool: "二中",
  highSchoolNote: "Hongxiang supplied only 二中; the specific school's full name is unconfirmed.",
  parents: { activity: "Run a business", location: "Beijing" },
  sister: { activity: "Works", location: "Los Angeles" },
  contentInterests: ["Self-improvement videos and blogs", "Technology", "Finance", "Politics", "Sports"],
} as const;

// Broad introductions, cards, and suggested questions never receive these fields.
// A focused question receives only the relevant supplied background, not a full bio.
export function getRequestedPersonalBackground(question: string) {
  const background = agentReferenceProfile;
  const asksAboutPerson = /\b(?:you|your|hongxiang)\b|你|您|王鸿翔/iu.test(question);
  const asksForBackgroundField = /^(?:nationality|hometown|high school|parents?|sister|family|国籍|國籍|家乡|家鄉|高中|二中|父母|家人|姐姐)(?:\s|[?？:：是]|$)/iu.test(question.trim());
  if (!asksAboutPerson && !asksForBackgroundField) return {};
  return {
    ...(/nationality|national identity|citizenship|\bChinese\b|what country (?:are you|is hongxiang) from|国籍|國籍|哪国人|哪國人|中国人|中國人/iu.test(question)
      ? { nationalIdentity: background.nationalIdentity } : {}),
    ...(/grew up|grow up|hometown|upbringing|childhood|raised|where (?:are you|is hongxiang) (?:originally )?from|长大|長大|成长|成長|童年|家乡|家鄉|哪里人|哪裡人|来自哪里|來自哪裡/iu.test(question)
      ? { grewUpIn: background.grewUpIn } : {}),
    ...(/high school|secondary school|高中|二中/iu.test(question)
      ? { highSchool: background.highSchool, highSchoolNote: background.highSchoolNote } : {}),
    ...(/parents?|mother|father|父母|爸爸|妈妈|媽媽|家人|family/iu.test(question)
      ? { parents: background.parents } : {}),
    ...(/sister|sibling|姐姐|姐妹|家人|family/iu.test(question)
      ? { sister: background.sister } : {}),
    ...(asksAboutPerson && /(?:videos?|blogs?|content).*(?:watch|read|enjoy|like|follow)|(?:watch|read|enjoy|like|follow).*(?:videos?|blogs?|content)|self.improvement|(?:technology|finance|politics|sports).*(?:interests?|interested|follow)|(?:interests?|interested|follow).*(?:technology|finance|politics|sports)|自我提升|视频|視頻|博客|科技|财经|財經|政治|体育|體育/iu.test(question)
      ? { contentInterests: background.contentInterests } : {}),
  };
}
