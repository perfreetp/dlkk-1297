import React, { useState, useMemo } from 'react';
import { Plus, Download, Filter, Trash2, Edit } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TrendChart } from '../../components/charts/TrendChart';
import { RevenuePieChart } from '../../components/charts/PieChart';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, revenueTypeLabels, revenueTypeColors, channelLabels } from '../../utils/formatters';
import { Revenue } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function RevenuePage() {
  const { state, dispatch } = useApp();
  const { revenues } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'CNY' as const,
    date: new Date().toISOString().split('T')[0],
    product: '',
    productTag: '',
    type: 'subscription' as const,
    channel: 'direct' as const,
    note: ''
  });

  const products = useMemo(() => {
    const unique = [...new Set(revenues.map(r => r.product))];
    return [{ value: 'all', label: '全部产品' }, ...unique.map(p => ({ value: p, label: p }))];
  }, [revenues]);

  const filteredRevenues = useMemo(() => {
    return revenues.filter(r => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterProduct !== 'all' && r.product !== filterProduct) return false;
      return true;
    });
  }, [revenues, filterType, filterProduct]);

  const totalPages = Math.ceil(filteredRevenues.length / itemsPerPage);
  const paginatedRevenues = filteredRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const trendData = useMemo(() => {
    const months = ['8月', '9月', '10月', '11月', '12月', '1月'];
    return months.map((month, idx) => {
      const monthData = revenues.filter((_, i) => i < (idx + 1) * 8);
      return {
        month,
        subscription: monthData.filter(r => r.type === 'subscription').reduce((sum, r) => sum + r.amount, 0),
        oneTime: monthData.filter(r => r.type === 'oneTime').reduce((sum, r) => sum + r.amount, 0),
        advertising: monthData.filter(r => r.type === 'advertising').reduce((sum, r) => sum + r.amount, 0)
      };
    });
  }, [revenues]);

  const pieData = useMemo(() => {
    const subscription = revenues.filter(r => r.type === 'subscription').reduce((sum, r) => sum + r.amount, 0);
    const oneTime = revenues.filter(r => r.type === 'oneTime').reduce((sum, r) => sum + r.amount, 0);
    const advertising = revenues.filter(r => r.type === 'advertising').reduce((sum, r) => sum + r.amount, 0);
    return [
      { name: '订阅收入', value: subscription, color: revenueTypeColors.subscription },
      { name: '一次性', value: oneTime, color: revenueTypeColors.oneTime },
      { name: '广告收入', value: advertising, color: revenueTypeColors.advertising }
    ];
  }, [revenues]);

  const handleSubmit = () => {
    const newRevenue: Revenue = {
      id: uuidv4(),
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      date: formData.date,
      product: formData.product,
      productTag: formData.productTag,
      type: formData.type,
      channel: formData.channel,
      note: formData.note,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_REVENUE', payload: newRevenue });
    setShowAddModal(false);
    setFormData({
      amount: '',
      currency: 'CNY',
      date: new Date().toISOString().split('T')[0],
      product: '',
      productTag: '',
      type: 'subscription',
      channel: 'direct',
      note: ''
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['日期', '产品', '类型', '渠道', '金额', '备注'].join(','),
      ...filteredRevenues.map(r => [
        r.date,
        r.product,
        revenueTypeLabels[r.type],
        channelLabels[r.channel],
        r.amount,
        r.note || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `收入记录_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            options={products}
            className="w-48"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: '全部类型' },
              { value: 'subscription', label: '订阅' },
              { value: 'oneTime', label: '一次性' },
              { value: 'advertising', label: '广告' }
            ]}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加收入
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="月度收入趋势">
            <TrendChart data={trendData} />
          </Card>
        </div>
        <div>
          <Card title="收入类型分布">
            <RevenuePieChart data={pieData} />
          </Card>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">日期</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">产品</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">类型</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">渠道</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">金额</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">备注</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRevenues.map(revenue => (
                <tr key={revenue.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{formatDate(revenue.date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{revenue.product}</td>
                  <td className="py-3 px-4">
                    <span 
                      className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${revenueTypeColors[revenue.type]}20`,
                        color: revenueTypeColors[revenue.type]
                      }}
                    >
                      {revenueTypeLabels[revenue.type]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{channelLabels[revenue.channel]}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right font-mono">
                    {formatCurrency(revenue.amount, revenue.currency)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{revenue.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            共 {filteredRevenues.length} 条记录
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              上一页
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages || 1}
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加收入记录"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formData.amount || !formData.product}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="金额"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
            <Select
              label="币种"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'CNY' | 'USD' })}
              options={[
                { value: 'CNY', label: '人民币 (CNY)' },
                { value: 'USD', label: '美元 (USD)' }
              ]}
            />
          </div>
          <Input
            label="日期"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="产品名称"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="Pro工具箱"
            />
            <Input
              label="产品标签"
              value={formData.productTag}
              onChange={(e) => setFormData({ ...formData, productTag: e.target.value })}
              placeholder="tool"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="收入类型"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'subscription', label: '订阅收入' },
                { value: 'oneTime', label: '一次性购买' },
                { value: 'advertising', label: '广告收入' }
              ]}
            />
            <Select
              label="渠道"
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
              options={[
                { value: 'appStore', label: 'App Store' },
                { value: 'googlePlay', label: 'Google Play' },
                { value: 'website', label: '官网' },
                { value: 'direct', label: 'Direct' }
              ]}
            />
          </div>
          <Textarea
            label="备注"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={3}
            placeholder="可选备注信息..."
          />
        </div>
      </Modal>
    </div>
  );
}
