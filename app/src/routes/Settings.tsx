import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWizardStore } from '@/store/useWizardStore';

interface SettingsProps {
  onNavigate: (route: 'home' | 'review' | 'settings') => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const { clearAllData } = useWizardStore();

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
          ← Back to Assessment
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              All data is stored locally on your device. No information is transmitted to external servers.
            </p>
            <Button variant="destructive" onClick={handleClearData}>
              Clear All Local Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Educational Tool Only</h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                This application provides educational calculations and is not intended for direct patient care, 
                diagnosis, or treatment decisions.
              </p>
            </div>
            <div className="space-y-1">
              <p><strong>Always verify with:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Institutional protocols</li>
                <li>Clinical judgment</li>
                <li>Attending physician guidance</li>
                <li>Local burn center guidelines</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}