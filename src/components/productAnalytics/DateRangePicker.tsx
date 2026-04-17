import React from "react";
import { Box, TextField } from "@mui/material";

type Props = {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
};

const DateRangePicker: React.FC<Props> = ({ from, to, onFromChange, onToChange }) => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", mb: 3 }}>
    <TextField
      label="From"
      type="date"
      size="small"
      value={from}
      onChange={(e) => onFromChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="To"
      type="date"
      size="small"
      value={to}
      onChange={(e) => onToChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
  </Box>
);

export default DateRangePicker;
