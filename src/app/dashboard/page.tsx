"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { DashboardAnalytics, Project, Task, User } from "@/types";
import apiClient from "@/lib/api";
import {
  formatDate,
  enumToDisplayText,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";
import AppLayout from "@/components/AppLayout";
import DashboardLineChart from "@/components/DashboardLineChart";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login" as any);
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");

      // Load analytics, projects, and tasks in parallel
      const [analyticsRes, projectsRes, tasksRes] = await Promise.all([
        apiClient.getDashboardAnalytics(),
        apiClient.getProjects({ limit: 100 }),
        apiClient.getTasks({ limit: 100 }),
      ]);

      console.log("Analytics response:", analyticsRes);
      console.log("Projects response:", projectsRes);
      console.log("Tasks response:", tasksRes);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }

      // Ensure we always set arrays to avoid runtime errors if API returns unexpected shapes
      if (projectsRes && (projectsRes as any).data) {
        // support both shapes: { data: { items: [...] } } and { items: [...] }
        const items =
          (projectsRes as any).data?.projects ??
          (projectsRes as any).data?.items ??
          (projectsRes as any).items ??
          [];
        console.log("Projects items:", items);
        setProjects(Array.isArray(items) ? items : []);
      } else {
        setProjects([]);
      }

      if (tasksRes && (tasksRes as any).data) {
        const items =
          (tasksRes as any).data?.tasks ??
          (tasksRes as any).data?.items ??
          (tasksRes as any).items ??
          [];
        console.log("Tasks items:", items);
        setTasks(Array.isArray(items) ? items : []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Role-based data filtering
  const filteredProjects = projects.filter((project) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members can only view projects they're assigned to
    if (user.role === "team_member") {
      const teamMemberIds = Array.isArray(project.teamMembers)
        ? project.teamMembers.map((tm) =>
            typeof tm === "string" ? tm : tm._id
          )
        : [];
      return teamMemberIds.includes(user._id);
    }
    return false;
  });

  const filteredTasks = tasks.filter((task) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members can view tasks assigned to them or in projects they're assigned to
    if (user.role === "team_member") {
      const assignedToId =
        typeof task.assignedTo === "string"
          ? task.assignedTo
          : task.assignedTo?._id;
      if (assignedToId === user._id) return true;

      // Check if user is in the project team
      const project = projects.find(
        (p) =>
          p._id ===
          (typeof task.projectId === "string"
            ? task.projectId
            : task.projectId?._id)
      );
      if (project) {
        const teamMemberIds = Array.isArray(project.teamMembers)
          ? project.teamMembers.map((tm) =>
              typeof tm === "string" ? tm : tm._id
            )
          : [];
        return teamMemberIds.includes(user._id);
      }
    }
    return false;
  });

  // Helper function to get user name
  const getUserName = (userObj: User | string | undefined) => {
    if (!userObj) return "Unassigned";
    if (typeof userObj === "string") return "Unknown";
    return `${userObj.firstName} ${userObj.lastName}`;
  };

  // Helper function to get project title
  const getProjectTitle = (projectObj: any) => {
    if (!projectObj) return "Unknown Project";
    if (typeof projectObj === "string") return projectObj;
    return projectObj.title;
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900 min-h-screen">
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-gray-900 shadow-lg border-b border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1.5 bg-indigo-800 text-indigo-200 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {enumToDisplayText(user.role)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

          <p className="text-2xl text-slate-300 mb-12">
            Welcome back, {user.firstName}!{" "}
            {user.role === "admin"
              ? " Manage your organization."
              : " View your assigned work."}
          </p>

          {analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 mt-8">
                <div className="group bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl hover:shadow-2xl p-8 border border-slate-200 transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-xs font-normal text-black uppercase tracking-wider mb-2">
                        Total Projects
                      </p>
                      <p className="text-4xl font-normal text-black">
                        {analytics.overview.totalProjects}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl hover:shadow-2xl p-8 border border-slate-200 transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-xs font-normal text-black uppercase tracking-wider mb-2">
                        Total Tasks
                      </p>
                      <p className="text-4xl font-normal text-black">
                        {analytics.overview.totalTasks}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl hover:shadow-2xl p-8 border border-slate-200 transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-xs font-normal text-black uppercase tracking-wider mb-2">
                        Completed Tasks
                      </p>
                      <p className="text-4xl font-normal text-black">
                        {analytics.overview.completedTasks}
                      </p>
                      <p className="text-xs text-black mt-2 font-normal">
                        {analytics.overview.completionRate.toFixed(1)}%
                        completion rate
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-700 to-green-900 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl hover:shadow-2xl p-8 border border-slate-200 transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-xs font-normal text-black uppercase tracking-wider mb-2">
                        Overdue Tasks
                      </p>
                      <p className="text-4xl font-normal text-black">
                        {analytics.overview.overdueTasks}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-red-700 to-red-900 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Section - Detailed Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Task Status Chart with Details */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl p-8 border border-slate-200">
                  <h3 className="text-xl font-normal text-black mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-700 to-purple-700 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    Tasks by Status
                  </h3>
                  <div className="space-y-4">
                    {analytics.taskStats.map((stat) => {
                      const statusTasks = filteredTasks.filter(
                        (t) => t.status === stat._id
                      );
                      const percentage =
                        analytics.overview.totalTasks > 0
                          ? (
                              (stat.count / analytics.overview.totalTasks) *
                              100
                            ).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={stat._id}
                          className="border-b border-gray-100 pb-3 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                  getStatusColor(stat._id).split(" ")[2]
                                }`}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {enumToDisplayText(stat._id)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({percentage}%)
                            </span>
                          </div>
                          {stat.totalEstimatedHours && (
                            <div className="ml-6 text-xs text-gray-500">
                              Est: {stat.totalEstimatedHours}h
                              {stat.totalActualHours &&
                                ` | Actual: ${stat.totalActualHours}h`}
                            </div>
                          )}
                          {statusTasks.length > 0 &&
                            statusTasks.length <= 3 && (
                              <div className="ml-6 mt-1 space-y-1">
                                {statusTasks.slice(0, 3).map((task) => (
                                  <div
                                    key={task._id}
                                    className="text-xs text-gray-600 truncate"
                                  >
                                    • {task.title}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Distribution with Details */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl p-8 border border-slate-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-red-500">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Tasks by Priority
                  </h3>
                  <div className="space-y-4">
                    {analytics.priorityStats.map((stat) => {
                      const priorityTasks = filteredTasks.filter(
                        (t) => t.priority === stat._id
                      );
                      const percentage =
                        analytics.overview.totalTasks > 0
                          ? (
                              (stat.count / analytics.overview.totalTasks) *
                              100
                            ).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={stat._id}
                          className="border-b border-gray-100 pb-3 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                  getPriorityColor(stat._id).split(" ")[2]
                                }`}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {enumToDisplayText(stat._id)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({percentage}%)
                            </span>
                          </div>
                          {priorityTasks.length > 0 &&
                            priorityTasks.length <= 3 && (
                              <div className="ml-6 mt-1 space-y-1">
                                {priorityTasks.slice(0, 3).map((task) => (
                                  <div
                                    key={task._id}
                                    className="text-xs text-gray-600 truncate"
                                  >
                                    • {task.title}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Project Status with Details */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl p-8 border border-slate-200">
                  <h3 className="text-xl font-normal text-black mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-700 to-teal-700 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    Projects by Status
                  </h3>
                  <div className="space-y-4">
                    {analytics.projectStats.map((stat) => {
                      const statusProjects = filteredProjects.filter(
                        (p) => p.status === stat._id
                      );
                      const percentage =
                        analytics.overview.totalProjects > 0
                          ? (
                              (stat.count / analytics.overview.totalProjects) *
                              100
                            ).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={stat._id}
                          className="border-b border-gray-100 pb-3 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                  getStatusColor(stat._id).split(" ")[2]
                                }`}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {enumToDisplayText(stat._id)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({percentage}%)
                            </span>
                          </div>
                          {statusProjects.length > 0 &&
                            statusProjects.length <= 3 && (
                              <div className="ml-6 mt-1 space-y-1">
                                {statusProjects.slice(0, 3).map((project) => (
                                  <div
                                    key={project._id}
                                    className="text-xs text-gray-600 truncate"
                                  >
                                    • {project.title}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Team Workload (for admins and managers) */}
              {analytics.teamWorkload && analytics.teamWorkload.length > 0 && (
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl shadow-xl border border-slate-200 mb-12">
                  <div className="px-8 py-6 border-b border-slate-200">
                    <h3 className="text-xl font-normal text-black flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-700 to-purple-700 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      Team Workload
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-neutral-100/80">
                        <tr>
                          <th className="px-8 py-4 text-left text-xs font-normal text-black uppercase tracking-wider">
                            Team Member
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-normal text-black uppercase tracking-wider">
                            Total Tasks
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-normal text-black uppercase tracking-wider">
                            In Progress
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-normal text-black uppercase tracking-wider">
                            Completed
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-normal text-black uppercase tracking-wider">
                            Overdue
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-normal text-black uppercase tracking-wider">
                            Completion Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-neutral-50/60 divide-y divide-slate-200/30">
                        {analytics.teamWorkload.map((member) => (
                          <tr key={member.userId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {member.userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.userEmail}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {member.totalTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600">
                              {member.inProgressTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">
                              {member.completedTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                              {member.overdueTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`text-sm font-medium ${
                                  member.completionRate >= 80
                                    ? "text-green-600"
                                    : member.completionRate >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {member.completionRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
          {/* Analytics Line Chart Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Analytics Overview
            </h3>
            <div className="w-full h-[320px]">
              {/* Line chart for analytics */}
              <DashboardLineChart />
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
