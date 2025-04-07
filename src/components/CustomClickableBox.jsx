import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ClickableLoanBox = ({ icon, title, value, caption, link }) => {
  const navigate = useNavigate();

  return (
    <div className="clickable-box" onClick={() => navigate(link)}>
      <Box className="box-header">
        {icon}
        <Typography variant="subtitle1" className="header-text">
          {title}
        </Typography>
      </Box>
      <Typography className="value" variant="h5">
        {value}
      </Typography>
      <Typography className="caption" variant="caption">
        {caption}
      </Typography>
    </div>
  );
};

export default ClickableLoanBox;
