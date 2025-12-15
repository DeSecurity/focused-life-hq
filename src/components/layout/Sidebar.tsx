import { 
  Lightbulb, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  CalendarDays, 
  Layers, 
  CheckCircle2, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Inbox,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ViewType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export function Sidebar() {
  const { 
    currentView, 
    setCurrentView, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    setQuickAddOpen,
    currentProfile,
    setSelectedProjectId,
  } = useApp();

  // Calculate badges
  const todayTasks = currentProfile.tasks.filter(t => t.isToday && t.status !== 'done').length;
  const ideasCount = currentProfile.ideas.filter(i => !i.archived).length;
  const inProgressTasks = currentProfile.tasks.filter(t => t.status !== 'done').length;

  const mainNavItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: Calendar, badge: todayTasks },
    { id: 'this-week', label: 'This Week', icon: CalendarDays },
    { id: 'backlog', label: 'Backlog', icon: Inbox },
  ];

  const workspaceItems: NavItem[] = [
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, badge: ideasCount },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'board', label: 'Board', icon: CheckSquare, badge: inProgressTasks },
    { id: 'areas', label: 'Areas', icon: Layers },
  ];

  const bottomItems: NavItem[] = [
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: ViewType) => {
    setCurrentView(id);
    setSelectedProjectId(null);
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = currentView === item.id;
    const Icon = item.icon;

    const button = (
      <button
        onClick={() => handleNavClick(item.id)}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-sidebar-accent group relative',
          isActive && 'bg-sidebar-accent text-sidebar-primary',
          !isActive && 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          isActive && 'text-sidebar-primary'
        )} />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isActive 
                  ? 'bg-sidebar-primary/20 text-sidebar-primary' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </button>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 rounded">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">Life PM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setQuickAddOpen(true)}
              className={cn(
                'w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-sm',
                sidebarCollapsed ? 'px-0' : 'justify-start gap-2'
              )}
            >
              <Plus className="h-4 w-4" />
              {!sidebarCollapsed && <span>Quick Add</span>}
            </Button>
          </TooltipTrigger>
          {sidebarCollapsed && (
            <TooltipContent side="right">Quick Add</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Planning Section */}
        <div>
          {!sidebarCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Planning
            </h3>
          )}
          <div className="space-y-1">
            {mainNavItems.map(item => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Workspace Section */}
        <div>
          {!sidebarCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Workspace
            </h3>
          )}
          <div className="space-y-1">
            {workspaceItems.map(item => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>

      {/* Profile Indicator */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">
                {currentProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentProfile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentProfile.projects.length} projects
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
