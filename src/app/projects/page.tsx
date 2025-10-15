"use client";

import React from "react";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Project,
  ProjectFilters,
  ProjectStatus,
  ProjectPriority,
  User,
} from "@/types";
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
  Users,
  Calendar,
  DollarSign,
  X,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Use current user as manager if admin
  const managerId = user?._id || "";
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ProjectStatus | "all">("all");

  // Modal logic for details and edit
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const openDetailsModal = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProject(null);
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      loadProjects();
    }
  }, [user, authLoading, router]);

  // Role-based access control functions
  const canCreateProject = user?.role === "admin";

  const canEditProject = (project: Project) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members can edit project status if they're assigned to the project
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

  const canDeleteProject = (project: Project) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members cannot delete projects
    return false;
  };

  const canViewProject = (project: Project) => {
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
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters: ProjectFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter as ProjectStatus;
      if (priorityFilter) filters.priority = priorityFilter as ProjectPriority;

      const response = await apiClient.getProjects(filters);
      console.log("Projects API response:", response);
      if (response.success && response.data) {
        const projectsData =
          response.data.projects || response.data.items || [];
        console.log("Projects data:", projectsData);
        setProjects(projectsData);
      } else {
        console.log("No projects data in response");
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteProject(projectId);
      toast.success("Project deleted successfully");
      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleUpdateProjectStatus = async (
    projectId: string,
    newStatus: ProjectStatus
  ) => {
    try {
      await apiClient.updateProject(projectId, { status: newStatus });
      toast.success("Project status updated successfully");
      loadProjects();
    } catch (error) {
      console.error("Failed to update project status:", error);
      toast.error("Failed to update project status");
    }
  };

  const filteredProjects = projects.filter((project) => {
    // First check if user can view this project
    if (!canViewProject(project)) {
      return false;
    }

    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority =
      !priorityFilter || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900 min-h-screen">
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-gray-900 shadow-lg border-b border-slate-800/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 drop-shadow-lg tracking-tight">
                  Projects
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {canCreateProject && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md border border-indigo-400/30 flex items-center gap-2 font-bold hover:scale-105 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
          <p className="text-2xl text-slate-300 mt-1 mb-10 font-medium drop-shadow-sm">
            {user.role === "admin"
              ? "Manage your team projects"
              : "View your assigned projects"}
          </p>
          {/* Filters */}
          <div className=" rounded-lg p-6 mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-gray-900 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                </div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="pl-5 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none bg-white relative"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button
                onClick={loadProjects}
                className="flex items-center space-x-2 px-4 py-2 text-slate-200 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-6">
                {canCreateProject
                  ? "Get started by creating your first project."
                  : "No projects match your current filters."}
              </p>
              {canCreateProject && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between min-h-[340px]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {canEditProject(project) ? (
                          <div className="relative">
                            <select
                              value={project.status}
                              onChange={(e) =>
                                handleUpdateProjectStatus(
                                  project._id,
                                  e.target.value as ProjectStatus
                                )
                              }
                              className={`px-3 pr-8 py-1.5 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${getStatusColor(
                                project.status
                              )}`}
                              title="Update project status"
                            >
                              <option value="planning">Planning</option>
                              <option value="in_progress">In Progress</option>
                              <option value="testing">Testing</option>
                              <option value="completed">Completed</option>
                              <option value="on_hold">On Hold</option>
                            </select>
                            {/* Custom arrow for select */}
                            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M7 8l3 3 3-3" /></svg>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {enumToDisplayText(project.status)}
                          </span>
                        )}
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${getPriorityColor(
                            project.priority
                          )} text-gray-800 ml-1`}
                        >
                          {enumToDisplayText(project.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Details Button */}
                      <button
                        onClick={() => openDetailsModal(project)}
                        className="px-2 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                        title="View Details"
                      >
                        Details
                      </button>
                      
                      {/* Edit Button */}
                      {canEditProject(project) && (
                        <button
                          onClick={() => openEditModal(project)}
                          className="px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Edit Project"
                        >
                          Edit
                        </button>
                      )}
                      
                      {/* Delete Button */}
                      {canDeleteProject(project) && (
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-base mb-4 line-clamp-3 font-medium">
                    {project.description}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline:</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatDate(project.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Team:</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {project.teamMembers?.length || 0} members
                      </span>
                    </div>
                    {project.estimatedHours && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Estimated Hours:</span>
                        <span className="font-medium text-gray-900">
                          {project.estimatedHours}h
                        </span>
                      </div>
                    )}
                    {project.actualHours && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Actual Hours:</span>
                        <span className="font-medium text-gray-900">
                          {project.actualHours}h
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Manager:</span>
                        <span className="font-medium">
                          {typeof project.managerId === "object"
                            ? `${project.managerId.firstName} ${project.managerId.lastName}`
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                    {project.tags && project.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadProjects();
            }}
          />
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            onClose={closeDetailsModal}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProject && (
          <EditProjectModal
            project={selectedProject}
            onClose={closeEditModal}
            onSuccess={() => {
              closeEditModal();
              loadProjects();
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

// Enhanced Create Project Modal
function CreateProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(ProjectPriority.MEDIUM);
  const [status, setStatus] = useState(ProjectStatus.PLANNING);
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Use current user as manager if admin
  const { user } = useAuth();
  const managerId = user?._id || "";

  useEffect(() => {
    // Fetch all users for team assignment
    const fetchUsers = async () => {
      try {
        const res = await apiClient.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.createProject({
        title,
        description,
        deadline,
        priority,
        status,
        managerId,
        teamMembers: selectedTeamMembers,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Project created successfully");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Create New Project
            </h2>
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
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter project title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe the project in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none text-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags separated by commas..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign Team Members
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {users
                .filter((u) => u.role !== "admin")
                .map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={u._id}
                      checked={selectedTeamMembers.includes(u._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeamMembers([
                            ...selectedTeamMembers,
                            u._id,
                          ]);
                        } else {
                          setSelectedTeamMembers(
                            selectedTeamMembers.filter((id) => id !== u._id)
                          );
                        }
                      }}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {u.firstName} {u.lastName} ({u.email})
                    </span>
                  </label>
                ))}
              {users.filter((u) => u.role !== "admin").length === 0 && (
                <p className="text-sm text-gray-500 p-2">
                  No team members available
                </p>
              )}
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
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal to view project details
function ProjectDetailsModal({ 
  project, 
  onClose 
}: { 
  project: Project; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h3>
            {project.description && (
              <p className="text-gray-600 text-base mb-2 font-medium">{project.description}</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Deadline:</span>
              <span className="text-gray-900 font-medium">{formatDate(project.deadline)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Team:</span>
              <span className="text-gray-900 font-medium">{project.teamMembers?.length || 0} members</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Priority:</span>
              <span className="text-gray-900 font-medium">{enumToDisplayText(project.priority)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className="text-gray-900 font-medium">{enumToDisplayText(project.status)}</span>
            </div>
            {project.estimatedHours && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Estimated Hours:</span>
                <span className="text-gray-900 font-medium">{project.estimatedHours}h</span>
              </div>
            )}
            {project.actualHours && (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Actual Hours:</span>
                <span className="text-gray-900 font-medium">{project.actualHours}h</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Manager:</span>
              <span className="text-gray-900 font-medium">
                {typeof project.managerId === "object"
                  ? `${project.managerId.firstName} ${project.managerId.lastName}`
                  : "Unknown"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Created:</span>
              <span className="text-gray-900 font-medium">{formatDate(project.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Updated:</span>
              <span className="text-gray-900 font-medium">{formatDate(project.updatedAt)}</span>
            </div>
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                <span className="font-semibold text-gray-700">Tags:</span>
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded ml-2">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal to edit project details
function EditProjectModal({ 
  project, 
  onClose, 
  onSuccess 
}: { 
  project: Project; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [deadline, setDeadline] = useState(
    project.deadline ? project.deadline.slice(0, 10) : ""
  );
  const [priority, setPriority] = useState(project.priority);
  const [status, setStatus] = useState(project.status);
  const [estimatedHours, setEstimatedHours] = useState(
    project.estimatedHours ? String(project.estimatedHours) : ""
  );
  const [tags, setTags] = useState(
    project.tags ? project.tags.join(", ") : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    Array.isArray(project.teamMembers) 
      ? project.teamMembers.map((tm) => typeof tm === "string" ? tm : tm._id) 
      : []
  );

  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.updateProject(project._id, {
        title,
        description,
        deadline,
        priority,
        status,
        teamMembers: selectedTeamMembers,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast.success("Project updated successfully");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
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
              Project Title <span className="text-rose-500">*</span>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as ProjectPriority)} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as ProjectStatus)} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white text-black"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Hours</label>
              <input 
                type="number" 
                value={estimatedHours} 
                onChange={(e) => setEstimatedHours(e.target.value)} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black" 
                placeholder="e.g., 40" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <input 
              type="text" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-black" 
              placeholder="Enter tags separated by commas..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Team Members</label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {users.filter((u) => u.role !== "admin").map((u) => (
                <label 
                  key={u._id} 
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input 
                    type="checkbox" 
                    value={u._id} 
                    checked={selectedTeamMembers.includes(u._id)} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeamMembers([...selectedTeamMembers, u._id]);
                      } else {
                        setSelectedTeamMembers(selectedTeamMembers.filter((id) => id !== u._id));
                      }
                    }} 
                    className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                  <span className="text-sm text-gray-700">
                    {u.firstName} {u.lastName} ({u.email})
                  </span>
                </label>
              ))}
              {users.filter((u) => u.role !== "admin").length === 0 && (
                <p className="text-sm text-gray-500 p-2">No team members available</p>
              )}
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