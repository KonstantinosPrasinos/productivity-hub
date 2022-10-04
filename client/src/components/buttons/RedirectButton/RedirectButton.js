import styles from "./redirectButton.module.scss";

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router-dom";

const RedirectButton = ({label, location }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container} onClick={() => navigate(location)}>
      <div>{label}</div>
      <ArrowForwardIosIcon sx={{fontSize: '0.75em'}}className={styles.forwardIcon} />
    </div>
  );
};

export default RedirectButton;
