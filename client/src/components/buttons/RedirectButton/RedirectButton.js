import styles from "./redirectButton.module.scss";

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from "react-router-dom";

const RedirectButton = ({ icon, label, location }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container} onClick={() => navigate(location)}>
      <>{icon}</>
      <div>{label}</div>
      <ArrowForwardIosIcon className={styles.forwardIcon} />
    </div>
  );
};

export default RedirectButton;
