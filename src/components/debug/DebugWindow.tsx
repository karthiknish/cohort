'use client'

import * as React from 'react'
import { Bug, Terminal, Database, User, Layout, RefreshCw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useProjectContext } from '@/contexts/project-context'


interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: unknown
}

export function DebugWindow() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [copied, setCopied] = React.useState(false)
  const { user, loading: authLoading } = useAuth()
  const { selectedClient, loading: clientLoading } = useClientContext()
  const { selectedProject } = useProjectContext()

  const copyToken = async () => {
    // Better Auth is cookie-based; no client JWT to copy.
    const response = await fetch('/api/auth/session', {
      credentials: 'same-origin',
      cache: 'no-store',
    })

    const text = await response.text().catch(() => '')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Intercept console logs
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    const addLog = (level: LogEntry['level'], args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')

      setLogs(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        level,
        message,
        context: args.length > 1 ? args.slice(1) : undefined
      }, ...prev].slice(0, 100))
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog('info', args)
    }
    console.error = (...args) => {
      originalError(...args)
      addLog('error', args)
    }

    // If auth session sync still logs a 409 as an error, treat it as a warning here.
    // This is a last-resort safety net while Turbopack/HMR caches settle.
    console.error = (...args) => {
      const first = args[0]
      const second = args[1]
      const isSessionSyncMessage = typeof first === 'string' && first.includes('Failed to sync session cookies')
      const is409 = second === 409
      if (isSessionSyncMessage && is409) {
        originalWarn(...args)
        addLog('warn', args)
        return
      }

      originalError(...args)
      addLog('error', args)
    }
    console.warn = (...args) => {
      originalWarn(...args)
      addLog('warn', args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12 shadow-lg bg-background border-primary/20 hover:bg-accent"
          >
            <Bug className="h-6 w-6 text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-primary" />
                  Localhost Debugger v6
                </SheetTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  DEV MODE
                </Badge>
              </div>
            </SheetHeader>

            <Tabs defaultValue="context" className="flex-1 flex flex-col">
              <div className="px-6 border-b">
                <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                  <TabsTrigger 
                    value="context" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Context
                  </TabsTrigger>
                  <TabsTrigger 
                    value="logs" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Logs
                    {logs.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-4 px-1 min-w-[16px]">
                        {logs.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="auth" 
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Auth
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="context" className="p-6 m-0">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Client Context
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID:</span>
                          <span>{selectedClient?.id || 'null'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{selectedClient?.name || 'null'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loading:</span>
                          <span>{clientLoading ? 'true' : 'false'}</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        Project Context
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID:</span>
                          <span>{selectedProject?.id || 'null'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{selectedProject?.name || 'null'}</span>
                        </div>
                      </div>
                    </section>

                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Hard Refresh
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/debug/clear-cache', { method: 'POST' })
                            if (res.ok) {
                              console.log('Cache cleared successfully')
                            } else {
                              console.error('Failed to clear cache')
                            }
                          } catch (err) {
                            console.error('Error clearing cache:', err)
                          }
                        }}
                      >
                        <Database className="h-3 w-3 mr-2" />
                        Clear Server Cache
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="p-0 m-0">
                  <div className="divide-y">
                    {logs.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground text-sm">
                        No logs captured yet.
                      </div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} className="p-4 font-mono text-[11px] hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="text-muted-foreground shrink-0">
                              {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <Badge 
                              variant={log.level === 'error' ? 'destructive' : log.level === 'warn' ? 'outline' : 'secondary'}
                              className="h-4 px-1 text-[9px] uppercase shrink-0"
                            >
                              {log.level}
                            </Badge>
                            <span className="break-all whitespace-pre-wrap">{log.message}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="auth" className="p-6 m-0">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User Session
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2 overflow-auto max-h-[400px]">
                        {user ? (
                          <pre>{JSON.stringify(user, null, 2)}</pre>
                        ) : (
                          <span className="text-muted-foreground">No active session</span>
                        )}
                      </div>
                    </section>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Auth Loading:</span>
                      <span>{authLoading ? 'true' : 'false'}</span>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={copyToken}
                      disabled={!user}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-2" />
                      )}
                      Copy ID Token
                    </Button>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
