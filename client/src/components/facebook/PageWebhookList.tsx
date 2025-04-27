import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Paper,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Divider,
	Button,
	CircularProgress,
	Alert,
	IconButton,
	Collapse,
	Tab,
	Tabs,
} from "@mui/material";
import {
	ExpandMore,
	ExpandLess,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
	useFacebookConnections,
	useFacebookPages,
} from "@/services/facebookServices";
import WebhookManager from "./WebhookManager";

interface PageWebhookListProps {
	title?: string;
}

const PageWebhookList: React.FC<PageWebhookListProps> = ({
	title = "Facebook Page Webhook Management",
}) => {
	const {
		connections,
		loading: loadingConnections,
		error: connectionsError,
	} = useFacebookConnections();
	const [selectedConnection, setSelectedConnection] = useState<string | null>(
		null
	);
	const [expandedPage, setExpandedPage] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

	const {
		pages,
		loading: loadingPages,
		error: pagesError,
	} = useFacebookPages(selectedConnection);

	// Auto-select the first connection when loaded
	useEffect(() => {
		if (connections.length > 0 && !selectedConnection) {
			setSelectedConnection(connections[0].profile.id);
		}
	}, [connections, selectedConnection]);

	const handleRefresh = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
		setSelectedConnection(newValue);
		setExpandedPage(null);
	};

	const handleTogglePage = (pageId: string) => {
		setExpandedPage(expandedPage === pageId ? null : pageId);
	};

	return (
		<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography variant="h5" component="h2">
					{title}
				</Typography>

				<Button
					startIcon={<RefreshIcon />}
					onClick={handleRefresh}
					disabled={loadingConnections || loadingPages}
				>
					Refresh
				</Button>
			</Box>

			{(connectionsError || pagesError) && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{connectionsError || pagesError}
				</Alert>
			)}

			{loadingConnections ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : connections.length === 0 ? (
				<Alert severity="info">
					No Facebook connections found. Please connect your Facebook account
					first.
				</Alert>
			) : (
				<>
					{/* Connection Tabs */}
					<Tabs
						value={selectedConnection || ""}
						onChange={handleTabChange}
						variant="scrollable"
						scrollButtons="auto"
						sx={{ mb: 3 }}
					>
						{connections.map((connection) => (
							<Tab
								key={connection.profile.id}
								value={connection.profile.id}
								label={connection.profile.name}
							/>
						))}
					</Tabs>

					{/* Pages List */}
					{loadingPages ? (
						<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
							<CircularProgress />
						</Box>
					) : pages.length === 0 ? (
						<Alert severity="info">
							No Facebook pages found for this connection.
						</Alert>
					) : (
						<List>
							{pages.map((page) => (
								<React.Fragment key={page.id}>
									<ListItem sx={{ cursor: "pointer" }}>
										<ListItemText
											primary={page.name}
											secondary={`Page ID: ${page.id}`}
											onClick={() => handleTogglePage(page.id)}
										/>
										<ListItemSecondaryAction>
											<IconButton
												edge="end"
												onClick={(e) => {
													e.stopPropagation();
													handleTogglePage(page.id);
												}}
											>
												{expandedPage === page.id ? (
													<ExpandLess />
												) : (
													<ExpandMore />
												)}
											</IconButton>
										</ListItemSecondaryAction>
									</ListItem>

									<Collapse
										in={expandedPage === page.id}
										timeout="auto"
										unmountOnExit
									>
										<Box sx={{ pl: 4, pr: 4, pb: 3 }}>
											<WebhookManager
												pageId={page.id}
												pageName={page.name}
												isSubscribed={page.subscribed || false}
												onUpdate={handleRefresh}
											/>
										</Box>
									</Collapse>

									<Divider component="li" />
								</React.Fragment>
							))}
						</List>
					)}
				</>
			)}
		</Paper>
	);
};

export default PageWebhookList;
