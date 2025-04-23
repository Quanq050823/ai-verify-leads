import React from "react";
import {
	Box,
	Typography,
	Container,
	Breadcrumbs,
	Link,
	Paper,
} from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import PageWebhookList from "@/components/facebook/PageWebhookList";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";

const FacebookWebhookManager: React.FC = () => {
	return (
		<DefaultLayout>
			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				{/* Breadcrumbs Navigation */}
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize="small" />}
					aria-label="breadcrumb"
					sx={{ mb: 3 }}
				>
					<Link color="inherit" href="/dashboard">
						Dashboard
					</Link>
					<Link color="inherit" href="/facebook">
						Facebook
					</Link>
					<Typography color="text.primary">Webhook Manager</Typography>
				</Breadcrumbs>

				{/* Page Header */}
				<Paper sx={{ p: 3, mb: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						Facebook Webhook Management
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Manage webhook subscriptions for your Facebook pages. When
						subscribed, your application will receive lead data in real-time
						when new leads are generated from Facebook Lead Ads.
					</Typography>
				</Paper>

				{/* Page Content */}
				<Box>
					<PageWebhookList />
				</Box>
			</Container>
		</DefaultLayout>
	);
};

export default FacebookWebhookManager;
