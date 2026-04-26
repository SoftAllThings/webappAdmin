import React, { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #f0f4ff 0%, #fdf2f8 50%, #f8fafc 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          border: "1px solid rgba(99, 102, 241, 0.1)",
          boxShadow: "0 4px 24px rgba(99, 102, 241, 0.08), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 32, color: "#fff" }} />
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.5 }}>
            PoopCheck
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Admin Dashboard
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            sx={{ mb: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: "1rem",
              borderRadius: 3,
            }}
            size="large"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
