import { useApp } from '@/contexts/AppContext';
import { TodayView } from './TodayView';
import { ThisWeekView } from './ThisWeekView';
import { IdeasView } from './IdeasView';
import { ProjectsView } from './ProjectsView';
import { BoardView } from './BoardView';
import { AreasView } from './AreasView';
import { CompletedView } from './CompletedView';
import { SettingsView } from './SettingsView';
import { ProjectDetailView } from './ProjectDetailView';
import { BacklogView } from './BacklogView';

export function ViewRouter() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'today':
      return <TodayView />;
    case 'this-week':
      return <ThisWeekView />;
    case 'backlog':
      return <BacklogView />;
    case 'ideas':
      return <IdeasView />;
    case 'projects':
      return <ProjectsView />;
    case 'board':
      return <BoardView />;
    case 'areas':
      return <AreasView />;
    case 'completed':
      return <CompletedView />;
    case 'settings':
      return <SettingsView />;
    case 'project-detail':
      return <ProjectDetailView />;
    default:
      return <TodayView />;
  }
}
