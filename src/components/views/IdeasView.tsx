import { useMemo, useState } from 'react';
import { Lightbulb, Plus, Search, Archive } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { IdeaCard } from '@/components/shared/IdeaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function IdeasView() {
  const { currentProfile, setQuickAddOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const ideas = useMemo(() => {
    return currentProfile.ideas
      .filter(idea => {
        if (showArchived !== (idea.archived || false)) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            idea.title.toLowerCase().includes(query) ||
            idea.notes?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentProfile.ideas, searchQuery, showArchived]);

  const activeCount = currentProfile.ideas.filter(i => !i.archived).length;
  const archivedCount = currentProfile.ideas.filter(i => i.archived).length;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center glow-sm">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ideas Inbox</h1>
            <p className="text-muted-foreground">Capture and organize your ideas</p>
          </div>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Idea
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showArchived ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(false)}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={showArchived ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(true)}
          >
            <Archive className="h-4 w-4 mr-1" />
            Archived ({archivedCount})
          </Button>
        </div>
      </div>

      {/* Ideas Grid */}
      {ideas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Lightbulb className="h-16 w-16 text-yellow-500/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {showArchived ? 'No archived ideas' : 'No ideas yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {showArchived 
              ? 'Archived ideas will appear here'
              : 'Capture your thoughts and turn them into projects'}
          </p>
          {!showArchived && (
            <Button onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Capture an Idea
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
