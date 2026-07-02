"use client";
import { Building2, FolderKanban, Loader2, User, Users, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type Ref, } from "react";
import { motionDurationSeconds, motionEasing } from "@/lib/animation-system";
import { cn } from "@/lib/utils";
import { AnimatePresence, domAnimation, LazyMotion, m, } from "@/shared/ui/motion";
import { ScrollArea } from "@/shared/ui/scroll-area";
import type { MentionDropdownHandle, MentionDropdownProps, MentionItem, MentionType, } from './mention-dropdown-types';
export type { MentionDropdownHandle, MentionItem, MentionType } from './mention-dropdown-types';
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
            return <Building2 className="size-3.5 text-info"/>;
        case "project":
            return <FolderKanban className="size-3.5 text-success"/>;
        case "team":
            return <Users className="size-3.5 text-warning"/>;
        case "user":
            return <User className="size-3.5 text-primary"/>;
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
function MentionCategoryButton({ activeCategory, type, icon: Icon, label, onSelect, }: {
    activeCategory: MentionType | null;
    type: MentionType;
    icon: LucideIcon;
    label: string;
    onSelect: (type: MentionType | null) => void;
}) {
    const onSelectMentionCategory = () => {
        onSelect(type);
    };
    return (<button type="button" onClick={onSelectMentionCategory} className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors", activeCategory === type
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
			<Icon className="size-3"/>
			{label}
		</button>);
}
function MentionResultButton({ clampedSelectedIndex, index, item, onSelect, showAmbiguousSubtitle, }: {
    clampedSelectedIndex: number;
    index: number;
    item: MentionItem;
    onSelect: (item: MentionItem) => void;
    showAmbiguousSubtitle: boolean;
}) {
    const onSelectMentionItem = () => {
        onSelect(item);
    };
    return (<button type="button" id={`agent-mention-option-${item.type}-${item.id}`} role="option" aria-selected={index === clampedSelectedIndex} onClick={onSelectMentionItem} className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors", index === clampedSelectedIndex
            ? "bg-muted text-foreground"
            : "hover:bg-muted hover:text-foreground")}>
			<div className={cn("flex size-7 items-center justify-center rounded-md border", getTypeColor(item.type))}>
				{getTypeIcon(item.type)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{item.name}</p>
				{item.subtitle ? (<p className={cn('truncate text-xs', showAmbiguousSubtitle
                ? 'font-medium text-foreground'
                : 'text-muted-foreground')}>
						{item.subtitle}
					</p>) : null}
			</div>
			<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
				{item.type}
			</span>
		</button>);
}
export function MentionDropdown({ ref, listboxId = "agent-mention-listbox", isOpen, onClose, onSelect, searchQuery, clients = EMPTY_CLIENTS, projects = EMPTY_PROJECTS, teams = EMPTY_TEAMS, users = EMPTY_USERS, isLoading = false, }: MentionDropdownProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState<MentionType | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Build filtered items list
    const filteredItems = (() => {
        const query = searchQuery.toLowerCase();
        const items: MentionItem[] = [];
        for (const c of clients) {
            if (!c.name.toLowerCase().includes(query))
                continue;
            items.push({
                id: c.id,
                name: c.name,
                type: "client",
                subtitle: c.company,
            });
        }
        for (const p of projects) {
            if (!p.name.toLowerCase().includes(query))
                continue;
            items.push({
                id: p.id,
                name: p.name,
                type: "project",
                subtitle: p.status,
            });
        }
        for (const t of teams) {
            if (!t.name.toLowerCase().includes(query))
                continue;
            items.push({
                id: t.id,
                name: t.name,
                type: "team",
                subtitle: t.memberCount ? `${t.memberCount} members` : undefined,
            });
        }
        for (const u of users) {
            if (!u.name.toLowerCase().includes(query) &&
                !u.email?.toLowerCase().includes(query)) {
                continue;
            }
            items.push({
                id: u.id,
                name: u.name,
                type: "user",
                subtitle: u.role || u.email,
            });
        }
        // If active category, filter further
        if (activeCategory) {
            return items.filter((item) => item.type === activeCategory);
        }
        return items;
    })();
    const clampedSelectedIndex = Math.min(selectedIndex, Math.max(filteredItems.length - 1, 0));
    const allItemsCount = clients.length + projects.length + teams.length + users.length;
    const duplicateNameKeys = (() => {
        const counts = new Map<string, number>();
        for (const item of filteredItems) {
            const key = item.name.trim().toLowerCase();
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return new Set([...counts.entries()].flatMap(([name, count]) => (count > 1 ? [name] : [])));
    })();
    const onCloseRef = useRef(onClose);
    const onSelectRef = useRef(onSelect);
    useEffect(() => {
        onCloseRef.current = onClose;
        onSelectRef.current = onSelect;
    }, [onClose, onSelect]);
    const handleAllCategoryClick = () => {
        setActiveCategory(null);
    };
    const handleListKeyDown = (e: ReactKeyboardEvent): boolean => {
        if (!isOpen)
            return false;
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
                    onSelectRef.current(selectedItem);
                }
                return true;
            }
            case "Escape": {
                e.preventDefault();
                onCloseRef.current();
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
    };
    const handleListKeyDownRef = useRef(handleListKeyDown);
    useEffect(() => {
        handleListKeyDownRef.current = handleListKeyDown;
    }, [handleListKeyDown]);
    useImperativeHandle(ref, () => ({
        handleKeyDown: (event) => handleListKeyDownRef.current(event),
    }), []);
    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)) {
                onCloseRef.current();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (<LazyMotion features={domAnimation}>
			<AnimatePresence>
				<m.div ref={dropdownRef} id={listboxId} role="listbox" aria-label="Mention suggestions" aria-activedescendant={filteredItems[clampedSelectedIndex]
            ? `agent-mention-option-${filteredItems[clampedSelectedIndex].type}-${filteredItems[clampedSelectedIndex].id}`
            : undefined} initial={DROPDOWN_INITIAL} animate={DROPDOWN_ANIMATE} exit={DROPDOWN_EXIT} transition={DROPDOWN_TRANSITION} className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-md">
					{/* Category tabs */}
					<div className="flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
						<button type="button" onClick={handleAllCategoryClick} className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors", activeCategory === null
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
							All
						</button>
						{MENTION_CATEGORIES.map((cat) => (<MentionCategoryButton key={cat.type} activeCategory={activeCategory} icon={cat.icon} label={cat.label} onSelect={setActiveCategory} type={cat.type}/>))}
					</div>

					{/* Items list */}
					<ScrollArea className="max-h-[280px] overflow-y-auto">
						{isLoading ? (<div className="flex items-center justify-center py-6">
								<Loader2 className="size-5 animate-spin text-muted-foreground"/>
							</div>) : filteredItems.length === 0 ? (<div className="py-6 text-center text-sm text-muted-foreground">
								{searchQuery.trim()
                  ? `No results found for "${searchQuery}"`
                  : allItemsCount === 0
                    ? 'No clients, projects, or team members available to mention yet.'
                    : 'Start typing to search clients, projects, teams, or users.'}
							</div>) : (<div className="p-1">
								{filteredItems.map((item, index) => (<MentionResultButton key={`${item.type}-${item.id}`} clampedSelectedIndex={clampedSelectedIndex} index={index} item={item} onSelect={onSelect} showAmbiguousSubtitle={duplicateNameKeys.has(item.name.trim().toLowerCase())}/>))}
							</div>)}
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
		</LazyMotion>);
}
// Styled mention pill component for display in messages
export function MentionPill({ item }: {
    item: MentionItem;
}) {
    return (<span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium", getTypeColor(item.type))}>
			{getTypeIcon(item.type)}@{item.name}
		</span>);
}
