import React from 'react';
import { MicrositeProps } from '../../../types/microsite';
import './EPAnalytics.css';

interface AnalyticsData {
  production: {
    current: number;
    previous: number;
    trend: string;
    data: number[];
  };
  exploration: {
    activeSites: number;
    plannedSites: number;
    successRate: number;
    data: number[];
  };
  costs: {
    operational: number;
    exploration: number;
    maintenance: number;
    total: number;
  };
  environmental: {
    emissions: number;
    target: number;
    reduction: number;
  };
}

const EPAnalytics: React.FC<MicrositeProps> = ({
  config,
  user,
  currentLanguage
}) => {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('month');
  const [selectedChart, setSelectedChart] = React.useState('production');

  React.useEffect(() => {
    // Load analytics data from E&P microsite group
    const loadAnalyticsData = async () => {
      try {
        console.log(`Loading analytics data for EP microsite group: ${config.requiredGroupId}`);
        
        // Simulate loading analytics data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalyticsData({
          production: {
            current: 95.7,
            previous: 92.4,
            trend: 'up',
            data: [85, 87, 89, 92, 94, 96, 95.7]
          },
          exploration: {
            activeSites: 12,
            plannedSites: 8,
            successRate: 78.5,
            data: [8, 9, 10, 11, 12, 12, 12]
          },
          costs: {
            operational: 2.4,
            exploration: 1.8,
            maintenance: 0.6,
            total: 4.8
          },
          environmental: {
            emissions: 45.2,
            target: 50.0,
            reduction: 9.6
          }
        });
      } catch (error) {
        console.error('Failed to load EP analytics data:', error);
      }
    };

    loadAnalyticsData();
  }, [config.requiredGroupId, selectedTimeRange]);

  const timeRanges = [
    { value: 'week', label: currentLanguage === 'en' ? 'This Week' : 'Minggu Ini' },
    { value: 'month', label: currentLanguage === 'en' ? 'This Month' : 'Bulan Ini' },
    { value: 'quarter', label: currentLanguage === 'en' ? 'This Quarter' : 'Suku Tahun Ini' },
    { value: 'year', label: currentLanguage === 'en' ? 'This Year' : 'Tahun Ini' }
  ];

  const chartTypes = [
    { value: 'production', label: currentLanguage === 'en' ? 'Production' : 'Pengeluaran', icon: '📊' },
    { value: 'exploration', label: currentLanguage === 'en' ? 'Exploration' : 'Penerokaan', icon: '🔍' },
    { value: 'costs', label: currentLanguage === 'en' ? 'Costs' : 'Kos', icon: '💰' },
    { value: 'environmental', label: currentLanguage === 'en' ? 'Environmental' : 'Alam Sekitar', icon: '🌱' }
  ];

  const renderChart = () => {
    if (!analyticsData) {
      return (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            {currentLanguage === 'en' ? 'Loading chart data...' : 'Memuatkan data carta...'}
          </div>
        </div>
      );
    }

    switch (selectedChart) {
      case 'production':
        return (
          <div className="chart-content">
            <div className="chart-header">
              <h3>{currentLanguage === 'en' ? 'Production Analytics' : 'Analitik Pengeluaran'}</h3>
              <div className="chart-metrics">
                <div className="metric">
                  <span className="metric-value">{analyticsData.production.current}%</span>
                  <span className="metric-label">{currentLanguage === 'en' ? 'Current Rate' : 'Kadar Semasa'}</span>
                </div>
                <div className="metric">
                  <span className={`metric-trend trend-${analyticsData.production.trend}`}>
                    +{(analyticsData.production.current - analyticsData.production.previous).toFixed(1)}%
                  </span>
                  <span className="metric-label">{currentLanguage === 'en' ? 'vs Previous' : 'vs Sebelum'}</span>
                </div>
              </div>
            </div>
            <div className="chart-placeholder">
              <div className="chart-bars">
                {analyticsData.production.data.map((value, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ height: `${(value / 100) * 200}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'exploration':
        return (
          <div className="chart-content">
            <div className="chart-header">
              <h3>{currentLanguage === 'en' ? 'Exploration Analytics' : 'Analitik Penerokaan'}</h3>
              <div className="chart-metrics">
                <div className="metric">
                  <span className="metric-value">{analyticsData.exploration.activeSites}</span>
                  <span className="metric-label">{currentLanguage === 'en' ? 'Active Sites' : 'Tapak Aktif'}</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{analyticsData.exploration.successRate}%</span>
                  <span className="metric-label">{currentLanguage === 'en' ? 'Success Rate' : 'Kadar Kejayaan'}</span>
                </div>
              </div>
            </div>
            <div className="exploration-grid">
              <div className="exploration-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <div className="card-value">{analyticsData.exploration.activeSites}</div>
                  <div className="card-label">{currentLanguage === 'en' ? 'Active Sites' : 'Tapak Aktif'}</div>
                </div>
              </div>
              <div className="exploration-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <div className="card-value">{analyticsData.exploration.plannedSites}</div>
                  <div className="card-label">{currentLanguage === 'en' ? 'Planned Sites' : 'Tapak Dirancang'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="chart-placeholder">
            <div className="placeholder-text">
              {currentLanguage === 'en' ? 'Chart data will be displayed here' : 'Data carta akan dipaparkan di sini'}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="ep-analytics">
      {/* Controls */}
      <div className="analytics-controls">
        <div className="control-group">
          <label className="control-label">
            {currentLanguage === 'en' ? 'Time Range:' : 'Julat Masa:'}
          </label>
          <select 
            className="control-select"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-tabs">
          {chartTypes.map(chart => (
            <button
              key={chart.value}
              className={`chart-tab ${selectedChart === chart.value ? 'active' : ''}`}
              onClick={() => setSelectedChart(chart.value)}
            >
              <span className="chart-tab-icon">{chart.icon}</span>
              <span className="chart-tab-label">{chart.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="analytics-main">
        <div className="chart-container">
          {renderChart()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-header">
            <div className="summary-icon">⚡</div>
            <div className="summary-title">
              {currentLanguage === 'en' ? 'Performance' : 'Prestasi'}
            </div>
          </div>
          <div className="summary-content">
            <div className="summary-stat">
              <span className="stat-label">{currentLanguage === 'en' ? 'Overall' : 'Keseluruhan'}</span>
              <span className="stat-value good">95.7%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <div className="summary-icon">💰</div>
            <div className="summary-title">
              {currentLanguage === 'en' ? 'Efficiency' : 'Kecekapan'}
            </div>
          </div>
          <div className="summary-content">
            <div className="summary-stat">
              <span className="stat-label">{currentLanguage === 'en' ? 'Cost/Barrel' : 'Kos/Tong'}</span>
              <span className="stat-value">$42.50</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <div className="summary-icon">🌱</div>
            <div className="summary-title">
              {currentLanguage === 'en' ? 'Sustainability' : 'Kelestarian'}
            </div>
          </div>
          <div className="summary-content">
            <div className="summary-stat">
              <span className="stat-label">{currentLanguage === 'en' ? 'Emissions' : 'Pelepasan'}</span>
              <span className="stat-value good">-9.6%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPAnalytics;