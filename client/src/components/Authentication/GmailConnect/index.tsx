"use client";

import * as React from "react";
import {
	Box,
	Typography,
	Paper,
	Avatar,
	Fade,
	CircularProgress,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GmailConnect: React.FC = () => {
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				background: "linear-gradient(155deg, #5ba4eead 0%, #f4b4a978 100%)",
				padding: "20px",
			}}
		>
			<Fade in={true} timeout={800}>
				<Paper
					elevation={6}
					sx={{
						maxWidth: "550px",
						width: "100%",
						borderRadius: "24px",
						overflow: "hidden",
						boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
						transition: "transform 0.3s ease-in-out",
						"&:hover": {
							transform: "translateY(-5px)",
						},
					}}
				>
					<Box
						sx={{
							padding: "35px 25px",
							textAlign: "center",
							position: "relative",
							overflow: "hidden",
							borderBottom: "1px solid #e0e0e0",
						}}
						className="info-card-header"
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Avatar
								sx={{
									width: 70,
									height: 70,
									bgcolor: "transparent",
									mb: 1,
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="52 42 88 66"
									width="50"
									height="50"
								>
									<path
										fill="#4285f4"
										d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"
									/>
									<path
										fill="#34a853"
										d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"
									/>
									<path
										fill="#fbbc04"
										d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"
									/>
									<path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
									<path
										fill="#c5221f"
										d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"
									/>
								</svg>
							</Avatar>
						</Box>
						<Typography
							variant="h4"
							sx={{
								color: "#202124",
								fontWeight: "700",
								marginBottom: "12px",
								position: "relative",
								zIndex: 1,
							}}
						>
							{loading ? "Connecting..." : "Connected!"}
						</Typography>
						<Typography
							sx={{
								color: "#5f6368",
								fontSize: "17px",
								position: "relative",
								zIndex: 1,
							}}
						>
							{loading
								? "Linking your Gmail account"
								: "Your Gmail account has been successfully linked"}
						</Typography>
					</Box>

					<Box
						sx={{
							padding: "45px 35px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
						}}
						className="info-card-content"
					>
						{loading ? (
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									mb: 3,
								}}
							>
								<CircularProgress
									size={90}
									thickness={3}
									sx={{ color: "#4285F4", mb: 3 }}
								/>
								<Typography sx={{ color: "#5f6368", fontSize: "16px" }}>
									Please wait while we connect your account...
								</Typography>
							</Box>
						) : (
							<>
								<Box
									sx={{
										width: 110,
										height: 110,
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										backgroundColor: "rgba(66, 133, 244, 0.08)",
										borderRadius: "50%",
										marginBottom: "30px",
										boxShadow: "0 8px 20px rgba(66, 133, 244, 0.12)",
										animation: "pulse 2s infinite",
										"@keyframes pulse": {
											"0%": { boxShadow: "0 0 0 0 rgba(66, 133, 244, 0.4)" },
											"70%": { boxShadow: "0 0 0 15px rgba(66, 133, 244, 0)" },
											"100%": { boxShadow: "0 0 0 0 rgba(66, 133, 244, 0)" },
										},
									}}
								>
									<CheckCircleIcon sx={{ fontSize: 65, color: "#4285F4" }} />
								</Box>

								<Typography
									sx={{
										fontWeight: "600",
										fontSize: "22px",
										marginBottom: "15px",
										color: "#202124",
									}}
								>
									🎉 Connection Successful!
								</Typography>

								<Typography
									sx={{
										color: "#5f6368",
										fontSize: "16px",
										marginBottom: "35px",
										maxWidth: "400px",
										lineHeight: 1.6,
									}}
								>
									Your Gmail account has been securely linked to your profile.
									You can now close this window and continue with your setup.
								</Typography>
							</>
						)}
					</Box>
				</Paper>
			</Fade>
		</Box>
	);
};

export default GmailConnect;
