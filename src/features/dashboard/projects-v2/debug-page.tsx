'use client';

import { useState } from 'react';
import { Briefcase, CircleX, ListChecks, Users } from 'lucide-react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { getPreviewProjects } from '@/lib/preview-data';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import type { MilestoneRecord } from '@/types/milestones';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { ProjectsPageProvider } from './components/projects-page-provider';
import { useProjectsPageContext } from './components/projects-page-provider';
import { SummaryCard } from './components/summary-card';
import { ProjectStatusPills } from './components/project-status-pills';
import { ProjectSearch } from './components/project-search';
import { ProjectFilters } from './components/project-filters';
import { ProjectActiveFilters } from './components/project-active-filters';
import { ViewModeSelector } from './components/view-mode-selector';
import { SavedViewsSelector } from './components/saved-views-selector';
import { ProjectTaskProgress } from './components/project-task-progress';
import { ProjectActionsMenu } from './components/project-actions-menu';
import { ProjectCard } from './components/project-card';
import { ProjectRow } from './components/project-row';
import { ListView } from './components/views/list-view';
import { GridView } from './components/views/grid-view';
import { BoardView } from './components/views/board-view';
import { GanttView } from './components/views/gantt-view';
import { ProjectDetailDrawer } from './components/project-detail-drawer';
import { ProjectsListState } from './components/projects-list-state';
import { ProjectsDashboard } from './components/projects-dashboard';
import { computeStatusCounts } from './utils/project-filters';
import type { StatusFilter, ViewMode } from './types';

// ─── Helpers ────────────────────────────────────────────────────────────
function useSampleProjects(): ProjectRecord[] {
  const { isPreviewMode } = usePreview();
  const { selectedClient } = useClientContext();
  if (!isPreviewMode) return [];
  return getPreviewProjects(selectedClient?.id ?? null);
}

const noop = () => {};
const noopProject = (_p: ProjectRecord) => {};
const noopStatus = (_p: ProjectRecord, _s: ProjectStatus) => {};

// ─── Step 1: SummaryCard (pure presentational) ──────────────────────────
function Step1SummaryCard() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Total Projects" value={12} icon={Briefcase} description="All time" />
      <SummaryCard label="Active" value={5} icon={ListChecks} active />
      <SummaryCard label="Overdue" value={2} icon={CircleX} description="Past due date" />
      <SummaryCard label="Clients" value={4} icon={Users} onClick={noop} />
    </div>
  );
}

// ─── Step 2: ProjectStatusPills ─────────────────────────────────────────
function Step2StatusPills() {
  const projects = useSampleProjects();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const counts = computeStatusCounts(projects);
  return (
    <ProjectStatusPills
      statusFilter={filter}
      statusCounts={counts}
      totalCount={projects.length}
      onStatusChange={setFilter}
    />
  );
}

// ─── Step 3: ProjectSearch ──────────────────────────────────────────────
function Step3Search() {
  const [value, setValue] = useState('');
  return <ProjectSearch value={value} onChange={setValue} />;
}

// ─── Step 4: ProjectFilters (sort) ──────────────────────────────────────
function Step4Filters() {
  const [field, setField] = useState<'updatedAt' | 'name' | 'status'>('updatedAt');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  return (
    <ProjectFilters
      sortField={field}
      sortDirection={dir}
      onSortFieldChange={(v) => setField(v as 'updatedAt' | 'name' | 'status')}
      onToggleSortDirection={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
    />
  );
}

// ─── Step 5: ProjectActiveFilters ───────────────────────────────────────
function Step5ActiveFilters() {
  return (
    <ProjectActiveFilters
      labels={['Active', 'Search: "brand"', 'Sort: name (asc)']}
      onClearAll={noop}
    />
  );
}

// ─── Step 6: ViewModeSelector ───────────────────────────────────────────
function Step6ViewMode() {
  const [mode, setMode] = useState<ViewMode>('list');
  return <ViewModeSelector viewMode={mode} onChange={setMode} />;
}

// ─── Step 7: SavedViewsSelector ─────────────────────────────────────────
function Step7SavedViews() {
  const [views, setViews] = useState([
    {
      id: 'v1',
      name: 'Active Projects',
      statusFilter: 'active' as StatusFilter,
      sortField: 'updatedAt' as const,
      sortDirection: 'desc' as const,
      searchQuery: '',
      viewMode: 'list' as ViewMode,
      createdAt: Date.now(),
    },
  ]);
  return (
    <SavedViewsSelector
      savedViews={views}
      onSaveView={(name) => {
        const v = {
          id: `v${Date.now()}`,
          name,
          statusFilter: 'all' as StatusFilter,
          sortField: 'updatedAt' as const,
          sortDirection: 'desc' as const,
          searchQuery: '',
          viewMode: 'list' as ViewMode,
          createdAt: Date.now(),
        };
        setViews((prev) => [...prev, v]);
        return v;
      }}
      onApplyView={noop}
      onDeleteView={(id) => setViews((prev) => prev.filter((v) => v.id !== id))}
    />
  );
}

// ─── Step 8: ProjectTaskProgress ────────────────────────────────────────
function Step8TaskProgress() {
  const projects = useSampleProjects();
  return (
    <div className="space-y-4">
      {projects.slice(0, 3).map((p) => (
        <div key={p.id} className="border rounded p-3">
          <p className="text-sm font-medium mb-2">{p.name}</p>
          <ProjectTaskProgress project={p} />
        </div>
      ))}
    </div>
  );
}

// ─── Step 9: ProjectActionsMenu ─────────────────────────────────────────
function Step9ActionsMenu() {
  const projects = useSampleProjects();
  const project = projects[0];
  if (!project) return <div>No sample projects</div>;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{project.name}</span>
      <ProjectActionsMenu project={project} onEdit={noopProject} onDelete={noopProject} onUpdateStatus={noopStatus} onViewDetails={noopProject} />
    </div>
  );
}

// ─── Step 10: ProjectCard ───────────────────────────────────────────────
function Step10ProjectCard() {
  const projects = useSampleProjects();
  if (!projects.length) return <div>No sample projects</div>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.slice(0, 3).map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          onDelete={noopProject}
          onEdit={noopProject}
          onUpdateStatus={noopStatus}
          onViewDetails={noopProject}
        />
      ))}
    </div>
  );
}

// ─── Step 11: ProjectRow ────────────────────────────────────────────────
function Step11ProjectRow() {
  const projects = useSampleProjects();
  if (!projects.length) return <div>No sample projects</div>;
  return (
    <div className="space-y-3">
      {projects.slice(0, 3).map((p) => (
        <ProjectRow
          key={p.id}
          project={p}
          onDelete={noopProject}
          onEdit={noopProject}
          onUpdateStatus={noopStatus}
          onViewDetails={noopProject}
        />
      ))}
    </div>
  );
}

// ─── Step 12: ListView ──────────────────────────────────────────────────
function Step12ListView() {
  const projects = useSampleProjects();
  return (
    <ListView
      projects={projects}
      pendingStatusUpdates={new Set()}
      onUpdateStatus={noopStatus}
      onEdit={noopProject}
      onDelete={noopProject}
      onViewDetails={noopProject}
    />
  );
}

// ─── Step 13: GridView ──────────────────────────────────────────────────
function Step13GridView() {
  const projects = useSampleProjects();
  return (
    <GridView
      projects={projects}
      pendingStatusUpdates={new Set()}
      onUpdateStatus={noopStatus}
      onEdit={noopProject}
      onDelete={noopProject}
      onViewDetails={noopProject}
    />
  );
}

// ─── Step 14: BoardView ─────────────────────────────────────────────────
function Step14BoardView() {
  const projects = useSampleProjects();
  return (
    <BoardView
      projects={projects}
      pendingStatusUpdates={new Set()}
      onUpdateStatus={noopStatus}
      onEdit={noopProject}
      onDelete={noopProject}
      onViewDetails={noopProject}
    />
  );
}

// ─── Step 15: GanttView ─────────────────────────────────────────────────
function Step15GanttView() {
  const projects = useSampleProjects();
  const milestones: Record<string, MilestoneRecord[]> = {};
  return (
    <GanttView
      projects={projects}
      milestones={milestones}
      loading={false}
      error={null}
      onRefresh={noop}
      onMilestoneCreated={noop}
      onMilestoneUpdated={noop}
      onMoveMilestone={noop}
      onUpdateMilestone={async () => {}}
    />
  );
}

// ─── Step 16: ProjectDetailDrawer ───────────────────────────────────────
function Step16DetailDrawer() {
  const projects = useSampleProjects();
  const [open, setOpen] = useState(false);
  const project = projects[0] ?? null;
  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-3 py-1 rounded bg-blue-500 text-white text-xs">
        Open Drawer
      </button>
      <ProjectDetailDrawer
        project={project}
        open={open}
        onOpenChange={setOpen}
        onEdit={noopProject}
        onDelete={noopProject}
        onUpdateStatus={noopStatus}
      />
    </div>
  );
}

// ─── Step 17: ProjectsListState (uses controller context) ───────────────
function Step17ListState() {
  const ctx = useProjectsPageContext();
  return (
    <ProjectsListState
      error={ctx.error}
      hasActiveFilters={ctx.hasActiveFilters}
      hasVisibleProjects={ctx.hasVisibleProjects}
      initialLoading={ctx.initialLoading}
      loading={ctx.loading}
      onClearAllFilters={ctx.clearAllFilters}
      onDelete={ctx.openDeleteDialog}
      onEdit={ctx.openEditDialog}
      onRefresh={ctx.handleRefreshProjects}
      onSearchClear={() => ctx.setSearchInput('')}
      onUpdateStatus={ctx.handleUpdateStatus}
      onViewDetails={(p) => ctx.openDrawer(p.id)}
      pendingStatusUpdates={ctx.pendingStatusUpdates}
      projects={ctx.projects}
      searchInput={ctx.searchInput}
      sortedProjects={ctx.sortedProjects}
      viewMode={ctx.viewMode}
      onClearFocusAndFilters={ctx.clearAllFilters}
      hasMoreProjects={ctx.hasMoreProjects}
      loadingMore={ctx.loadingMore}
      onLoadMore={ctx.handleLoadMore}
      milestonesByProject={ctx.milestonesByProject}
      milestonesLoading={ctx.milestonesLoading}
      milestonesError={ctx.milestonesError}
      onMilestoneRefresh={() => ctx.loadMilestones(ctx.projects.map((p) => p.id))}
      onMilestoneCreated={ctx.handleMilestoneCreated}
      onMilestoneUpdated={ctx.handleMilestoneCreated}
      onMoveMilestone={() => {}}
      onUpdateMilestone={async () => {}}
    />
  );
}

// ─── Step 18: Full ProjectsDashboard (inside provider) ──────────────────
function Step18FullDashboard() {
  return <ProjectsDashboard />;
}

// ─── Step definitions ───────────────────────────────────────────────────
type StepDef = { label: string; comp: React.ReactNode; wrap?: boolean };

const RAW_STEPS: StepDef[] = [
  { label: '1 SummaryCard', comp: <Step1SummaryCard /> },
  { label: '2 StatusPills', comp: <Step2StatusPills /> },
  { label: '3 Search', comp: <Step3Search /> },
  { label: '4 Filters', comp: <Step4Filters /> },
  { label: '5 ActiveFilters', comp: <Step5ActiveFilters /> },
  { label: '6 ViewMode', comp: <Step6ViewMode /> },
  { label: '7 SavedViews', comp: <Step7SavedViews /> },
  { label: '8 TaskProgress', comp: <Step8TaskProgress /> },
  { label: '9 ActionsMenu', comp: <Step9ActionsMenu /> },
  { label: '10 ProjectCard', comp: <Step10ProjectCard /> },
  { label: '11 ProjectRow', comp: <Step11ProjectRow /> },
  { label: '12 ListView', comp: <Step12ListView /> },
  { label: '13 GridView', comp: <Step13GridView /> },
  { label: '14 BoardView', comp: <Step14BoardView /> },
  { label: '15 GanttView', comp: <Step15GanttView /> },
  { label: '16 DetailDrawer', comp: <Step16DetailDrawer /> },
];

// Steps that need the ProjectsPageProvider context
const CONTEXT_STEPS: StepDef[] = [
  { label: '17 ListState', comp: <Step17ListState />, wrap: true },
  { label: '18 FullDashboard', comp: <Step18FullDashboard />, wrap: true },
];

const ALL_STEPS = [...RAW_STEPS, ...CONTEXT_STEPS];

// ─── Main debug page ────────────────────────────────────────────────────
export default function ProjectsDebugPage() {
  const [step, setStep] = useState(0);
  const current = ALL_STEPS[step] ?? ALL_STEPS[0]!;
  const content = current.wrap ? (
    <ProjectsPageProvider>
      <TooltipProvider>{current.comp}</TooltipProvider>
    </ProjectsPageProvider>
  ) : (
    <TooltipProvider>{current.comp}</TooltipProvider>
  );

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Projects V2 Debug — {current.label}</h1>
      <div className="flex gap-2 flex-wrap">
        {ALL_STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-3 py-1 rounded text-xs ${step === i ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="border p-4 rounded min-h-[200px]">{content}</div>
    </div>
  );
}
