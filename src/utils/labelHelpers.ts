import {
  BRISTOL_TYPES,
  CONSISTENCY_TYPES,
  SHAPE_TYPES,
  COLOR_TYPES,
  QUANTITY_TYPES,
  HEALTH_TYPES,
  MUCUS_TYPES,
  BLOOD_TYPES,
  FLOATING_TYPES,
} from "../types/poop";

export const getBristolLabel = (type: number): string => {
  return BRISTOL_TYPES[type as keyof typeof BRISTOL_TYPES] || `Type ${type}`;
};

export const getConsistencyLabel = (consistency: number): string => {
  return (
    CONSISTENCY_TYPES[consistency as keyof typeof CONSISTENCY_TYPES] ||
    `Level ${consistency}`
  );
};

export const getShapeLabel = (shape: number): string => {
  return SHAPE_TYPES[shape as keyof typeof SHAPE_TYPES] || `Shape ${shape}`;
};

export const getColorLabel = (color: number): string => {
  return COLOR_TYPES[color as keyof typeof COLOR_TYPES] || `Color ${color}`;
};

export const getQuantityLabel = (quantity: number): string => {
  return (
    QUANTITY_TYPES[quantity as keyof typeof QUANTITY_TYPES] ||
    `Quantity ${quantity}`
  );
};

export const getHealthLabel = (health: number): string => {
  return (
    HEALTH_TYPES[health as keyof typeof HEALTH_TYPES] || `Health ${health}`
  );
};

export const getMucusLabel = (mucus: number): string => {
  return MUCUS_TYPES[mucus as keyof typeof MUCUS_TYPES] || `Mucus ${mucus}`;
};

export const getBloodLabel = (blood: number): string => {
  return BLOOD_TYPES[blood as keyof typeof BLOOD_TYPES] || `Blood ${blood}`;
};

export const getFloatingLabel = (floating: number): string => {
  return (
    FLOATING_TYPES[floating as keyof typeof FLOATING_TYPES] ||
    `Floating ${floating}`
  );
};

export const getHealthColor = (
  health: number
): "success" | "warning" | "error" | "default" => {
  return health === 0 ? "success" : "warning";
};

export const getSeverityColor = (
  level: number
): "success" | "warning" | "error" | "default" => {
  if (level === 0) return "success";
  if (level === 1) return "warning";
  if (level >= 2) return "error";
  return "default";
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
