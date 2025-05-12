"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";

// Mock data
const codeQualityData = [
  { day: "Mon", coverage: 80, success: 95 },
  { day: "Tue", coverage: 81, success: 95 },
  { day: "Wed", coverage: 82, success: 96 },
  { day: "Thu", coverage: 82, success: 96 },
  { day: "Fri", coverage: 83, success: 97 },
  { day: "Sat", coverage: 83, success: 97 },
  { day: "Sun", coverage: 83, success: 97 },
];

const performanceData = [
  { name: "John Doe", commits: 45, prs: 12, reviews: 28, issues: 8 },
  { name: "Jane Smith", commits: 38, prs: 10, reviews: 25, issues: 6 },
  { name: "Mike Johnson", commits: 32, prs: 8, reviews: 20, issues: 5 },
];

export default function AnalyticsPage() {
  const [timeWindow, setTimeWindow] = useState("Last 7 days");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <div className="flex space-x-2 items-center">
          <select
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            <option>Last 7 days</option>
            <option>Last 14 days</option>
            <option>Last 30 days</option>
            <option>Last quarter</option>
          </select>
          <button className="btn btn-primary">Export Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Code Coverage</h3>
              <p className="text-2xl font-bold">85%</p>
              <span className="text-green-500 text-xs">
                +1% from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Build Success Rate</h3>
              <p className="text-2xl font-bold">98%</p>
              <span className="text-green-500 text-xs">
                +1% from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Deployment Frequency</h3>
              <p className="text-2xl font-bold">2.5/day</p>
              <span className="text-red-500 text-xs">
                -0.5 from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Mean Time to Recovery</h3>
              <p className="text-2xl font-bold">45min</p>
              <span className="text-gray-500 text-xs">
                Same from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-medium mb-4">Code Coverage Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={codeQualityData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="coverage"
                  stroke="#4263eb"
                  name="Coverage %"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-medium mb-4">Build Success Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={codeQualityData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#37b24d"
                  name="Success Rate %"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="card">
        <h3 className="font-medium mb-4">Team Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((member, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.commits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.prs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.reviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.issues}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
