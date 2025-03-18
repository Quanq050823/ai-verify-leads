import * as React from "react";
import Grid from "@mui/material/Grid";
import Overview from "@/components/Dashboard/CallCenter/Overview";
import InboundCalls from "@/components/Dashboard/CallCenter/InboundCalls";
import OutboundCalls from "@/components/Dashboard/CallCenter/OutboundCalls";
import AgentsPerformanceOverview from "@/components/Dashboard/CallCenter/AgentsPerformanceOverview";
import CallCenterGeography from "@/components/Dashboard/CallCenter/CallCenterGeography";
import AgentAvgEarnings from "@/components/Dashboard/CallCenter/AgentAvgEarnings";
import RecentCalls from "@/components/Dashboard/CallCenter/RecentCalls";

export default function Page() {
	return (
		<>
			<Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
				<Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
					<Overview />
				</Grid>
			</Grid>

			<Grid container columnSpacing={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
				<Grid item xs={12} sm={12} md={7} lg={7} xl={12}>
					<RecentCalls />
				</Grid>
			</Grid>
		</>
	);
}
