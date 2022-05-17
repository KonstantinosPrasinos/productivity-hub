import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Paper,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import { useState } from "react";

const LogInPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const invertShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper
      className="log-in-container"
      sx={{
        borderRadius: "10px",
        flexDirection: "column",
        rowGap: "10px",
        display: 'flex',
        alignItems: "center",
        paddingTop: "3em",
        position: "fixed",
        width: "500px",
        height: "750px",
        left: 'calc(50% - 250px)',
        top: 'calc(50% - 375px)'
      }}
    >
      <script src="https://apis.google.com/js/platform.js" async defer></script>
      <LockIcon sx={{ height: "80px", width: "80px" }} />
      <h1>Welcome to Productivity Hub</h1>
      <FormControl variant="outlined" sx={{ width: "60%" }}>
        <InputLabel htmlFor="email-input-log-in">Email</InputLabel>
        <OutlinedInput
          sx={{ borderRadius: "10px" }}
          id="email-input-log-in"
          startAdornment={
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          }
          label="Email"
        />
      </FormControl>
      <FormControl variant="outlined" sx={{ width: "60%" }}>
        <InputLabel htmlFor="password-input-log-in">Password</InputLabel>
        <OutlinedInput
          sx={{ borderRadius: "10px" }}
          label="password"
          id="password-input-log-in"
          type={showPassword ? "text" : "password"}
          startAdornment={
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onMouseDown={invertShowPassword}
                aria-label="toggle password visibility"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <table>
        <tbody>
          <tr>
            <th>
              <button>Forgot your password?</button>
            </th>
            <th>
              <button>Not registered yet? Sign Up</button>
            </th>
          </tr>
        </tbody>
      </table>
      <h2>Or</h2>
      {/* <div className="g-signin2" data-onsuccess="onSignIn"></div> */}
    </Paper>
  );
};

export default LogInPage;
