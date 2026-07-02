'use client';
import { Link } from '@/shared/ui/link';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import type { CSSProperties } from 'react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { chromaticTransitionClass, chromaticTransitionNormalClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { getPreviewSettingsProfile } from '@/lib/preview-data';
import { navItemsForRole } from '@/lib/access-control/dashboard-access';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { Settings, LogOut, Menu, ChevronLeft, ChevronRight, Shield, Rocket, AlertCircle, Keyboard, MoreHorizontal, } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ProfileDropdown } from '@/shared/layout/profile-dropdown';
import { useOnboardingTour } from '@/shared/hooks/use-onboarding-tour';
const DASHBOARD_SIDEBAR_TRANSITION_STYLE = { viewTransitionName: 'dashboard-sidebar' } satisfies CSSProperties;
const DASHBOARD_HEADER_TRANSITION_STYLE = { viewTransitionName: 'dashboard-header' } satisfies CSSProperties;
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/shared/ui/sheet';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { ClientWorkspaceSelector } from '@/shared/components/client-workspace-selector';
import { SiteLogo } from '@/shared/components/site-logo';
import { useDashboardRoleAccent } from '@/shared/hooks/use-dashboard-role-accent';
import { NotificationsDropdownDynamic } from '@/shared/components/notifications-dropdown-dynamic';
import { CommandMenuDynamic } from '@/shared/layout/navigation/command-menu-dynamic';
import { HelpModal, useHelpModal } from '@/shared/layout/navigation/help-modal';
import { KeyboardShortcutBadge, useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcuts';
import { ProblemReportModal } from '@/shared/layout/navigation/problem-report-modal';
import { notifyFailure } from '@/lib/notifications';
import { KeyboardShortcutsOverlay } from '@/shared/layout/navigation/keyboard-shortcuts-overlay';
import { getShortcutsForRole } from '@/shared/layout/navigation/keyboard-shortcuts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from '@/shared/ui/dropdown-menu';
type NavItem = {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
    roles?: ('admin' | 'team' | 'client')[]; // If undefined, available to all roles
};
type NavItemLinkProps = {
    item: NavItem;
    linkClasses: string;
    onNavigate?: () => void;
    prefetchRoute: (href: string) => void;
    collapsed: boolean;
    isActive?: boolean;
    ref?: React.Ref<HTMLAnchorElement | null>;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>;
function NavItemLink({ item, linkClasses, onNavigate, prefetchRoute, collapsed, isActive = false, ref, onClick, onMouseEnter, ...linkProps }: NavItemLinkProps) {
    const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);
        prefetchRoute(item.href);
    };
    const handlePointerDown = () => {
        prefetchRoute(item.href);
    };
    const onNavItemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
            onNavigate?.();
        }
    };
    return (<Link ref={ref} href={item.href} prefetch onClick={onNavItemClick} onMouseEnter={handleMouseEnter} onPointerDown={handlePointerDown} className={linkClasses} aria-label={collapsed ? item.name : undefined} aria-current={isActive ? 'page' : undefined} title={collapsed ? item.name : undefined} {...linkProps}>
      <item.icon className="size-4 shrink-0"/>
      {!collapsed && <span className="truncate">{item.name}</span>}
    </Link>);
}
function NavigationList({ onNavigate, collapsed = false }: {
    onNavigate?: () => void;
    collapsed?: boolean;
}) {
    const pathname = usePathname();
    const { prefetch } = useRouter();
    const { user } = useAuth();
    const prefetchedRef = useRef<Set<string>>(null!);
    if (prefetchedRef.current === null) prefetchedRef.current = new Set();
    const prefetchRoute = (href: string) => {
        if (!href)
            return;
        const target = href.split('?')[0];
        if (target && target !== pathname && !prefetchedRef.current.has(target)) {
            prefetchedRef.current.add(target);
            try {
                prefetch(href);
            }
            catch {
                // ignore prefetch failures
            }
        }
    };
    const prefetchAdmin = () => prefetchRoute('/admin');
    const prefetchSettings = () => prefetchRoute('/settings');
    // Persist last visited dashboard tab
    useEffect(() => {
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/for-you')) {
            localStorage.setItem('cohorts_last_tab', pathname);
        }
    }, [pathname]);
    const navigationGroups = navItemsForRole(user?.role ?? null);
    return (<TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <nav className="flex flex-1 flex-col gap-y-4">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 px-1">
            {navigationGroups.map((group) => (<div key={group.id} className="space-y-1">
                {!collapsed ? (<p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                    {group.label}
                  </p>) : null}
                {group.items.map((item) => {
                const isDashboardRoot = item.href === '/dashboard';
                const isActive = isDashboardRoot
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const linkClasses = cn('flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-all duration-200', collapsed ? 'justify-center px-0' : 'justify-start', isActive
                    ? 'bg-primary/[0.08] text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60');
                const navLink = (<NavItemLink key={item.name} item={item} linkClasses={linkClasses} onNavigate={onNavigate} prefetchRoute={prefetchRoute} collapsed={collapsed} isActive={isActive}/>);
                if (collapsed) {
                    return (<Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                          {navLink}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col gap-0.5">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </TooltipContent>
                      </Tooltip>);
                }
                return navLink;
            })}
              </div>))}
          </div>
        </ScrollArea>

        <div className="space-y-1 border-t border-border/40 pt-3 px-1">
          {/* Admin Panel Link - Only for admins */}
          {user?.role === 'admin' && (collapsed ? (<Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/admin" onClick={onNavigate} onMouseEnter={prefetchAdmin} className="flex h-9 w-full items-center justify-center gap-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/60">
                    <Shield className="size-4"/>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">Admin Panel</span>
                </TooltipContent>
              </Tooltip>) : (<Link href="/admin" onClick={onNavigate} onMouseEnter={prefetchAdmin} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/60">
                <Shield className="size-4"/>
                <span>Admin Panel</span>
              </Link>))}

          {collapsed ? (<Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings" onClick={onNavigate} onMouseEnter={prefetchSettings} className="flex h-9 w-full items-center justify-center gap-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/60">
                  <Settings className="size-4"/>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="font-medium">Settings</span>
              </TooltipContent>
            </Tooltip>) : (<Link href="/settings" onClick={onNavigate} onMouseEnter={prefetchSettings} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/60">
              <Settings className="size-4"/>
              <span>Settings</span>
            </Link>)}
        </div>
      </nav>
    </TooltipProvider>);
}
export function Sidebar() {
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return true;
        }
        try {
            const stored = localStorage.getItem('cohorts.sidebar.collapsed');
            if (stored === 'true')
                return true;
            if (stored === 'false')
                return false;
        }
        catch {
            // ignore storage failures
        }
        return true;
    });
    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('cohorts.sidebar.collapsed', String(next));
                }
            }
            catch {
                // ignore storage failures
            }
            return next;
        });
    };
    const accent = useDashboardRoleAccent();
    return (<aside id="tour-sidebar" className={cn('hidden min-h-0 h-full shrink-0 border-r border-border/60 bg-muted/20 backdrop-blur-sm lg:flex', chromaticTransitionNormalClass, collapsed ? 'w-16 flex-col items-center p-3' : 'w-64 flex-col p-4', accent.sidebarClass)} data-dashboard-role={accent.key} style={DASHBOARD_SIDEBAR_TRANSITION_STYLE}>
      <button type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={cn('mb-4 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground/70 hover:text-primary hover:bg-primary/[0.08]', chromaticTransitionClass, collapsed && 'mt-1')} onClick={toggleCollapsed}>
        {collapsed ? (<ChevronRight className="size-4 transition-transform"/>) : (<ChevronLeft className="size-4 transition-transform"/>)}
      </button>
      <div className={cn('min-h-0 flex-1', collapsed ? 'w-full' : '')}>
        <NavigationList collapsed={collapsed}/>
      </div>
    </aside>);
}
export function Header() {
    const { push } = useRouter();
    const { user, signOut } = useAuth();
    const { isPreviewMode } = usePreview();
    const accent = useDashboardRoleAccent();
    const [open, setOpen] = useState(false);
    const { open: helpOpen, onOpenChange: onHelpOpenChange, showWelcome, setShowWelcome } = useHelpModal();
    const { startTour } = useOnboardingTour();
    const [problemReportOpen, setProblemReportOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const previewProfile = getPreviewSettingsProfile();
    const displayedName = isPreviewMode ? previewProfile.name : (user?.name ?? 'Account');
    const displayedEmail = isPreviewMode ? previewProfile.email : (user?.email ?? 'user@example.com');
    const initialsSource = displayedName;
    const initials = initialsSource
        ? initialsSource
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : 'US';
    const handleNavigate = () => setOpen(false);
    const handleSignOut = () => {
        setOpen(false);
        void signOut().catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Sign out failed. You were signed out locally; try again or clear cookies if issues persist.';
            notifyFailure({
                title: 'Sign out incomplete',
                message,
                fallbackMessage: 'Sign out failed. You were signed out locally; try again or clear cookies if issues persist.',
            });
        });
    };
    const handleShowOnboarding = () => {
        void startTour({ ensureDashboard: true });
    };
    const handleOpenHelp = () => {
        setShortcutsOpen(false);
        setShowWelcome(false);
        void onHelpOpenChange(true);
    };
    const handleOpenShortcuts = () => {
        setShowWelcome(false);
        void onHelpOpenChange(false);
        setShortcutsOpen(true);
    };
    const handleOpenProblemReport = () => setProblemReportOpen(true);
    const roleLabel = (() => {
        switch (user?.role) {
            case 'admin': return 'Admin';
            case 'team': return 'Team';
            case 'client': return 'Client';
            default: return null;
        }
    })();
    const dashboardShortcuts = (() => {
        const shortcuts = getShortcutsForRole(user?.role, 'global');
        return shortcuts.reduce<Array<{
            combo: string;
            description: string;
            callback: () => void;
        }>>((accumulator, shortcut) => {
            switch (shortcut.combo) {
                case 'shift+?':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: handleOpenShortcuts });
                    break;
                case 'g d':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard') });
                    break;
                case 'g t':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard/tasks') });
                    break;
                case 'g m':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard/meetings') });
                    break;
                case 'g a':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard/ads') });
                    break;
                case 'g p':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard/proposals') });
                    break;
                case 'g s':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/settings') });
                    break;
                case 'n t':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard/tasks?action=create') });
                    break;
                case 'n p':
                    accumulator.push({ combo: shortcut.combo, description: shortcut.description, callback: () => push('/dashboard/proposals') });
                    break;
                default:
                    break;
            }
            return accumulator;
        }, []);
    })();
    useKeyboardShortcuts(dashboardShortcuts, {
        enabled: !helpOpen && !shortcutsOpen,
    });
    return (<>
      <header className="sticky top-0 z-1000 flex flex-col border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/60" data-dashboard-role={accent.key} style={DASHBOARD_HEADER_TRANSITION_STYLE}>
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:gap-3 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button id="tour-mobile-nav" variant="ghost" size="icon" className="shrink-0" aria-label="Open navigation menu">
                  <Menu className="size-5"/>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-70 p-0">
                <SheetHeader className="border-b px-4 py-3 text-left">
                  <SheetTitle className="text-base font-semibold">Workspace</SheetTitle>
                  <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{accent.shellCaption}</p>
                </SheetHeader>
                <div className="p-4">
                  <NavigationList onNavigate={handleNavigate}/>
                  <Button variant="ghost" className="mt-6 w-full justify-start gap-2 text-sm font-medium" onClick={handleSignOut}>
                    <LogOut className="size-4 shrink-0"/>
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo + workspace selector */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:flex-none sm:overflow-visible sm:gap-3">
            <SiteLogo size="wordmarkLg" href="/for-you" className="h-12 sm:h-14 lg:h-16"/>
            <ClientWorkspaceSelector className="min-w-0 w-[9rem] sm:w-auto"/>
          </div>

          {/* Search / Command menu (takes remaining space on desktop) */}
          <div className="hidden min-w-0 flex-1 basis-0 pl-2 sm:flex sm:max-w-md sm:pl-4">
            <CommandMenuDynamic onOpenHelp={handleOpenHelp} onOpenShortcuts={handleOpenShortcuts}/>
          </div>

          {/* Right side actions (pinned to the right) */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Mobile search button - only visible on small screens */}
            <div className="sm:hidden">
              <CommandMenuDynamic onOpenHelp={handleOpenHelp} onOpenShortcuts={handleOpenShortcuts}/>
            </div>

            {/* Mobile overflow menu - groups utility buttons on small screens */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 sm:hidden" aria-label="More actions">
                  <MoreHorizontal className="size-5"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleOpenShortcuts}>
                  <Keyboard className="size-4 mr-2"/>
                  <span>Keyboard shortcuts</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenProblemReport}>
                  <AlertCircle className="size-4 mr-2"/>
                  <span>Report a problem</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShowOnboarding}>
                  <Rocket className="size-4 mr-2"/>
                  <span>Onboarding tour</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleOpenShortcuts} className="hidden sm:inline-flex" aria-label="Show keyboard shortcuts">
                    <Keyboard className="size-4"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center gap-2">
                    <span>Keyboard shortcuts</span>
                    <KeyboardShortcutBadge combo="shift+?"/>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleOpenProblemReport} className="hidden sm:inline-flex" aria-label="Report a problem">
                    <AlertCircle className="size-4"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Report a problem</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button id="tour-help-trigger" variant="ghost" size="icon" onClick={handleShowOnboarding} className="hidden sm:inline-flex" aria-label="Show onboarding tour">
                    <Rocket className="size-4"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Onboarding</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>


            <NotificationsDropdownDynamic />

            <ProfileDropdown displayedName={displayedName} displayedEmail={displayedEmail} initials={initials} isPreviewMode={isPreviewMode} roleLabel={roleLabel} isAdmin={user?.role === 'admin'} onNavigate={handleNavigate} onOpenHelp={handleOpenHelp} onSignOut={handleSignOut}/>
          </div>
        </div>
        <div className={cn(accent.headerStripClass)} aria-hidden/>
      </header>

  <HelpModal open={helpOpen} onOpenChange={onHelpOpenChange} showWelcome={showWelcome}/>
      <KeyboardShortcutsOverlay open={shortcutsOpen} onOpenChange={setShortcutsOpen}/>
      <ProblemReportModal open={problemReportOpen} onOpenChange={setProblemReportOpen}/>
    </>);
}
