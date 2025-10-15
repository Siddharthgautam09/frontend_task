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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900 text-slate-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900 shadow-2xl rounded-r-3xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/60">
            <span className="font-bold text-xl text-indigo-300 tracking-wide flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-indigo-400" />
              MetaUpSpace
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-indigo-300"
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
                      ? 'bg-indigo-700/80 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-indigo-300'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      item.current ? 'text-indigo-300' : 'text-slate-500 group-hover:text-indigo-300'
                    }`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-slate-800/60 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-indigo-100">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  router.push('/profile' as any);
                  setSidebarOpen(false);
                }}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-br from-slate-900 via-indigo-950 to-gray-900 border-r border-slate-800/60 rounded-r-3xl">
          <div className="flex h-20 items-center px-6 border-b border-slate-800/60">
            <span className="font-bold text-xl text-indigo-300 tracking-wide flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-indigo-400" />
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
                      ? 'bg-indigo-700/80 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-indigo-300'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      item.current ? 'text-indigo-300' : 'text-slate-500 group-hover:text-indigo-300'
                    }`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-slate-800/60 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-indigo-100">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => router.push('/profile' as any)}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
  <div className="lg:pl-72">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-40 lg:hidden">
          <div className="flex h-20 items-center gap-x-4 border-b border-slate-800/60 bg-gradient-to-r from-slate-900 via-indigo-950 to-gray-900 px-6 shadow-lg sm:gap-x-6">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-7 w-7" />
            </button>
            <div className="h-7 w-px bg-slate-700 lg:hidden" />
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
              <div className="flex items-center">
                <span className="font-bold text-xl text-indigo-300 tracking-wide flex items-center gap-2">
                  <LayoutDashboard className="w-7 h-7 text-indigo-400" />
                  MetaUpSpace
                </span>
              </div>
              <div className="flex-1 flex justify-center">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full max-w-xs px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-800 shadow"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="rounded-full bg-slate-800 p-2 hover:bg-indigo-900 transition">
                  <BarChart3 className="w-5 h-5 text-slate-300" />
                </button>
                <button className="rounded-full bg-slate-800 p-2 hover:bg-indigo-900 transition">
                  <User className="w-5 h-5 text-slate-300" />
                </button>
                <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}