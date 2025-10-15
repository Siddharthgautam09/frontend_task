'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login' as any);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tasks page with search query
      router.push(`/tasks?search=${encodeURIComponent(searchQuery.trim())}` as any);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      current: pathname === '/projects',
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      current: pathname === '/tasks',
    },
  ];

  if (!user) {
    return <>{children}</>;
  }

  return (
  <div className="min-h-screen bg-neutral-50 text-slate-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}> 
        <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setSidebarOpen(false)} />
  <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-2xl rounded-r-3xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/60">
            <span className="font-bold text-xl text-white tracking-wide flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-white" />
              MetaUpSpace
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-white"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href as any);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-700/80 text-white shadow-lg'
                      : 'text-white hover:bg-blue-800/80 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 text-white`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-slate-800/60 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-blue-100">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  router.push('/profile' as any);
                  setSidebarOpen(false);
                }}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-600 hover:text-white"
              >
                <User className="mr-3 h-5 w-5 text-white group-hover:text-white" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-600 hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5 text-white group-hover:text-white" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
        <div className="flex flex-col flex-grow bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-r border-blue-300/60 rounded-br-3xl">
          <div className="flex h-20 items-center px-6 border-b border-blue-300/60">
            <span className="font-bold text-xl text-white tracking-wide flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-white" />
              MetaUpSpace
            </span>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href as any);
                  }}
                  className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-800/80 text-white shadow-lg'
                      : 'text-white hover:bg-blue-800/50 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 text-white`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-blue-300/60 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-blue-100">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => router.push('/profile' as any)}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                <User className="mr-3 h-5 w-5 text-white group-hover:text-white" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5 text-white group-hover:text-white" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 bg-neutral-50 min-h-screen">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-40 lg:hidden">
          <div className="flex h-20 items-center gap-x-4 border-b border-blue-300/60 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 sm:px-6 shadow-lg sm:gap-x-6">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
            <div className="h-6 w-px bg-blue-300/60 lg:hidden" />
            <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6 items-center">
              <div className="flex items-center">
                <span className="font-bold text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  <span className="hidden sm:inline">MetaUpSpace</span>
                </span>
              </div>
              <div className="flex-1 flex justify-center">
                <form onSubmit={handleSearch} className="w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-blue-300/60 bg-blue-800/50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                  />
                </form>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => router.push('/analytics' as any)}
                  className="rounded-full bg-blue-800/50 p-2 hover:bg-blue-900/50 transition"
                  title="Analytics"
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button 
                  onClick={() => router.push('/profile' as any)}
                  className="rounded-full bg-blue-800/50 p-2 hover:bg-blue-900/50 transition"
                  title="Profile"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button
                  onClick={() => router.push('/profile' as any)}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-700 flex items-center justify-center shadow-lg hover:bg-blue-800 transition"
                  title="Profile"
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}