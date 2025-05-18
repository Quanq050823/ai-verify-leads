"use client";

import * as React from "react";
import {
	Button,
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

const FacebookConnect: React.FC = () => {
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
				background: "linear-gradient(176deg, rgb(62 133 206) 0%, #e5f1ff 100%)",
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
									viewBox="0 0 48 48"
									width="80"
									height="80"
								>
									<linearGradient
										id="Ld6sqrtcxMyckEl6xeDdMa"
										x1="9.993"
										x2="40.615"
										y1="9.993"
										y2="40.615"
										gradientUnits="userSpaceOnUse"
									>
										<stop offset="0" stopColor="#2aa4f4" />
										<stop offset="1" stopColor="#007ad9" />
									</linearGradient>
									<path
										fill="url(#Ld6sqrtcxMyckEl6xeDdMa)"
										d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"
									/>
									<path
										fill="#fff"
										d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"
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
								? "Linking your Facebook account"
								: "Your Facebook account has been successfully linked"}
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
									sx={{ color: "#1877F2", mb: 3 }}
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
										backgroundColor: "rgba(24, 119, 242, 0.08)",
										borderRadius: "50%",
										marginBottom: "30px",
										boxShadow: "0 8px 20px rgba(24, 119, 242, 0.12)",
										animation: "pulse 2s infinite",
										"@keyframes pulse": {
											"0%": { boxShadow: "0 0 0 0 rgba(24, 119, 242, 0.4)" },
											"70%": { boxShadow: "0 0 0 15px rgba(24, 119, 242, 0)" },
											"100%": { boxShadow: "0 0 0 0 rgba(24, 119, 242, 0)" },
										},
									}}
								>
									<CheckCircleIcon sx={{ fontSize: 65, color: "#1877F2" }} />
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
									Your Facebook account has been securely linked to your
									profile. You can now close this window and continue with your
									setup.
								</Typography>
							</>
						)}
					</Box>
				</Paper>
			</Fade>
		</Box>
	);
};

export default FacebookConnect;
