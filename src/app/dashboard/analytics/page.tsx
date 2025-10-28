'use client'

import { useState } from 'react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieLabelRenderProps
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MousePointer, 
  Users, 
  Target,
  Calendar,
  Filter,
  AlertCircle
} from 'lucide-react'

const mockData = {
  performance: [
    { date: '2024-01-01', revenue: 4000, spend: 2400, roas: 1.67, clicks: 240 },
    { date: '2024-01-02', revenue: 3000, spend: 1398, roas: 2.15, clicks: 221 },
    { date: '2024-01-03', revenue: 2000, spend: 9800, roas: 0.20, clicks: 229 },
    { date: '2024-01-04', revenue: 2780, spend: 3908, roas: 0.71, clicks: 200 },
    { date: '2024-01-05', revenue: 1890, spend: 4800, roas: 0.39, clicks: 218 },
    { date: '2024-01-06', revenue: 2390, spend: 3800, roas: 0.63, clicks: 250 },
    { date: '2024-01-07', revenue: 3490, spend: 4300, roas: 0.81, clicks: 210 },
  ],
  platformBreakdown: [
    { name: 'Google Ads', value: 4000, color: '#4285F4' },
    { name: 'Meta Ads', value: 3000, color: '#1877F2' },
    { name: 'TikTok Ads', value: 2000, color: '#000000' },
    { name: 'LinkedIn Ads', value: 1000, color: '#0A66C2' },
  ],
  kpis: [
    {
      metric: 'Total Spend',
      value: '$28,506',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      metric: 'Total Revenue',
      value: '$45,231',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      metric: 'Total Clicks',
      value: '1,568',
      change: '-2.4%',
      trend: 'down',
      icon: MousePointer
    },
    {
      metric: 'Conversions',
      value: '89',
      change: '+15.7%',
      trend: 'up',
      icon: Target
    },
    {
      metric: 'Avg CPC',
      value: '$18.18',
      change: '-5.3%',
      trend: 'down',
      icon: TrendingDown
    },
    {
      metric: 'Conversion Rate',
      value: '5.67%',
      change: '+1.2%',
      trend: 'up',
      icon: Users
    },
  ]
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  const periods = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ]

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'google', label: 'Google Ads' },
    { value: 'meta', label: 'Meta Ads' },
    { value: 'tiktok', label: 'TikTok Ads' },
    { value: 'linkedin', label: 'LinkedIn Ads' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and analyze your advertising performance across all platforms.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {platforms.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {mockData.kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.metric} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-5 w-5 text-gray-400" />
                <span className={`text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-600 mt-1">{kpi.metric}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs Spend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ROAS Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roas" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Budget Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.platformBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  if (props.name && props.percent !== undefined) {
                    return `${props.name} ${(props.percent * 100).toFixed(0)}%`
                  }
                  return ''
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockData.platformBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Click Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI-Powered Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Performance Recommendation</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Meta Ads campaigns are showing strong ROAS (2.15x). Consider increasing budget by 20% to capitalize on momentum.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Budget Alert</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>TikTok Ads spend increased by 200% but conversions only increased by 15%. Review targeting and creative assets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
