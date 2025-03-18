"use client";
import * as React from "react";
import FlowEditor from "@/components/flow/FlowEditor";

export default function Page() {
	return (
		<>
			<div className="fp-wrapper w-full h-screen overflow-hidden">
				<FlowEditor />
			</div>
		</>
	);
}
