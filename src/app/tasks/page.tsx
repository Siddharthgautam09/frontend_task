"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Task, TaskFilters, TaskStatus, TaskPriority, Project } from "@/types";
import apiClient from "@/lib/api";
import {
  formatDate,
  enumToDisplayText,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  X,
  LayoutGrid,
  List,
  SortAsc,
  RefreshCw,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function TasksPage() {
  // Modal logic for details and edit
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const openDetailsModal = (task: Task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTask(null);
  };
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      loadTasks();
      loadProjects();
    }
  }, [user, authLoading, router]);

  // Role-based access control functions
  const canCreateTask = (project?: Project) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!project) return false;
    // Team members can create tasks only in projects they're assigned to
    if (user.role === "team_member") {
      const teamMemberIds = Array.isArray(project.teamMembers)
        ? project.teamMembers.map((tm) =>
            typeof tm === "string" ? tm : tm._id
          )
        : [];
      return teamMemberIds.includes(user._id);
    }
    return false;
  };

  const canEditTask = (task: Task) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members can edit tasks assigned to them, created by them, or in projects they're assigned to
    if (user.role === "team_member") {
      const assignedToId =
        typeof task.assignedTo === "string"
          ? task.assignedTo
          : task.assignedTo?._id;
      const createdById =
        typeof task.createdBy === "string"
          ? task.createdBy
          : task.createdBy?._id;
      if (assignedToId === user._id || createdById === user._id) return true;
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
  };

  const canDeleteTask = (task: Task) => {
    if (!user) return false;
    return user.role === "admin";
  };

  const canViewTask = (task: Task) => {
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
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filters: TaskFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter as TaskStatus;
      if (priorityFilter) filters.priority = priorityFilter as TaskPriority;
      if (projectFilter) filters.projectId = projectFilter;

      const response = await apiClient.getTasks(filters);
      if (response.success && response.data) {
        const tasksData = response.data.tasks || response.data.items || [];
        setTasks(tasksData);
      } else setTasks([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects({});
      if (response.success && response.data) {
        const projectsData =
          response.data.projects || response.data.items || [];
        setProjects(projectsData);
      } else setProjects([]);
    } catch (error) {
      console.error(error);
      setProjects([]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiClient.deleteTask(taskId);
      toast.success("Task deleted successfully");
      loadTasks();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      console.log(`Updating task ${taskId} to status: ${newStatus}`);
      const response = await apiClient.updateTask(taskId, {
        status: newStatus,
      });
      console.log("Update response:", response);
      toast.success("Task status updated");
      loadTasks();
    } catch (error) {
      console.error("Task update error:", error);
      toast.error("Failed to update task status");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // First check if user can view this task
    if (!canViewTask(task)) {
      return false;
    }

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesProject =
      !projectFilter ||
      (typeof task.projectId === "object"
        ? task.projectId._id === projectFilter
        : task.projectId === projectFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const isOverdue = (dueDate: string) =>
    new Date(dueDate) < new Date() &&
    !["completed", "cancelled"].includes(statusFilter);

  const activeFiltersCount = [
    statusFilter,
    priorityFilter,
    projectFilter,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setProjectFilter("");
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  if (!user) return null;

  const kanbanColumns = [
    {
      status: "todo",
      title: "To Do",
      color: "bg-slate-50 border-slate-200",
      count: 0,
    },
    {
      status: "in_progress",
      title: "In Progress",
      color: "bg-blue-50 border-blue-200",
      count: 0,
    },
    {
      status: "review",
      title: "In Review",
      color: "bg-amber-50 border-amber-200",
      count: 0,
    },
    {
      status: "testing",
      title: "Testing",
      color: "bg-purple-50 border-purple-200",
      count: 0,
    },
    {
      status: "completed",
      title: "Completed",
      color: "bg-emerald-50 border-emerald-200",
      count: 0,
    },
    {
      status: "blocked",
      title: "Blocked",
      color: "bg-rose-50 border-rose-200",
      count: 0,
    },
  ];

  const getTaskStats = () => {
    const stats = {
      total: filteredTasks.length,
      completed: filteredTasks.filter((t) => t.status === "completed").length,
      inProgress: filteredTasks.filter((t) => t.status === "in_progress")
        .length,
      overdue: filteredTasks.filter((t) => isOverdue(t.dueDate)).length,
    };
    return stats;
  };

  const stats = getTaskStats();

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900 min-h-screen">
        {/* Header with Stats */}
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-gray-900 shadow-lg border-b border-slate-800/60">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 drop-shadow-lg tracking-tight">
                  Tasks
                </h1>
              </div>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Toolbar and Filters */}
        <main className="max-w-7xl mx-auto px-6 py-6">
                          <p className="text-2xl text-slate-200 mt-1 mb-2">
                  Manage and track your work
                </p>
          <div className="flex gap-6 mt-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex-1">
              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                Total Tasks
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {stats.total}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 flex-1">
              <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                Completed
              </div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                {stats.completed}
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex-1">
              <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                In Progress
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {stats.inProgress}
              </div>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-200 flex-1">
              <div className="text-xs font-medium text-rose-700 uppercase tracking-wide">
                Overdue
              </div>
              <div className="text-2xl font-bold text-rose-900 mt-1">
                {stats.overdue}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm transition-all"
                />
              </div>
              {/* Filters Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                    showFilters || activeFiltersCount > 0
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={loadTasks}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-all"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-800 font-semibold placeholder-gray-500"
                    style={{ minWidth: 140 }}
                  >
                    <option value="" className="text-gray-700 font-semibold">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-800 font-semibold placeholder-gray-500"
                    style={{ minWidth: 140 }}
                  >
                    <option value="" className="text-gray-700 font-semibold">All Projects</option>
                    {(projects || []).map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear filters</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tasks View */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-6">
                {user?.role === "admin"
                  ? "Get started by creating your first task or adjust your filters to see existing tasks."
                  : "No tasks assigned to you yet. Please wait for an admin to assign tasks."}
              </p>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Create Your First Task
                </button>
              )}
            </div>
          ) : viewMode === "list" ? (
            <TaskListView
              tasks={filteredTasks}
              isOverdue={isOverdue}
              updateTaskStatus={updateTaskStatus}
              handleDeleteTask={handleDeleteTask}
              router={router}
              setShowCreateModal={setShowCreateModal}
              canEditTask={canEditTask}
              canDeleteTask={canDeleteTask}
              openDetailsModal={openDetailsModal}
              openEditModal={openEditModal}
            />
          ) : (
            <KanbanView
              columns={kanbanColumns}
              tasks={filteredTasks}
              isOverdue={isOverdue}
              updateTaskStatus={updateTaskStatus}
              router={router}
            />
          )}

          {/* Create Task Modal (admin only) */}
          {user?.role === "admin" && showCreateModal && (
            <CreateTaskModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                loadTasks();
              }}
              projects={projects}
            />
          )}

          {/* Details Modal */}
          {showDetailsModal && selectedTask && (
            <TaskDetailsModal
              task={selectedTask}
              onClose={closeDetailsModal}
            />
          )}

          {/* Edit Modal */}
          {showEditModal && selectedTask && (
            <EditTaskModal
              task={selectedTask}
              onClose={closeEditModal}
              onSuccess={() => {
                closeEditModal();
                loadTasks();
              }}
              projects={projects}
            />
          )}
        </main>
      </div>
    </AppLayout>
  );
}

// Enhanced Task List View
function TaskListView({
  tasks,
  isOverdue,
  updateTaskStatus,
  handleDeleteTask,
  router,
  setShowCreateModal,
  canEditTask,
  canDeleteTask,
  openDetailsModal,
  openEditModal,
}: any) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (!tasks.length)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No tasks found
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Get started by creating your first task or adjust your filters to see
          existing tasks.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Your First Task
        </button>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-5">Task</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
      </div>

      {/* Task Rows */}
      <div className="divide-y divide-gray-100">
        {tasks.map((task: Task) => (
          <div
            key={task._id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer"
            onClick={() => router.push(`/tasks/${task._id}`)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Task Details */}
              <div className="col-span-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h3>
                      {isOverdue(task.dueDate) && (
                        <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Priority Inline */}
              <div className="col-span-4 flex items-center gap-3">
                {canEditTask(task) ? (
                  <div className="relative">
                    <select
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task._id, e.target.value as TaskStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs font-semibold px-3 pr-8 py-1.5 rounded-full border-2 focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${getStatusColor(
                        task.status
                      )}`}
                      title="Update task status"
                      style={{ minWidth: 110 }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="testing">Testing</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    {/* Custom arrow for select */}
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M7 8l3 3 3-3" /></svg>
                  </div>
                ) : (
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {enumToDisplayText(task.status)}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getPriorityColor(
                    task.priority
                  )} text-gray-800 ml-1`}
                >
                  {enumToDisplayText(task.priority)}
                </span>
              </div>

              {/* Due Date */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span
                    className={
                      isOverdue(task.dueDate)
                        ? "text-rose-600 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>

              {/* Actions */}
                <div className="col-span-1 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailsModal(task);
                      }}
                      className="px-2 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                      title="View Details"
                    >
                      Details
                    </button>
                    {/* Edit Button */}
                    {canEditTask(task) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(task);
                        }}
                        className="px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Edit Task"
                      >
                        Edit
                      </button>
                    )}
                    {/* Delete Button */}
                    {canDeleteTask(task) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task._id);
                        }}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Kanban View
function KanbanView({
  columns,
  tasks,
  isOverdue,
  updateTaskStatus,
  router,
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {columns.map((col: any) => {
        const colTasks = tasks.filter((t: Task) => t.status === col.status);
        return (
          <div key={col.status} className="min-w-[280px] lg:min-w-0">
            {/* Column Header */}
            <div
              className={`${col.color} border-2 rounded-lg p-3 mb-3 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {col.title}
                </h3>
                <span className="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="space-y-3">
              {colTasks.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-xs text-gray-400 font-medium">No tasks</p>
                </div>
              ) : (
                colTasks.map((task: Task) => (
                  <div
                    key={task._id}
                    onClick={() => router.push(`/tasks/${task._id}`)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h4>
                      {isOverdue(task.dueDate) && (
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {enumToDisplayText(task.priority)}
                      </span>

                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          isOverdue(task.dueDate)
                            ? "text-rose-600 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Enhanced Create Task Modal
function CreateTaskModal({ onClose, onSuccess, projects }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?._id || "");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.createTask({
        title,
        description,
        projectId,
        priority,
        status,
        dueDate,
        tags: [],
        dependencies: [],
      });
      toast.success("Task created successfully");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe the task in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              >
                {(projects || []).map((p: Project) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal to view task details
function TaskDetailsModal({ task, onClose }: { task: Task; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 text-base mb-2 font-medium">{task.description}</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Due Date:</span>
              <span className="text-gray-900 font-medium">{formatDate(task.dueDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Priority:</span>
              <span className="text-gray-900 font-medium">{enumToDisplayText(task.priority)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className="text-gray-900 font-medium">{enumToDisplayText(task.status)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Project:</span>
              <span className="text-gray-900 font-medium">
                {typeof task.projectId === "object" ? task.projectId.title : task.projectId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Assigned To:</span>
              <span className="text-gray-900 font-medium">
                {typeof task.assignedTo === "object" 
                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` 
                  : task.assignedTo || "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Created By:</span>
              <span className="text-gray-900 font-medium">
                {typeof task.createdBy === "object" 
                  ? `${task.createdBy.firstName} ${task.createdBy.lastName}` 
                  : task.createdBy || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Created:</span>
              <span className="text-gray-900 font-medium">{formatDate(task.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Updated:</span>
              <span className="text-gray-900 font-medium">{formatDate(task.updatedAt)}</span>
            </div>
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                <span className="font-semibold text-gray-700">Tags:</span>
                {task.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded ml-2">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal to edit task details
function EditTaskModal({ 
  task, 
  onClose, 
  onSuccess, 
  projects 
}: { 
  task: Task; 
  onClose: () => void; 
  onSuccess: () => void; 
  projects: Project[] 
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [projectId, setProjectId] = useState(
    typeof task.projectId === "object" ? task.projectId._id : task.projectId || ""
  );
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setIsSubmitting(true);
      await apiClient.updateTask(task._id, {
        title,
        description,
        projectId,
        priority,
        status,
        dueDate,
      });
      toast.success("Task updated successfully");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none text-black"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                {(projects || []).map((p: Project) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
