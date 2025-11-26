import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useInventory } from './InventoryContext';

const COLORS = {
  electronics: '#3B82F6',
  clothing: '#8B5CF6',
  food: '#10B981',
  furniture: '#F59E0B',
  tools: '#64748B',
  other: '#9CA3AF',
};

const LABELS = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  food: 'Food & Beverages',
  furniture: 'Furniture',
  tools: 'Tools',
  other: 'Other',
};

export default function CategoryChart() {
  const { products } = useInventory();
  
  const categoryData = products.reduce((acc, product) => {
    const category = product.category || 'other';
    const value = product.quantity * product.price;
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += value;
      existing.count += 1;
    } else {
      acc.push({ name: category, value, count: 1 });
    }
    return acc;
  }, []);

  const chartData = categoryData.map(item => ({
    ...item,
    label: LABELS[item.name] || item.name,
    color: COLORS[item.name] || COLORS.other,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-slate-500">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            />
            <Legend 
              formatter={(value, entry) => {
                const item = chartData.find(d => d.name === value);
                return <span className="text-sm text-slate-600">{item?.label} ({item?.count})</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}