import { useState } from 'react';
import { Lightbulb, FolderKanban, CheckSquare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type AddType = 'idea' | 'task' | 'project';

export function QuickAddDialog() {
  const { quickAddOpen, setQuickAddOpen, createIdea, createTask, createProject, currentProfile } = useApp();
  const [type, setType] = useState<AddType>('idea');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    switch (type) {
      case 'idea':
        createIdea({ title: title.trim(), notes: notes.trim() || undefined, tags: [] });
        break;
      case 'task':
        createTask({ 
          title: title.trim(), 
          description: notes.trim() || undefined,
          status: 'todo',
          priority: 'medium',
          tags: [],
        });
        break;
      case 'project':
        createProject({
          title: title.trim(),
          description: notes.trim() || undefined,
          areaId: currentProfile.areas[0]?.id || '',
          status: 'backlog',
          priority: 'medium',
          tags: [],
        });
        break;
    }

    setTitle('');
    setNotes('');
    setQuickAddOpen(false);
  };

  const typeOptions = [
    { id: 'idea' as AddType, label: 'Idea', icon: Lightbulb, color: 'text-yellow-400' },
    { id: 'task' as AddType, label: 'Task', icon: CheckSquare, color: 'text-primary' },
    { id: 'project' as AddType, label: 'Project', icon: FolderKanban, color: 'text-purple-400' },
  ];

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Quick Add</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className="flex gap-2">
            {typeOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200',
                    type === opt.id
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface-2 border-border text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4', type === opt.id ? 'text-primary' : opt.color)} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Title Input */}
          <Input
            placeholder={`What's on your mind?`}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-surface-2 border-border text-foreground placeholder:text-muted-foreground"
            autoFocus
          />

          {/* Notes Input */}
          <Textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="bg-surface-2 border-border text-foreground placeholder:text-muted-foreground resize-none"
            rows={3}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setQuickAddOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
