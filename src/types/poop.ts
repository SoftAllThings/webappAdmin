// TypeScript interfaces for the Poop data structure
// Shared with backend API

export interface PoopRecord {
  id: string;
  bristol_type: number;
  consistency: number;
  shape: number;
  quantity: number;
  color: number;
  health: number;
  blood: number;
  mucus: number;
  floating: number;
  smell_level: number;
  pain_level: number;
  duration: number;
  verified: boolean;
  liver_flukes: number;
  colon_cancer: number;
  hemorrhoids: number;
  anal_fissures: number;
  crohns_disease: number;
  ulcerative_colitis: number;
  celiac_disease: number;
  gallbladder_disease: number;
  pancreatitis: number;
  liver_disease: number;
  upper_gastrointestinal_bleeding: number;
  gastrointestinal_infection: number;
  lactose_intolerance: number;
  food_poisoning: number;
  diverticulitis: number;
  irritable_bowel_syndrome: number;
  constipation: number;
  dehydration: number;
  hypothyroidism: number;
  bile_duct_obstruction: number;
  malabsorption_syndrome: number;
  rapid_gastrointestinal_transit: number;
  created_at?: string;
  updated_at?: string;
  s3_key?: string | null;
  s3_url?: string | null;
  gpt_bristol_type?: string | null;
}

// For creating new records (without ID and timestamps)
export interface CreatePoopRecord {
  bristol_type: number;
  consistency: number;
  shape: number;
  quantity: number;
  color: number;
  health: number;
  blood: number;
  mucus: number;
  floating: number;
  smell_level: number;
  pain_level: number;
  duration: number;
  verified?: boolean;
  liver_flukes?: number;
  colon_cancer?: number;
  hemorrhoids?: number;
  anal_fissures?: number;
  crohns_disease?: number;
  ulcerative_colitis?: number;
  celiac_disease?: number;
  gallbladder_disease?: number;
  pancreatitis?: number;
  liver_disease?: number;
  upper_gastrointestinal_bleeding?: number;
  gastrointestinal_infection?: number;
  lactose_intolerance?: number;
  food_poisoning?: number;
  diverticulitis?: number;
  irritable_bowel_syndrome?: number;
  constipation?: number;
  dehydration?: number;
  hypothyroidism?: number;
  bile_duct_obstruction?: number;
  malabsorption_syndrome?: number;
  rapid_gastrointestinal_transit?: number;
  s3_key?: string | null;
  s3_url?: string | null;
  gpt_bristol_type?: string | null;
}

// For updating existing records (all fields optional except ID)
export interface UpdatePoopRecord {
  id: string;
  bristol_type?: number;
  consistency?: number;
  shape?: number;
  quantity?: number;
  color?: number;
  health?: number;
  blood?: number;
  mucus?: number;
  floating?: number;
  smell_level?: number;
  pain_level?: number;
  duration?: number;
  verified?: boolean;
  liver_flukes?: number;
  colon_cancer?: number;
  hemorrhoids?: number;
  anal_fissures?: number;
  crohns_disease?: number;
  ulcerative_colitis?: number;
  celiac_disease?: number;
  gallbladder_disease?: number;
  pancreatitis?: number;
  liver_disease?: number;
  upper_gastrointestinal_bleeding?: number;
  gastrointestinal_infection?: number;
  lactose_intolerance?: number;
  food_poisoning?: number;
  diverticulitis?: number;
  irritable_bowel_syndrome?: number;
  constipation?: number;
  dehydration?: number;
  hypothyroidism?: number;
  bile_duct_obstruction?: number;
  malabsorption_syndrome?: number;
  rapid_gastrointestinal_transit?: number;
  s3_key?: string | null;
  s3_url?: string | null;
  gpt_bristol_type?: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PoopListResponse extends ApiResponse<PoopRecord[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    bristolType?: number;
  };
}

export interface PoopDetailResponse extends ApiResponse<PoopRecord> {}

// Enum-like constants for the numeric values
export const BRISTOL_TYPES = {
  1: "Separate hard lumps",
  2: "Lumpy and sausage-like",
  3: "A sausage shape with cracks in the surface",
  4: "Like a smooth, soft sausage or snake",
  5: "Soft blobs with clear-cut edges",
  6: "Mushy consistency with ragged edges",
  7: "Liquid consistency with no solid pieces",
} as const;

export const CONSISTENCY_TYPES = {
  0: "Hard",
  1: "Soft",
  2: "Normal",
  3: "Liquid",
} as const;

export const SHAPE_TYPES = {
  0: "Sausage",
  1: "Lumpy",
  2: "Flat",
  3: "Blob",
  4: "Liquid",
} as const;

export const COLOR_TYPES = {
  0: "Black",
  1: "White",
  2: "Green",
  3: "Yellow",
  4: "Red",
  5: "Brown",
  6: "Orange",
} as const;

export const QUANTITY_TYPES = {
  0: "Small",
  1: "Normal",
  2: "Large",
} as const;

export const HEALTH_TYPES = {
  0: "Healthy",
  1: "Unhealthy",
} as const;

export const MUCUS_TYPES = {
  0: "None",
  1: "Trace",
  2: "Moderate",
  3: "High",
} as const;

export const BLOOD_TYPES = {
  0: "None",
  1: "Trace",
  2: "Moderate",
  3: "High",
} as const;

export const FLOATING_TYPES = {
  0: "Sink",
  1: "Float",
} as const;

export const CONDITIONS_TYPES = {
  0: "Low",
  1: "Moderate",
  2: "High",
} as const;

// All the medical condition fields that use CONDITIONS_TYPES mapping
export const CONDITIONS_FEATURES = [
  "liver_flukes",
  "colon_cancer",
  "hemorrhoids",
  "anal_fissures",
  "crohns_disease",
  "ulcerative_colitis",
  "celiac_disease",
  "gallbladder_disease",
  "pancreatitis",
  "liver_disease",
  "upper_gastrointestinal_bleeding",
  "gastrointestinal_infection",
  "lactose_intolerance",
  "food_poisoning",
  "diverticulitis",
  "irritable_bowel_syndrome",
  "constipation",
  "dehydration",
  "hypothyroidism",
  "bile_duct_obstruction",
  "malabsorption_syndrome",
  "rapid_gastrointestinal_transit",
] as const;
