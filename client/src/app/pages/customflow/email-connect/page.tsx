import * as React from "react";
import { Box } from "@mui/material";

import GmailConnect from "@/components/Authentication/GmailConnect";

export default function Page() {
	return (
		<>
			<Box className="auth-main-wrapper">
				<GmailConnect />
			</Box>
		</>
	);
}
