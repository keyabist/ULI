import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const CustomTable = ({ data, columns, actions, onRowClick }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "#121212", // Dark Binance-style background
        color: "#EAECEF", // Light text
        boxShadow: "0px 4px 10px rgba(40, 167, 69, 0.2)", // Green glow
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
                sx={{ color: "#28a745", fontWeight: "bold" }} // Green for headers
              >
                {col.label}
              </TableCell>
            ))}
            {actions && (
              <TableCell align="right" sx={{ color: "#28a745", fontWeight: "bold" }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{
                "&:hover": { backgroundColor: "#222" },
                transition: "background 0.2s",
                cursor: onRowClick ? "pointer" : "default",
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when action button is clicked
                        action.onClick(row);
                      }}
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
