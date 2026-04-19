export type Activity = {
  title: string;
  category: string;
  duration: string;
  goal: string;
  materials: string[];
  steps: string[];
  difficulty_adjustments: {
    easier: string;
    harder: string;
  };
  safety_notes: string[];
  talking_points: string[];
  day_label?: string;
};

export type FormState = {
  participants: string;
  level: string;
  duration: string;
  goal: string;
  season: string;
  materials: string;
  avoid: string;
};

export type SavedActivity = Activity & { savedAt: string; id: string };

export type ExecutionRecord = {
  id: string;
  activityTitle: string;
  activityCategory: string;
  date: string;
  participants: number;
  reaction: "好評" | "普通" | "反応薄い";
  note: string;
  createdAt: string;
};
