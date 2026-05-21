"use client";

import { Building2, FolderKanban, Loader2, User, Users, type LucideIcon } from "lucide-react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useEffectEvent,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motionDurationSeconds, motionEasing } from "@/lib/animation-system";
import { cn } from "@/lib/utils";
import {
	AnimatePresence,
	domAnimation,
	LazyMotion,
	m,
} from "@/shared/ui/motion";
import { ScrollArea } from "@/shared/ui/scroll-area";

export type MentionType = "client" | "project" | "team" | "user";

export interface MentionItem {
	id: string;
	name: string;
	type: MentionType;
	subtitle?: string;
}

export type MentionDropdownHandle = {
	handleKeyDown: (event: ReactKeyboardEvent) => boolean;
};

interface MentionDropdownProps {
	listboxId?: string;
	isOpen: boolean;
	onClose: () => void;
	onSelect: (item: MentionItem) => void;
	searchQuery: string;
	position?: { top: number; left: number };
	clients?: Array<{ id: string; name: string; company?: string }>;
	projects?: Array<{ id: string; name: string; status?: string }>;
	teams?: Array<{ id: string; name: string; memberCount?: number }>;
	users?: Array<{ id: string; name: string; email?: string; role?: string }>;
	isLoading?: boolean;
}

const EMPTY_CLIENTS: NonNullable<MentionDropdownProps["clients"]> = [];
const EMPTY_PROJECTS: NonNullable<MentionDropdownProps["projects"]> = [];
const EMPTY_TEAMS: NonNullable<MentionDropdownProps["teams"]> = [];
const EMPTY_USERS: NonNullable<MentionDropdownProps["users"]> = [];

const MENTION_CATEGORIES = [
	{ type: "client" as MentionType, label: "Clients", icon: Building2 },
	{ type: "project" as MentionType, label: "Projects", icon: FolderKanban },
	{ type: "team" as MentionType, label: "Teams", icon: Users },
	{ type: "user" as MentionType, label: "Users", icon: User },
];

const DROPDOWN_INITIAL = { opacity: 0, y: 8 } as const;
const DROPDOWN_ANIMATE = { opacity: 1, y: 0 } as const;
const DROPDOWN_EXIT = { opacity: 0, y: 8 } as const;
const DROPDOWN_TRANSITION = {
	duration: motionDurationSeconds.fast,
	ease: motionEasing.out,
} as const;

function getTypeIcon(type: MentionType) {
	switch (type) {
		case "client":
			return <Building2 className="h-3.5 w-3.5 text-info" />;
		case "project":
			return <FolderKanban className="h-3.5 w-3.5 text-success" />;
		case "team":
			return <Users className="h-3.5 w-3.5 text-warning" />;
		case "user":
			return <User className="h-3.5 w-3.5 text-primary" />;
	}
}

function getTypeColor(type: MentionType): string {
	switch (type) {
		case "client":
			return "bg-info/10 text-info border-info/20";
		case "project":
			return "bg-success/10 text-success border-success/20";
		case "team":
			return "bg-warning/10 text-warning border-warning/20";
		case "user":
			return "bg-accent/10 text-primary border-accent/20";
	}
}

function MentionCategoryButton({
	activeCategory,
	type,
	icon: Icon,
	label,
	onSelect,
}: {
	activeCategory: MentionType | null
	type: MentionType
	icon: LucideIcon
	label: string
	onSelect: (type: MentionType | null) => void
}) {
	const handleClick = useCallback(() => {
		onSelect(type)
	}, [onSelect, type])

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
				activeCategory === type
					? "bg-primary text-primary-foreground"
					: "text-muted-foreground hover:bg-muted",
			)}
		>
			<Icon className="h-3 w-3" />
			{label}
		</button>
	)
}

function MentionResultButton({
	clampedSelectedIndex,
	index,
	item,
	onSelect,
	showAmbiguousSubtitle,
}: {
	clampedSelectedIndex: number
	index: number
	item: MentionItem
	onSelect: (item: MentionItem) => void
	showAmbiguousSubtitle: boolean
}) {
	const handleClick = useCallback(() => {
		onSelect(item)
	}, [item, onSelect])

	return (
		<button
			type="button"
			id={`agent-mention-option-${item.type}-${item.id}`}
			role="option"
			aria-selected={index === clampedSelectedIndex}
			onClick={handleClick}
			className={cn(
				"flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
				index === clampedSelectedIndex ? "bg-accent/10" : "hover:bg-muted",
			)}
		>
			<div
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-md border",
					getTypeColor(item.type),
				)}
			>
				{getTypeIcon(item.type)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{item.name}</p>
				{item.subtitle ? (
					<p
						className={cn(
							'truncate text-xs',
							showAmbiguousSubtitle
								? 'font-medium text-foreground'
								: 'text-muted-foreground',
						)}
					>
						{item.subtitle}
					</p>
				) : null}
			</div>
			<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
				{item.type}
			</span>
		</button>
	)
}

export const MentionDropdown = forwardRef<MentionDropdownHandle, MentionDropdownProps>(function MentionDropdown(
	{
		listboxId = "agent-mention-listbox",
		isOpen,
		onClose,
		onSelect,
		searchQuery,
		clients = EMPTY_CLIENTS,
		projects = EMPTY_PROJECTS,
		teams = EMPTY_TEAMS,
		users = EMPTY_USERS,
		isLoading = false,
	},
	ref,
) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [activeCategory, setActiveCategory] = useState<MentionType | null>(
		null,
	);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Build filtered items list
	const filteredItems = useMemo(() => {
		const query = searchQuery.toLowerCase();
		const items: MentionItem[] = [];

		// Filter and add clients
		clients
			.filter((c) => c.name.toLowerCase().includes(query))
			.forEach((c) => {
				items.push({
					id: c.id,
					name: c.name,
					type: "client",
					subtitle: c.company,
				});
			});

		// Filter and add projects
		projects
			.filter((p) => p.name.toLowerCase().includes(query))
			.forEach((p) => {
				items.push({
					id: p.id,
					name: p.name,
					type: "project",
					subtitle: p.status,
				});
			});

		// Filter and add teams
		teams
			.filter((t) => t.name.toLowerCase().includes(query))
			.forEach((t) => {
				items.push({
					id: t.id,
					name: t.name,
					type: "team",
					subtitle: t.memberCount ? `${t.memberCount} members` : undefined,
				});
			});

		// Filter and add users
		users
			.filter(
				(u) =>
					u.name.toLowerCase().includes(query) ||
					u.email?.toLowerCase().includes(query),
			)
			.forEach((u) => {
				items.push({
					id: u.id,
					name: u.name,
					type: "user",
					subtitle: u.role || u.email,
				});
			});

		// If active category, filter further
		if (activeCategory) {
			return items.filter((item) => item.type === activeCategory);
		}

		return items;
	}, [searchQuery, clients, projects, teams, users, activeCategory]);

	const clampedSelectedIndex = Math.min(
		selectedIndex,
		Math.max(filteredItems.length - 1, 0),
	);

	const duplicateNameKeys = useMemo(() => {
		const counts = new Map<string, number>();
		for (const item of filteredItems) {
			const key = item.name.trim().toLowerCase();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		return new Set(
			[...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name),
		);
	}, [filteredItems]);
	const closeDropdown = useEffectEvent(() => {
		onClose();
	});
	const selectMention = useEffectEvent((item: MentionItem) => {
		onSelect(item);
	});
	const handleAllCategoryClick = useCallback(() => {
		setActiveCategory(null);
	}, []);

	const handleListKeyDown = useEffectEvent((e: ReactKeyboardEvent): boolean => {
		if (!isOpen) return false;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
				return true;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
				return true;
			case "Enter": {
				e.preventDefault();
				const selectedItem = filteredItems[clampedSelectedIndex];
				if (selectedItem) {
					selectMention(selectedItem);
				}
				return true;
			}
			case "Escape": {
				e.preventDefault();
				closeDropdown();
				return true;
			}
			case "Tab": {
				e.preventDefault();
				const categoryOrder: (MentionType | null)[] = [null, "client", "project", "team", "user"];
				const currentIdx = categoryOrder.indexOf(activeCategory);
				const nextCategory = categoryOrder[(currentIdx + 1) % categoryOrder.length];
				setActiveCategory(nextCategory ?? null);
				return true;
			}
			default:
				return false;
		}
	});

	useImperativeHandle(ref, () => ({ handleKeyDown: handleListKeyDown }), []);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				closeDropdown();
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<LazyMotion features={domAnimation}>
			<AnimatePresence>
				<m.div
					ref={dropdownRef}
					id={listboxId}
					role="listbox"
					aria-label="Mention suggestions"
					aria-activedescendant={
						filteredItems[clampedSelectedIndex]
							? `agent-mention-option-${filteredItems[clampedSelectedIndex].type}-${filteredItems[clampedSelectedIndex].id}`
							: undefined
					}
					initial={DROPDOWN_INITIAL}
					animate={DROPDOWN_ANIMATE}
					exit={DROPDOWN_EXIT}
					transition={DROPDOWN_TRANSITION}
					className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-md"
				>
					{/* Category tabs */}
					<div className="flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
						<button
							type="button"
							onClick={handleAllCategoryClick}
							className={cn(
								"rounded-md px-2 py-1 text-xs font-medium transition-colors",
								activeCategory === null
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted",
							)}
						>
							All
						</button>
						{MENTION_CATEGORIES.map((cat) => (
							<MentionCategoryButton
								key={cat.type}
								activeCategory={activeCategory}
								icon={cat.icon}
								label={cat.label}
								onSelect={setActiveCategory}
								type={cat.type}
							/>
						))}
					</div>

					{/* Items list */}
					<ScrollArea className="max-h-[280px] overflow-y-auto">
						{isLoading ? (
							<div className="flex items-center justify-center py-6">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						) : filteredItems.length === 0 ? (
							<div className="py-6 text-center text-sm text-muted-foreground">
								No results found for &quot;{searchQuery}&quot;
							</div>
						) : (
							<div className="p-1">
								{filteredItems.map((item, index) => (
										<MentionResultButton
											key={`${item.type}-${item.id}`}
											clampedSelectedIndex={clampedSelectedIndex}
											index={index}
											item={item}
											onSelect={onSelect}
											showAmbiguousSubtitle={duplicateNameKeys.has(item.name.trim().toLowerCase())}
										/>
								))}
							</div>
						)}
					</ScrollArea>

					{/* Help text */}
					<div className="border-t bg-muted/20 px-3 py-1.5">
						<p className="text-[10px] text-muted-foreground">
							<kbd className="rounded bg-muted px-1 py-0.5 text-[9px]">↑↓</kbd>{" "}
							Navigate{" "}
							<kbd className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]">
								Enter
							</kbd>{" "}
							Select{" "}
							<kbd className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]">
								Tab
							</kbd>{" "}
							Categories{" "}
							<kbd className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]">
								Esc
							</kbd>{" "}
							Close
						</p>
					</div>
				</m.div>
			</AnimatePresence>
		</LazyMotion>
	);
});

// Styled mention pill component for display in messages
export function MentionPill({ item }: { item: MentionItem }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
				getTypeColor(item.type),
			)}
		>
			{getTypeIcon(item.type)}@{item.name}
		</span>
	);
}

// Format mention with structured identity for server-side resolution
export function formatMention(item: MentionItem): string {
	return `@[${item.name}](${item.type}:${item.id})`;
}

// Parse mentions from text
export function parseMentions(text: string): {
	cleanText: string;
	mentions: MentionItem[];
} {
	const mentionRegex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g;
	const mentions: MentionItem[] = [];
	let cleanText = text;

	let match: RegExpExecArray | null = mentionRegex.exec(text);
	while (match !== null) {
		const name = match[1];
		const type = match[2];
		const id = match[3];
		if (name && type && id) {
			mentions.push({
				name,
				type: type as MentionType,
				id,
			});
			cleanText = cleanText.replace(match[0], `@${name}`);
		}

		match = mentionRegex.exec(text);
	}

	return { cleanText, mentions };
}
