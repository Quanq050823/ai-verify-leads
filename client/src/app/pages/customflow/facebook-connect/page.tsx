import * as React from "react";
import { Box } from "@mui/material";

import FacebookConnect from "@/components/Authentication/FacebookConnect";

export default function Page() {
	return (
		<>
			<Box className="auth-main-wrapper">
				<FacebookConnect />
			</Box>
		</>
	);
}
