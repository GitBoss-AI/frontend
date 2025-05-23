"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart,
  Users,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Builds & Deployments", href: "/analytics", icon: BarChart },
  { label: "AI Assistant", href: "/chat", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "http://localhost:3001/dev";
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="font-bold text-xl">GitBoss AI</h1>
      </div>
      <nav className="mt-6 flex-1">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 w-full"
        >
          <LogOut className="w-5 h-5 mr-3"/>
          Logout
        </button>
      </div>
    </div>
  );
}
