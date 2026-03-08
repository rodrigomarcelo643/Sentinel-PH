import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings, Bell, Shield, Palette, Save, Monitor, Moon, Sun } from "lucide-react";

// Skeleton Loader Component
const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const SettingsSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="mb-6">
      <SkeletonLoader className="h-8 w-48 mb-2" />
      <SkeletonLoader className="h-4 w-96" />
    </div>
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <SkeletonLoader className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div>
                  <SkeletonLoader className="h-4 w-32 mb-1" />
                  <SkeletonLoader className="h-3 w-48" />
                </div>
                <SkeletonLoader className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function BhwSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
    },
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-10xl mx-auto p-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Settings className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account preferences and settings</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            Notifications
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500 mt-1">Receive updates and alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500 mt-1">Receive browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, push: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-xs text-gray-500 mt-1">Receive text message alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Shield className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            Privacy & Security
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Profile Visibility</label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, profileVisibility: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="contacts">Contacts Only</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Data Sharing</label>
                <p className="text-xs text-gray-500 mt-1">Allow anonymous data sharing for research</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.dataSharing}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, dataSharing: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Palette className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            Appearance
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' }
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === value
                        ? 'border-gray-600 bg-gray-50 dark:bg-gray-700 dark:border-gray-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      theme === value ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      theme === value ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}