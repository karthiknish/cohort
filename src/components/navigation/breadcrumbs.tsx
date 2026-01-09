'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  ChevronRight,
  Home,
  Briefcase,
  ListChecks,
  MessageSquare,
  BarChart3,
  CreditCard,
  FileText,
  Megaphone,
  Activity,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { useClientContext } from '@/contexts/client-context'
import { isFeatureEnabled } from '@/lib/features'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  isCurrent?: boolean
}

export function NavigationBreadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { selectedClient } = useClientContext()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Don't render if feature flag is disabled or not on dashboard pages
  if (!isFeatureEnabled('BREADCRUMBS') || !pathname.startsWith('/dashboard')) {
    return null
  }

  const items = generateBreadcrumbItems(pathname, searchParams, {
    id: selectedClient?.id ?? null,
    name: selectedClient?.name ?? null
  })

  if (items.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 py-2">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.href && !item.isCurrent ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="flex items-center gap-1 text-sm">
                      {item.icon && (() => {
                        const Icon = item.icon!
                        return <Icon className="h-4 w-4" />
                      })()}
                      <span className="truncate max-w-[120px]">{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-1 text-sm">
                    {item.icon && (() => {
                      const Icon = item.icon!
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className="truncate max-w-[120px]">{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile version with dropdown */}
      <div className="md:hidden">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <div className="flex items-center gap-1">
                {items[items.length - 2]?.icon && (() => {
                  const Icon = items[items.length - 2].icon!
                  return <Icon className="h-4 w-4" />
                })()}
                <ChevronRight className="h-3 w-3" />
                {items[items.length - 1]?.icon && (() => {
                  const Icon = items[items.length - 1].icon!
                  return <Icon className="h-4 w-4" />
                })()}
                <span className="text-sm font-medium">{items[items.length - 1]?.label}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {items.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                {item.href && !item.isCurrent ? (
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon && (() => {
                      const Icon = item.icon!
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className={cn("truncate", item.isCurrent && "font-medium")}>
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    {item.icon && (() => {
                      const Icon = item.icon!
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className="truncate font-medium">{item.label}</span>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function generateBreadcrumbItems(
  pathname: string,
  searchParams: URLSearchParams,
  selectedClient: { id: string | null; name: string | null }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = []

  // Dashboard root
  items.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  })

  // Client context
  if (selectedClient?.id && selectedClient?.name) {
    items.push({
      label: selectedClient.name,
      href: `/dashboard?clientId=${selectedClient.id}`,
    })
  }

  // Current page section
  const pathSegments = pathname.replace('/dashboard/', '').split('/')
  const currentSection = pathSegments[0]

  switch (currentSection) {
    case 'projects':
      items.push({
        label: 'Projects',
        href: '/dashboard/projects',
        icon: Briefcase,
      })

      // Specific project context
      const projectId = searchParams.get('projectId')
      const projectName = searchParams.get('projectName')
      if (projectId || projectName) {
        items.push({
          label: projectName || 'Project Details',
          href: `/dashboard/projects?projectId=${projectId}&projectName=${projectName}`,
        })
      }
      break

    case 'tasks':
      items.push({
        label: 'Tasks',
        href: '/dashboard/tasks',
        icon: ListChecks,
      })

      // Project context for tasks
      const taskProjectId = searchParams.get('projectId')
      const taskProjectName = searchParams.get('projectName')
      if (taskProjectId || taskProjectName) {
        items.push({
          label: taskProjectName || 'Project Tasks',
          href: `/dashboard/tasks?projectId=${taskProjectId}&projectName=${taskProjectName}`,
        })
      }
      break

    case 'collaboration':
      items.push({
        label: 'Collaboration',
        href: '/dashboard/collaboration',
        icon: MessageSquare,
      })

      // Project context for collaboration
      const collabProjectId = searchParams.get('projectId')
      const collabProjectName = searchParams.get('projectName')
      if (collabProjectId || collabProjectName) {
        items.push({
          label: collabProjectName || 'Project Discussion',
          href: `/dashboard/collaboration?projectId=${collabProjectId}&projectName=${collabProjectName}`,
        })
      }
      break

    case 'analytics':
      items.push({
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
      })
      break

    case 'finance':
      items.push({
        label: 'Finance',
        href: '/dashboard/finance',
        icon: CreditCard,
      })

      // Sub-pages for finance
      if (pathSegments[1] === 'payments') {
        items.push({
          label: 'Payments',
          isCurrent: true,
        })
      }
      break

    case 'proposals':
      items.push({
        label: 'Proposals',
        href: '/dashboard/proposals',
        icon: FileText,
      })

      // Sub-pages for proposals
      if (pathSegments[1] === 'analytics') {
        items.push({
          label: 'Analytics',
          isCurrent: true,
        })
      } else if (pathSegments[1] === 'viewer') {
        items.push({
          label: 'Viewer',
          isCurrent: true,
        })
      }
      break

    case 'ads':
      items.push({
        label: 'Ads',
        href: '/dashboard/ads',
        icon: Megaphone,
      })

      // Handle campaign detail routes: /dashboard/ads/campaigns/[providerId]/[campaignId]
      if (pathSegments[1] === 'campaigns' && pathSegments[2]) {
        const providerId = pathSegments[2]
        const campaignId = pathSegments[3]
        const campaignName = searchParams.get('campaignName')

        // Provider mapping
        const providerLabels: Record<string, string> = {
          'facebook': 'Meta',
          'google': 'Google Ads',
          'linkedin': 'LinkedIn',
          'tiktok': 'TikTok',
        }

        items.push({
          label: providerLabels[providerId] || providerId,
          href: `/dashboard/ads?provider=${providerId}`,
        })

        if (campaignId && campaignName) {
          const isCreativePath = pathSegments[4] === 'creative' && pathSegments[5]

          items.push({
            label: campaignName,
            href: isCreativePath ? `/dashboard/ads/campaigns/${providerId}/${campaignId}?${searchParams.toString()}` : undefined,
            isCurrent: !isCreativePath,
          })

          if (isCreativePath) {
            const creativeName = searchParams.get('creativeName')
            items.push({
              label: creativeName || 'Creative Detail',
              isCurrent: true,
            })
          }
        }
      }
      break

    case 'activity':
      items.push({
        label: 'Activity',
        href: '/dashboard/activity',
        icon: Activity,
      })
      break

    case 'clients':
      items.push({
        label: 'Clients',
        href: '/dashboard/clients',
        icon: Users,
      })
      break

    default:
      // Handle other dashboard sections
      if (currentSection) {
        items.push({
          label: currentSection.charAt(0).toUpperCase() + currentSection.slice(1),
          isCurrent: true,
        })
      }
      break
  }

  // Mark the last item as current
  if (items.length > 0) {
    items[items.length - 1].isCurrent = true
    delete items[items.length - 1].href
  }

  return items
}
