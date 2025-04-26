import React, { ReactNode } from "react";
import { Box, AppBar, Toolbar, Typography, Container } from "@mui/material";

interface DefaultLayoutProps {
	children: ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Facebook Lead Ads Manager
					</Typography>
				</Toolbar>
			</AppBar>

			<Box component="main" sx={{ flexGrow: 1 }}>
				{children}
			</Box>

			<Box
				component="footer"
				sx={{ py: 3, bgcolor: "background.paper", mt: "auto" }}
			>
				<Container maxWidth="lg">
					<Typography variant="body2" color="text.secondary" align="center">
						© {new Date().getFullYear()} Facebook Lead Ads Manager
					</Typography>
				</Container>
			</Box>
		</Box>
	);
};
