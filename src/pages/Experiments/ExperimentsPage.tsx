import React, { useState } from 'react';
import { Plus, Calendar, Target, CheckCircle, Clock, Edit, Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/charts/ProgressBar';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatPercent, experimentTypeLabels, experimentStatusLabels } from '../../utils/formatters';
import { Experiment } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function ExperimentsPage() {
  const { state, dispatch } = useApp();
  const { experiments } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'price' as const,
    status: 'pending' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetMetric: '',
    targetValue: '',
    hypothesis: ''
  });

  const [resultData, setResultData] = useState({
    actualValue: '',
    conclusion: '',
    endDate: new Date().toISOString().split('T')[0]
  });

  const filteredExperiments = experiments.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  const pending = filteredExperiments.filter(e => e.status === 'pending');
  const running = filteredExperiments.filter(e => e.status === 'running');
  const completed = filteredExperiments.filter(e => e.status === 'completed');

  const handleSubmit = () => {
    const newExperiment: Experiment = {
      id: uuidv4(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      targetMetric: formData.targetMetric,
      targetValue: parseFloat(formData.targetValue),
      hypothesis: formData.hypothesis,
      createdBy: state.user?.id || 'user-001',
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_EXPERIMENT', payload: newExperiment });
    setShowAddModal(false);
    setFormData({
      name: '',
      description: '',
      type: 'price',
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetMetric: '',
      targetValue: '',
      hypothesis: ''
    });
  };

  const handleFillResult = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setResultData({
      actualValue: experiment.actualValue?.toString() || '',
      conclusion: experiment.conclusion || '',
      endDate: experiment.endDate || new Date().toISOString().split('T')[0]
    });
    setShowResultModal(true);
  };

  const handleSubmitResult = () => {
    if (!selectedExperiment) return;

    const updatedExperiment: Experiment = {
      ...selectedExperiment,
      actualValue: parseFloat(resultData.actualValue),
      conclusion: resultData.conclusion,
      endDate: resultData.endDate,
      status: 'completed'
    };

    dispatch({ type: 'UPDATE_EXPERIMENT', payload: updatedExperiment });
    setShowResultModal(false);
    setSelectedExperiment(null);
    setResultData({
      actualValue: '',
      conclusion: '',
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
    const progress = experiment.actualValue 
      ? (experiment.actualValue / experiment.targetValue) * 100 
      : experiment.status === 'running' 
        ? 50 
        : 0;

    const isSuccess = experiment.actualValue !== undefined && experiment.actualValue >= experiment.targetValue;

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {experimentTypeLabels[experiment.type]}
          </span>
          {experiment.status === 'completed' && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
              isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isSuccess ? (
                <><CheckCircle className="w-3 h-3" /> 达成</>
              ) : (
                <><Clock className="w-3 h-3" /> 未达成</>
              )}
            </span>
          )}
        </div>
        
        <h4 className="font-semibold text-gray-900 mb-2">{experiment.name}</h4>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{experiment.description}</p>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{experiment.targetMetric}</span>
            <span className={`font-semibold ml-auto ${
              experiment.status === 'completed' 
                ? isSuccess ? 'text-green-600' : 'text-red-600'
                : 'text-gray-900'
            }`}>
              {experiment.actualValue !== undefined 
                ? formatPercent(experiment.actualValue)
                : `目标 ${experiment.targetValue}%`}
            </span>
          </div>
          <ProgressBar 
            value={experiment.actualValue || 0} 
            max={experiment.targetValue}
            size="sm"
            color={experiment.status === 'completed' 
              ? isSuccess ? '#38a169' : '#e53e3e'
              : progress >= 100 ? '#38a169' : '#1a365d'}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(experiment.startDate, 'MM/dd')}</span>
            {experiment.endDate && (
              <>
                <span> - </span>
                <span>{formatDate(experiment.endDate, 'MM/dd')}</span>
              </>
            )}
          </div>
          {experiment.status === 'running' && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFillResult(experiment);
              }}
              className="ml-auto"
            >
              <Edit className="w-3 h-3 mr-1" />
              填写结果
            </Button>
          )}
        </div>

        {experiment.status === 'completed' && experiment.conclusion && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-medium">结论：</span>
              {experiment.conclusion}
            </p>
          </div>
        )}
      </div>
    );
  };

  const Column = ({ title, status, count, experiments }: any) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          {count}
        </span>
      </div>
      <div className="space-y-4 min-h-[400px]">
        {experiments.map(exp => (
          <ExperimentCard key={exp.id} experiment={exp} />
        ))}
        {count === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">暂无实验</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'pending' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            待开始
          </button>
          <button
            onClick={() => setFilterStatus('running')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'running' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            进行中
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'completed' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已完成
          </button>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建实验
        </Button>
      </div>

      <div className="flex gap-6">
        <Column 
          title="待开始" 
          status="pending"
          count={pending.length}
          experiments={pending}
        />
        <Column 
          title="进行中" 
          status="running"
          count={running.length}
          experiments={running}
        />
        <Column 
          title="已完成" 
          status="completed"
          count={completed.length}
          experiments={completed}
        />
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="创建实验"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.targetMetric}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="实验名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：年订阅价格调整实验"
          />
          <Textarea
            label="实验描述"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="详细描述实验内容..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="实验类型"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'price', label: '价格调整实验' },
                { value: 'channel', label: '渠道投放实验' },
                { value: 'feature', label: '功能实验' }
              ]}
            />
            <Select
              label="实验状态"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'pending', label: '待开始' },
                { value: 'running', label: '进行中' },
                { value: 'completed', label: '已完成' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="开始日期"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="结束日期"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="目标指标"
              value={formData.targetMetric}
              onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
              placeholder="例如：月收入增长率"
            />
            <Input
              label="目标值 (%)"
              type="number"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              placeholder="20"
            />
          </div>
          <Textarea
            label="假设前提"
            value={formData.hypothesis}
            onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
            rows={2}
            placeholder="你的实验假设是什么？"
          />
        </div>
      </Modal>

      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="填写实验结果"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowResultModal(false)}>取消</Button>
            <Button onClick={handleSubmitResult} disabled={!resultData.actualValue}>
              <Save className="w-4 h-4 mr-2" />
              保存结果
            </Button>
          </>
        }
      >
        {selectedExperiment && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedExperiment.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{selectedExperiment.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">目标：{selectedExperiment.targetMetric}</span>
                <span className="font-semibold text-primary">{selectedExperiment.targetValue}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="实际达成值 (%)"
                type="number"
                value={resultData.actualValue}
                onChange={(e) => setResultData({ ...resultData, actualValue: e.target.value })}
                placeholder="35"
                helper={`目标：${selectedExperiment.targetValue}%`}
              />
              <Input
                label="结束日期"
                type="date"
                value={resultData.endDate}
                onChange={(e) => setResultData({ ...resultData, endDate: e.target.value })}
              />
            </div>

            <Textarea
              label="实验结论"
              value={resultData.conclusion}
              onChange={(e) => setResultData({ ...resultData, conclusion: e.target.value })}
              rows={4}
              placeholder="总结实验的主要发现和结论..."
            />

            {resultData.actualValue && (
              <div className={`p-4 rounded-lg ${
                parseFloat(resultData.actualValue) >= selectedExperiment.targetValue 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  parseFloat(resultData.actualValue) >= selectedExperiment.targetValue 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {parseFloat(resultData.actualValue) >= selectedExperiment.targetValue 
                    ? '🎉 恭喜！实验达成目标' 
                    : '⚠️ 实验未达成目标，建议分析原因'}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
