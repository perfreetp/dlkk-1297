import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const pageTitles: Record<string, string> = {
  '/': '仪表盘',
  '/revenue': '收入流水',
  '/experiments': '实验记录',
  '/reviews': '复盘文章',
  '/groups': '同行小组'
};

export function Header() {
  const location = useLocation();
  const { state } = useApp();
  const title = pageTitles[location.pathname] || '复盘台';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
            />
          </div>

          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {state.user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{state.user.name}</p>
                <p className="text-xs text-gray-500">{state.user.email}</p>
              </div>
              <img
                src={state.user.avatar}
                alt={state.user.name}
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
