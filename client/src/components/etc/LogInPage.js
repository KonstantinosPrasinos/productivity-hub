import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Paper,
  InputAdornment,
  IconButton,
  Collapse,
  TextField,
} from "@mui/material";
import { useState } from "react";
import GoogleSignInButton from "./GoogleSignInButton";
import { useTheme } from "@emotion/react";
import { useNavigate, useLocation } from "react-router-dom";

const LogInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(true);

  const theme = useTheme();
  const navigate = useNavigate();
  const {state} = useLocation();

  const invertShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const invertShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLogin = () => {
    navigate(state?.path || "/")
  }

  return (
    <div style={{position: 'fixed', width: "100%", height: "100%", top: 0, left: 0, background: theme.palette.background.default}}>
      <Paper
        className="log-in-container"
        sx={{
          borderRadius: "10px",
          flexDirection: "column",
          rowGap: "10px",
          display: "flex",
          alignItems: "center",
          paddingTop: "3em",
          position: "fixed",
          width: "500px",
          height: "750px",
          left: "calc(50% - 250px)",
          top: "calc(50% - 375px)",
        }}
      >
        <LockIcon sx={{ height: "80px", width: "80px" }} />
        <h1>Welcome to Productivity Hub</h1>
        <Collapse in={!loggingIn}>
          <TextField
            sx={{ width: "17em" }}
            id="username-input-register"
            label="Username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              ),
            }}
            margin="dense"
          />
        </Collapse>
        <TextField
          sx={{ width: "17em" }}
          id="email-input-log-in"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          label="Email"
        />
        <TextField
          sx={{ width: "17em" }}
          label="Password"
          id="password-input-log-in"
          type={showPassword ? "text" : "password"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onMouseDown={invertShowPassword}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Collapse in={!loggingIn}>
          <TextField
            sx={{ width: "17em" }}
            id="confirm-input-log-in"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseDown={invertShowConfirmPassword}
                    aria-label="toggle password visibility"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            margin="dense"
          />
        </Collapse>

        <table>
          <tbody>
            <tr>
              <th>
                <button className="text-button">Forgot your password?</button>
              </th>
              <th>
                <button
                  onClick={() => setLoggingIn(!loggingIn)}
                  className="text-button"
                >
                  {loggingIn
                    ? "Not registered yet? Sign Up"
                    : "Already a user? Log in"}
                </button>
              </th>
            </tr>
          </tbody>
        </table>
        <h2>Or</h2>
        <GoogleSignInButton />
        <button className="text-button" onClick={() => {handleLogin()}}>
          You can also continue without logging in
        </button>
      </Paper>
    </div>
  );
};

export default LogInPage;
