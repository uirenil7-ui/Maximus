export interface MaximusScore {
  symmetry: number;
  jawline: number;
  skin: number;
  eyes: number;
  overall: number;
}

export interface ImprovementPlan {
  daily: string[];
  weekly: string[];
  lifestyle: string[];
  groomingAdvice: string;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlockedAt: string;
}

export interface PostureResult {
  scores: {
    headPosture: number; // 0-100
    shoulderAlignment: number;
    spineNeutrality: number;
    overall: number;
  };
  feedback: string;
  remedies: string[];
  mewingTechnique: string;
}

export interface VocalResult {
  pitch: number; // Hz
  resonance: string;
  tonality: string;
  auraBoost: number;
  exercises: string[];
}

export interface NutritionResult {
  bloatRisk: 'Low' | 'Moderate' | 'High';
  sodiumLevel: string;
  hydrationImpact: string;
  aestheticsAdvice: string;
}

export interface SimulationResult {
  faceShape: string;
  recommendedHairstyles: string[];
  recommendedBeards: string[];
  logic: string;
}

export interface Post {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  tier: string;
  vouchCount: number;
  imageUrl: string;
  timestamp: string;
}

export interface ComparisonResult {
  deltaScore: number;
  improvements: string[];
  analysis: string;
}

export interface ScanResult {
  scores: MaximusScore;
  scoreExplanations: {
    symmetry: string;
    jawline: string;
    skin: string;
    eyes: string;
  };
  feedback: string;
  recommendations: string[];
  improvementPlan: ImprovementPlan;
  dailyInsight: string;
  recommendedIngredients: string[];
  simulation?: SimulationResult;
  posture?: PostureResult;
  vocal?: VocalResult;
  nutrition?: NutritionResult;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  overallScore: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  overallScore: number;
  aura: number;
  achievements: Achievement[];
  streak: number;
  lastScanDate?: string;
  createdAt: string;
  isElite?: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: 'Grooming' | 'Posture' | 'Fitness' | 'Skincare';
}

export interface Routine {
  id: string;
  userId: string;
  title: string;
  tasks: Task[];
}
