import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ArrowLeftIcon, EyeIcon, MousePointerClickIcon, ActivityIcon,
  Loader2Icon, TrendingUpIcon, TrendingDownIcon, ClockIcon,
  MonitorIcon, SmartphoneIcon, TabletIcon, GlobeIcon, RefreshCwIcon
} from 'lucide-react';
import api from '@/configs/axios';
import { toast } from 'sonner';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  clickRate: string | number;
  avgDuration: number;
  viewsChange: string | null;
  clicksChange: string | null;
  viewsPerDay: { date: string; views: number }[];
  clicksPerDay: { date: string; clicks: number }[];
  topDevices: { name: string; value: number }[];
  topReferrers: { name: string; value: number }[];
  topCountries: { name: string; value: number }[];
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const DeviceIcon = ({ device }: { device: string }) => {
  if (device === 'Mobile') return <SmartphoneIcon className="size-4" />;
  if (device === 'Tablet') return <TabletIcon className="size-4" />;
  return <MonitorIcon className="size-4" />;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const AnalyticsDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState('7');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/analytics/summary/${projectId}?range=${range}`);
      setData(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2Icon className="size-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-500">
        <p className="text-xl">Analytics data could not be loaded.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Go Back
        </button>
      </div>
    );
  }

  const { totalViews, totalClicks, clickRate, avgDuration, viewsChange, clicksChange, viewsPerDay, clicksPerDay, topDevices, topReferrers, topCountries } = data;
  const hasData = totalViews > 0 || totalClicks > 0;
  const peakViewDay = viewsPerDay.reduce((prev, current) => (prev.views > current.views ? prev : current), { date: '', views: 0 });

  const ChangeTag = ({ value }: { value: string | null }) => {
    if (!value) return null;
    const num = parseFloat(value);
    const isPositive = num >= 0;
    return (
      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
        {isPositive ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
        {isPositive ? '+' : ''}{value}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/projects')} className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ArrowLeftIcon className="size-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Analytics Overview</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track the performance and engagement of your published website.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Date Range */}
            <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 gap-1">
              {['7', '30', '90'].map((d) => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${range === d ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
                >
                  {d}d
                </button>
              ))}
            </div>
            {/* Refresh */}
            <button onClick={fetchAnalytics} className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <RefreshCwIcon className="size-4" />
            </button>
          </div>
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <ActivityIcon className="size-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium">No analytics data yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm text-center">
              Publish your website and start driving traffic to see interactive charts and statistics here.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Views */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</span>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <EyeIcon className="size-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h2 className="text-3xl font-bold tracking-tight">{totalViews.toLocaleString()}</h2>
                  <ChangeTag value={viewsChange} />
                </div>
                <p className="text-xs text-gray-400 mt-1">vs previous {range} days</p>
              </div>

              {/* Clicks */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <MousePointerClickIcon className="size-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h2 className="text-3xl font-bold tracking-tight">{totalClicks.toLocaleString()}</h2>
                  <ChangeTag value={clicksChange} />
                </div>
                <p className="text-xs text-gray-400 mt-1">vs previous {range} days</p>
              </div>

              {/* Click Rate */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Click Rate</span>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <ActivityIcon className="size-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-3xl font-bold tracking-tight">{clickRate}%</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">clicks per view</p>
              </div>

              {/* Avg Duration */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time on Page</span>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                    <ClockIcon className="size-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-3xl font-bold tracking-tight">{formatDuration(avgDuration)}</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">average session duration</p>
              </div>
            </div>

            {/* Peak Insights Banner */}
            {peakViewDay && peakViewDay.views > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-sm text-indigo-800 dark:text-indigo-200">
                <TrendingUpIcon className="size-5 shrink-0" />
                <p>Your traffic peaked on <span className="font-semibold">{peakViewDay.date}</span> with <span className="font-semibold text-indigo-900 dark:text-indigo-300">{peakViewDay.views} views</span>! Keep it up.</p>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views Chart */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold mb-6">Views Over Time</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.substring(5)} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }} itemStyle={{ color: '#60a5fa' }} />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Clicks Chart */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold mb-6">Clicks Activity</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clicksPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.substring(5)} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }} itemStyle={{ color: '#818cf8' }} cursor={{ fill: '#374151', opacity: 0.1 }} />
                      <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Device Breakdown */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold mb-4">Devices</h3>
                {topDevices.length === 0 ? (
                  <p className="text-sm text-gray-400">No device data yet.</p>
                ) : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topDevices} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                          {topDevices.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }} />
                        <Legend formatter={(value) => <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold mb-4">Top Referrers</h3>
                {topReferrers.length === 0 ? (
                  <p className="text-sm text-gray-400">No referrer data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topReferrers.slice(0, 5).map((ref, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <GlobeIcon className="size-4 text-gray-400 shrink-0" />
                          <span className="text-sm truncate">{ref.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-indigo-500 ml-2">{ref.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Countries */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold mb-4">Top Countries</h3>
                {topCountries.length === 0 ? (
                  <p className="text-sm text-gray-400">No country data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topCountries.map((country, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm truncate">{country.name}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(country.value / totalViews) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-indigo-500 w-6 text-right">{country.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;