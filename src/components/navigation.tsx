'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { 
  BarChart3, 
  Users, 
  CheckSquare, 
  CreditCard, 
  FileText, 
  MessageSquare,
  Settings,
  Home,
  Briefcase,
  LogOut,
  User
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCard },
  { name: 'Proposals', href: '/dashboard/proposals', icon: FileText },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-gray-900">Cohorts</h1>
      </div>
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          <li className="mt-auto">
            <div className="space-y-1">
              <Link
                href="/settings"
                className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                <Settings className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                Settings
              </Link>
              <button
                onClick={signOut}
                className="w-full group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                Sign Out
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export function Header() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1 items-center">
            <div className="w-full max-w-lg">
              <input
                type="search"
                placeholder="Search clients, tasks, or campaigns..."
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <span className="sr-only">View notifications</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
          <div className="relative">
            <button type="button" className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                {user ? (
                  <span className="text-sm font-medium text-white">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
