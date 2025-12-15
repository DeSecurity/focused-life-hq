import { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Trash2, 
  User,
  Palette,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { exportData, importData } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export function SettingsView() {
  const { currentProfile, updateSettings, resetAllData, renameProfile } = useApp();
  const [profileName, setProfileName] = useState(currentProfile.name);
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-pm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Data exported',
      description: 'Your data has been downloaded as a JSON file.',
    });
  };

  const handleImport = () => {
    const result = importData(importJson);
    if (result.success) {
      toast({
        title: 'Data imported',
        description: 'Your data has been imported successfully. Refreshing...',
      });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({
        title: 'Import failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleRename = () => {
    if (profileName.trim() && profileName !== currentProfile.name) {
      renameProfile(currentProfile.id, profileName.trim());
      toast({
        title: 'Profile renamed',
        description: `Profile renamed to "${profileName.trim()}"`,
      });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your experience</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <section className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="profileName">Profile Name</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="profileName"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="bg-surface-2 border-border"
                />
                <Button 
                  variant="secondary" 
                  onClick={handleRename}
                  disabled={!profileName.trim() || profileName === currentProfile.name}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentProfile.settings.theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
              </div>
              <Select
                value={currentProfile.settings.theme}
                onValueChange={v => updateSettings({ theme: v as 'dark' | 'light' })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Hide completed tasks</p>
                <p className="text-sm text-muted-foreground">Hide completed tasks from views</p>
              </div>
              <Switch
                checked={currentProfile.settings.hideCompletedTasks}
                onCheckedChange={v => updateSettings({ hideCompletedTasks: v })}
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Export Data</p>
                <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
              </div>
              <Button variant="secondary" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">Import Data</p>
                  <p className="text-sm text-muted-foreground">Restore from a JSON backup</p>
                </div>
                <Button variant="secondary" onClick={() => setShowImport(!showImport)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>

              {showImport && (
                <div className="space-y-3 animate-fade-in">
                  <Textarea
                    placeholder="Paste your JSON data here..."
                    value={importJson}
                    onChange={e => setImportJson(e.target.value)}
                    className="bg-surface-2 border-border min-h-[150px] font-mono text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowImport(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!importJson.trim()}>
                      Import Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card rounded-xl border border-destructive/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-destructive">Danger Zone</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Reset All Data</p>
              <p className="text-sm text-muted-foreground">Delete everything and start fresh with demo data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your data
                    including projects, tasks, ideas, and settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetAllData();
                      window.location.reload();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Life PM v1.0.0 • All data stored locally in your browser
          </p>
        </section>
      </div>
    </div>
  );
}
