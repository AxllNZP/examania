// src/components/layout/DashboardLayout.jsx
'use client';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, userName, userRole }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <Navbar userName={userName} userRole={userRole} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}