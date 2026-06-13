import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface TrendChartProps {
  data: Array<{
    month: string;
    subscription: number;
    oneTime: number;
    advertising: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSubscription" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a365d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#1a365d" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ed8936" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ed8936" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorAdvertising" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38a169" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#38a169" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#718096" fontSize={12} />
        <YAxis stroke="#718096" fontSize={12} tickFormatter={(value) => `¥${value / 1000}k`} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
        />
        <Area
          type="monotone"
          dataKey="subscription"
          stroke="#1a365d"
          fillOpacity={1}
          fill="url(#colorSubscription)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="oneTime"
          stroke="#ed8936"
          fillOpacity={1}
          fill="url(#colorOneTime)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="advertising"
          stroke="#38a169"
          fillOpacity={1}
          fill="url(#colorAdvertising)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
