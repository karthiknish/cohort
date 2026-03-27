"use client";

import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";

import { interactiveTransitionClass } from "@/lib/animation-system";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export interface MetricCardData {
	label: string;
	value: string | number;
	change?: number;
	changeType?: "increase" | "decrease" | "neutral";
	icon?: React.ReactNode;
	trend?: number;
	prefix?: string;
	suffix?: string;
	onClick?: () => void;
	drillDownKey?: string;
}

interface InteractiveMetricCardsProps {
	metrics: MetricCardData[];
	isLoading?: boolean;
	onDrillDown?: (key: string, label: string) => void;
	drilledDownKey?: string | null;
	onReset?: () => void;
	className?: string;
}

interface InteractiveMetricCardProps {
	metric: MetricCardData;
	onDrillDown?: (key: string, label: string) => void;
	hoveredKey: string | null;
	setHoveredKey: (value: string | null) => void;
}

function InteractiveMetricCard({
	metric,
	onDrillDown,
	hoveredKey,
	setHoveredKey,
}: InteractiveMetricCardProps) {
	const isClickable = metric.onClick || (onDrillDown && metric.drillDownKey);
	const isHovered = hoveredKey === metric.drillDownKey;

	const handleClick = useCallback(() => {
		if (metric.onClick) {
			metric.onClick();
		} else if (onDrillDown && metric.drillDownKey) {
			onDrillDown(metric.drillDownKey, metric.label);
		}
	}, [metric, onDrillDown]);

	const handleMouseEnter = useCallback(() => {
		if (metric.drillDownKey) {
			setHoveredKey(metric.drillDownKey);
		}
	}, [metric.drillDownKey, setHoveredKey]);

	const handleMouseLeave = useCallback(() => {
		setHoveredKey(null);
	}, [setHoveredKey]);

	return (
		<Card
			className={cn(
				"group",
				interactiveTransitionClass,
				isClickable &&
					"cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
				isHovered && "ring-2 ring-primary/20",
			)}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						{metric.icon && (
							<div className="mb-2 text-muted-foreground">
								{metric.icon}
							</div>
						)}
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							{metric.label}
						</p>
						<p className="text-2xl font-bold tabular-nums mt-1">
							{metric.prefix}
							{metric.value}
							{metric.suffix}
						</p>
					</div>

					{metric.change !== undefined && (
						<div
							className={cn(
								"flex items-center gap-0.5 text-xs font-medium",
								metric.changeType === "increase" && "text-primary",
								metric.changeType === "decrease" && "text-destructive",
								metric.changeType === "neutral" &&
									"text-muted-foreground",
							)}
						>
							{metric.changeType === "increase" && (
								<TrendingUp className="h-3 w-3" />
							)}
							{metric.changeType === "decrease" && (
								<TrendingDown className="h-3 w-3" />
							)}
							{metric.changeType === "neutral" && (
								<Minus className="h-3 w-3" />
							)}
							<span className="tabular-nums">
								{Math.abs(metric.change)}%
							</span>
						</div>
					)}
				</div>

				{isClickable && (
					<div className="mt-2 flex items-center text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100">
						Click to {onDrillDown ? "drill down" : "view details"}
						<ChevronRight className="ml-0.5 h-3 w-3" />
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export function InteractiveMetricCards({
	metrics,
	isLoading = false,
	onDrillDown,
	drilledDownKey,
	onReset,
	className,
}: InteractiveMetricCardsProps) {
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);

	if (isLoading) {
		const skeletonCards = ["overview", "activity", "performance", "trend"];

		return (
			<div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}>
				{skeletonCards.map((card) => (
					<Skeleton key={card} className="h-28 w-full" />
				))}
			</div>
		);
	}

	if (drilledDownKey && onReset) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<Button variant="outline" size="sm" onClick={onReset} className="gap-1">
					<ChevronRight className="h-3 w-3 rotate-180" />
					Back to overview
				</Button>
				<span className="text-sm font-medium text-muted-foreground">
					Filtering by: <strong>{drilledDownKey}</strong>
				</span>
			</div>
		);
	}

	return (
		<div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}>
			{metrics.map((metric) => {
				return (
					<InteractiveMetricCard
						key={metric.label}
						metric={metric}
						onDrillDown={onDrillDown}
						hoveredKey={hoveredKey}
						setHoveredKey={setHoveredKey}
					/>
				);
			})}
		</div>
	);
}
