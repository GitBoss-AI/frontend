"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    displayName: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
  });

  const [integrations, setIntegrations] = useState({
    githubToken: "••••••••••••••••••••••",
    slackWebhook: "",
  });

  const [theme, setTheme] = useState({
    mode: "Light",
    accentColor: "#4263eb",
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleNotificationToggle = (name: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }));
    setHasChanges(true);
  };

  const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIntegrations((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    // In a real app, we would save the changes to an API
    console.log("Saving changes:", {
      profileData,
      notifications,
      integrations,
      theme,
    });
    setHasChanges(false);
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          className={`btn ${hasChanges ? "btn-primary" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          onClick={handleSaveChanges}
          disabled={!hasChanges}
        >
          Save Changes
        </button>
      </div>

      {/* Profile Settings */}
      <div className="card">
        <h3 className="font-medium mb-4">Profile Settings</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleProfileChange}
              className="mt-1 input"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="mt-1 input"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={profileData.role}
              onChange={(e) => {
                setProfileData((prev) => ({ ...prev, role: e.target.value }));
                setHasChanges(true);
              }}
              className="mt-1 input"
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h3 className="font-medium mb-4">Notification Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Email Notifications
              </h4>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.emailNotifications}
                onChange={() => handleNotificationToggle("emailNotifications")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Push Notifications
              </h4>
              <p className="text-sm text-gray-500">
                Receive updates in browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.pushNotifications}
                onChange={() => handleNotificationToggle("pushNotifications")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Weekly Reports
              </h4>
              <p className="text-sm text-gray-500">
                Receive weekly performance reports
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.weeklyReports}
                onChange={() => handleNotificationToggle("weeklyReports")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Integration Settings */}
      <div className="card">
        <h3 className="font-medium mb-4">Integration Settings</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="githubToken"
              className="block text-sm font-medium text-gray-700"
            >
              GitHub API Token
            </label>
            <div className="flex mt-1">
              <input
                type="password"
                id="githubToken"
                name="githubToken"
                value={integrations.githubToken}
                onChange={handleIntegrationChange}
                className="input rounded-r-none flex-1"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="slackWebhook"
              className="block text-sm font-medium text-gray-700"
            >
              Slack Webhook URL
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                id="slackWebhook"
                name="slackWebhook"
                value={integrations.slackWebhook}
                onChange={handleIntegrationChange}
                placeholder="https://hooks.slack.com/services/..."
                className="input rounded-r-none flex-1"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <h3 className="font-medium mb-4">Theme Settings</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="themeMode"
              className="block text-sm font-medium text-gray-700"
            >
              Theme Mode
            </label>
            <select
              id="themeMode"
              name="themeMode"
              value={theme.mode}
              onChange={(e) => {
                setTheme((prev) => ({ ...prev, mode: e.target.value }));
                setHasChanges(true);
              }}
              className="mt-1 input"
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Accent Color
            </label>
            <div className="mt-2 flex space-x-2">
              {["#4263eb", "#2b8a3e", "#e67700", "#c92a2a"].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setTheme((prev) => ({ ...prev, accentColor: color }));
                    setHasChanges(true);
                  }}
                  className={`w-8 h-8 rounded-full ${theme.accentColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
