import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface ToggleButtonFieldProps {
  label: string;
  value: string | number | null | undefined;
  options: Record<string, string>;
  onChange: (value: string | number) => void;
  fullWidth?: boolean;
}

const ToggleButtonField: React.FC<ToggleButtonFieldProps> = ({
  label,
  value,
  options,
  onChange,
  fullWidth = false,
}) => {
  const currentValue = value?.toString() || "";

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 1,
          color: "text.secondary",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          overflowX: "auto",
          pb: 0.5,
          // Hide scrollbar but keep functionality
          "&::-webkit-scrollbar": {
            height: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 2,
          },
        }}
      >
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <Chip
            key={optionValue}
            label={optionLabel}
            onClick={() => onChange(optionValue)}
            color={currentValue === optionValue ? "primary" : "default"}
            variant={currentValue === optionValue ? "filled" : "outlined"}
            sx={{
              cursor: "pointer",
              fontWeight: currentValue === optionValue ? 600 : 400,
              minHeight: 44, // Good touch target size
              fontSize: "0.875rem",
              transition: "all 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ToggleButtonField;
