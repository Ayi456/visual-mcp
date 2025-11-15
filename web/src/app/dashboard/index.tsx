/**
 * Dashboard路由入口
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardList from './components/DashboardList';
import DashboardEditor from './components/DashboardEditor';

const DashboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardList />} />
      <Route path="/:id" element={<DashboardEditor />} />
    </Routes>
  );
};

export default DashboardRoutes;
