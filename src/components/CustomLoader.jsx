import { CircularProgress, Box } from "@mui/material";

const CustomLoader = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
      <CircularProgress />
    </Box>
  );
};

export default CustomLoader;
