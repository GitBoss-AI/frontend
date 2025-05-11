"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Info, UserPlus } from "lucide-react";

// Mock data
const teamStats = {
  members: 12,
  active_projects: 5,
  velocity: 85,
  review_rate: 92,
};

const performanceData = [
  { name: "John Doe", commits: 45 },
  { name: "Jane Smith", commits: 38 },
  { name: "Mike Johnson", commits: 32 },
  { name: "Sarah Wilson", commits: 28 },
  { name: "Alex Chen", commits: 24 },
];

export default function TeamPage() {
  const [timeWindow, setTimeWindow] = useState("This Month");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Overview</h1>
        <div className="flex space-x-2 items-center">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </button>
          <button className="btn btn-secondary">Export Team Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Total Team Members</h3>
              <p className="text-2xl font-bold">{teamStats.members}</p>
              <span className="text-green-500 text-xs">+2 this month</span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Active Projects</h3>
              <p className="text-2xl font-bold">{teamStats.active_projects}</p>
              <span className="text-gray-500 text-xs">+1 this week</span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Team Velocity</h3>
              <p className="text-2xl font-bold">{teamStats.velocity}%</p>
              <span className="text-green-500 text-xs">
                +5% from last sprint
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Code Review Rate</h3>
              <p className="text-2xl font-bold">{teamStats.review_rate}%</p>
              <span className="text-green-500 text-xs">+2% from last week</span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h3 className="font-medium mb-4">Team Performance Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="commits" fill="#4263eb" name="Commits" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="card">
        <h3 className="font-medium mb-4">Team Members</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GitHub Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contribution Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        John Doe
                      </div>
                      <div className="text-sm text-gray-500">
                        john.doe@example.com
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Senior Developer</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">johndoe</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">High (45 commits)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Jane Smith
                      </div>
                      <div className="text-sm text-gray-500">
                        jane.smith@example.com
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Frontend Developer
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">janesmith</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Medium (38 commits)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Mike Johnson
                      </div>
                      <div className="text-sm text-gray-500">
                        mike.johnson@example.com
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Backend Developer</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">mikej</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Medium (32 commits)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    On leave
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
