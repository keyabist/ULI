import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const CustomTable = ({ data, columns, actions }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "#121212", // Dark Binance-style background
        color: "#EAECEF", // Light text
        boxShadow: "0px 4px 10px rgba(255, 196, 0, 0.2)", // Binance-style glow
        borderRadius: "10px",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#181818" }}>
            {columns.map((col, index) => (
              <TableCell
                key={index}
                align={col.align || "left"}
                sx={{ color: "#F0B90B", fontWeight: "bold" }} // Binance gold for headers
              >
                {col.label}
              </TableCell>
            ))}
            {actions && (
              <TableCell align="right" sx={{ color: "#F0B90B", fontWeight: "bold" }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              sx={{
                "&:hover": { backgroundColor: "#222" },
                transition: "background 0.2s",
              }}
            >
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} align={col.align || "left"} sx={{ color: "#EAECEF" }}>
                  {col.render ? col.render(row[col.field]) : row[col.field]}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="right">
                  {actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      onClick={() => action.onClick(row)}
                      sx={{
                        mx: 0.5,
                        backgroundColor: action.color === "error" ? "#ff4d4d" : "#28a745", // Greenish for Approve
                        color: "#ffffff",
                        "&:hover": {
                          backgroundColor: action.color === "error" ? "#cc0000" : "#218838", // Darker green hover
                        },
                      }}
                      variant="contained"
                      size="small"
                    >
                      {action.label}
                    </Button>
                  ))}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;
