import React from 'react';
import { MicrositeProps } from '../../../types/microsite';
import './EPDashboard.css';

const EPDashboard: React.FC<MicrositeProps> = ({
  config,
  user,
  currentLanguage
}) => {
  const [stats, setStats] = React.useState({
    totalProjects: 0,
    activeWells: 0,
    productionRate: 0,
    lastUpdate: new Date()
  });

  React.useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      // This would fetch real data from your ArcGIS Enterprise group
      // using the group ID: 4a8b631d6f384dd8b8ca5b91c10c22f6
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalProjects: 24,
        activeWells: 156,
        productionRate: 95.7,
        lastUpdate: new Date()
      });
    };

    loadDashboardData();
  }, [config.requiredGroupId]);

  const dashboardCards = [
    {
      title: currentLanguage === 'en' ? 'Total Projects' : 'Jumlah Projek',
      value: stats.totalProjects.toString(),
      icon: '🎯',
      color: config.theme.primary,
      change: '+3 this month'
    },
    {
      title: currentLanguage === 'en' ? 'Active Wells' : 'Telaga Aktif',
      value: stats.activeWells.toString(),
      icon: '⛽',
      color: config.theme.secondary,
      change: '+12 this week'
    },
    {
      title: currentLanguage === 'en' ? 'Production Rate' : 'Kadar Pengeluaran',
      value: `${stats.productionRate}%`,
      icon: '📊',
      color: config.theme.accent,
      change: '+2.3% today'
    },
    {
      title: currentLanguage === 'en' ? 'Last Update' : 'Kemaskini Terakhir',
      value: stats.lastUpdate.toLocaleDateString(),
      icon: '🔄',
      color: '#95a5a6',
      change: 'Real-time'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: currentLanguage === 'en' ? 'New seismic survey completed' : 'Tinjauan seismik baru selesai',
      time: '2 hours ago',
      type: 'survey'
    },
    {
      id: 2,
      title: currentLanguage === 'en' ? 'Well PKG-15 production updated' : 'Pengeluaran telaga PKG-15 dikemaskini',
      time: '4 hours ago',
      type: 'production'
    },
    {
      id: 3,
      title: currentLanguage === 'en' ? 'Environmental assessment filed' : 'Penilaian alam sekitar difailkan',
      time: '1 day ago',
      type: 'environment'
    }
  ];

  return (
    <div className="ep-dashboard">
      {/* Quick Stats */}
      <div className="dashboard-section">
        <h2 className="section-title">
          {currentLanguage === 'en' ? 'Quick Overview' : 'Gambaran Pantas'}
        </h2>
        <div className="stats-grid">
          {dashboardCards.map((card, index) => (
            <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
              <div className="stat-header">
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-title">{card.title}</div>
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-change">{card.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-section">
        <h2 className="section-title">
          {currentLanguage === 'en' ? 'Recent Activities' : 'Aktiviti Terkini'}
        </h2>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-type activity-type--${activity.type}`}></div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">
          {currentLanguage === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}
        </h2>
        <div className="actions-grid">
          <button className="action-button">
            <span className="action-icon">🗺️</span>
            <span className="action-label">
              {currentLanguage === 'en' ? 'View Maps' : 'Lihat Peta'}
            </span>
          </button>
          <button className="action-button">
            <span className="action-icon">📈</span>
            <span className="action-label">
              {currentLanguage === 'en' ? 'Analytics' : 'Analitik'}
            </span>
          </button>
          <button className="action-button">
            <span className="action-icon">📋</span>
            <span className="action-label">
              {currentLanguage === 'en' ? 'Reports' : 'Laporan'}
            </span>
          </button>
          <button className="action-button">
            <span className="action-icon">⚙️</span>
            <span className="action-label">
              {currentLanguage === 'en' ? 'Settings' : 'Tetapan'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EPDashboard;