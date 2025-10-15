"use client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/types";
import apiClient from "@/lib/api";
import { formatDate, enumToDisplayText, getPriorityColor, getStatusColor } from "@/lib/utils";
import { Calendar, AlertCircle } from "lucide-react";

export default function TaskDetailsPage({ params }: { params: { taskId: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await apiClient.getTask(params.taskId);
        if (res.success && res.data && res.data.task) {
          setTask(res.data.task);
        } else {
          setTask(null);
        }
      } catch {
        setTask(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [params.taskId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!task) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow border border-gray-200 mt-8">
      <button
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm font-medium"
        onClick={() => router.push('/tasks')}
      >
        ← Back to Tasks
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="flex gap-4 mb-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>{enumToDisplayText(task.status)}</span>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>{enumToDisplayText(task.priority)}</span>
        <span className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(task.dueDate)}</span>
        </span>
        {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed" && (
          <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-2">Assigned To: {typeof task.assignedTo === "object" ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : task.assignedTo || "Unassigned"}</div>
      <div className="text-sm text-gray-500 mb-2">Created By: {typeof task.createdBy === "object" ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : task.createdBy || "Unknown"}</div>
      <div className="text-sm text-gray-500 mb-2">Project: {typeof task.projectId === "object" ? task.projectId.title : task.projectId || "Unknown"}</div>
    </div>
  );
}
