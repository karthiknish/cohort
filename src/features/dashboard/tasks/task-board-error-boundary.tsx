'use client';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Columns3, RefreshCw } from 'lucide-react';
import { logError } from '@/lib/convex-errors';
import { Button } from '@/shared/ui/button';

type TaskBoardErrorBoundaryProps = {
    children: ReactNode;
    onSwitchToList: () => void;
};

type TaskBoardErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

/**
 * Local error boundary around the Board (Kanban) view so that a render
 * failure inside TaskKanban doesn't crash the entire dashboard route.
 */
export class TaskBoardErrorBoundary extends Component<TaskBoardErrorBoundaryProps, TaskBoardErrorBoundaryState> {
    override state: TaskBoardErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): TaskBoardErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        logError(error, 'TaskBoardErrorBoundary: Board view crashed');
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    handleSwitchToList = () => {
        this.setState({ hasError: false, error: null });
        this.props.onSwitchToList();
    };

    override render() {
        if (this.state.hasError) {
            return (<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <Columns3 className="mx-auto size-10 text-destructive/60" aria-hidden/>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Board view unavailable</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    Something went wrong rendering the board. Try again or switch to list view.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={this.handleRetry}>
                        <RefreshCw className="mr-2 size-4"/>
                        Try again
                    </Button>
                    <Button size="sm" onClick={this.handleSwitchToList}>
                        Switch to list view
                    </Button>
                </div>
            </div>);
        }
        return this.props.children;
    }
}
