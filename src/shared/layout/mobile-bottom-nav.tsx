'use client';
import { Link } from '@/shared/ui/link';
import { usePathname } from '@/shared/ui/navigation';
import { Home, BriefcaseBusiness, CheckSquare, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTTOM_NAV_ITEMS = [
  { name: 'For You', href: '/for-you', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: BriefcaseBusiness },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Alerts', href: '/dashboard/notifications', icon: Bell },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isDashboardRoot = item.href === '/for-you';
        const isActive = isDashboardRoot
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch
            className={cn(
              'flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon className="size-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
