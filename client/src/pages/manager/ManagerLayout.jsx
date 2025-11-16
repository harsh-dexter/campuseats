import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Utensils, Settings } from 'lucide-react';

const ManagerLayout = () => {
  const activeClass = 'bg-primary-light/10 text-primary';
  const inactiveClass = 'text-gray-600 hover:bg-gray-100';

  return (
    <div>
      {/* Manager Sub-navigation */}
      <nav className="flex items-center gap-2 mb-6 border-b border-gray-200">
        <NavLink
          to="/manager/dashboard"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>Orders</span>
        </NavLink>
        <NavLink
          to="/manager/menu"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <Utensils size={18} />
          <span>Menu</span>
        </NavLink>
        <NavLink
          to="/manager/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default ManagerLayout;