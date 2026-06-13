import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, FlaskConical, Users, Bell, Lightbulb, FileText, ArrowRight, Plus, Target } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendChart } from '../../components/charts/TrendChart';
import { ProgressBar } from '../../components/charts/ProgressBar';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function Dashboard() {
  const { state } = useApp();
  const { revenues, experiments, reviews, groups } = state;

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentMonthRevenue = revenues
      .filter(r => new Date(r.date).getMonth() === currentMonth)
      .reduce((sum, r) => sum + r.amount, 0);
    
    const lastMonth = (currentMonth - 1 + 12) % 12;
    const lastMonthRevenue = revenues
      .filter(r => new Date(r.date).getMonth() === lastMonth)
      .reduce((sum, r) => sum + r.amount, 0);
    
    const growthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const completedExperiments = experiments.filter(e => e.status === 'completed');
    const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);

    return {
      currentMonthRevenue,
      growthRate,
      activeExperiments: experiments.filter(e => e.status === 'running').length,
      totalMembers
    };
  }, [revenues, experiments, groups]);

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

  const topExperiments = useMemo(() => {
    return experiments
      .filter(e => e.status === 'completed' && e.actualValue !== undefined)
      .sort((a, b) => (b.actualValue || 0) - (a.actualValue || 0))
      .slice(0, 5);
  }, [experiments]);

  const pendingValidations = useMemo(() => {
    return reviews.filter(r => r.isPendingValidation).length;
  }, [reviews]);

  const nextReview = useMemo(() => {
    const upcomingDates = groups
      .filter(g => g.nextReviewDate)
      .map(g => new Date(g.nextReviewDate!))
      .filter(d => d > new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    return upcomingDates[0];
  }, [groups]);

  const pendingReviews = useMemo(() => {
    const userGroups = state.user?.groups || [];
    return reviews.filter(r => 
      r.type === 'note' && 
      r.visibility === 'group' && 
      r.authorId !== state.user?.id &&
      r.comments.length === 0 &&
      r.groupId &&
      userGroups.includes(r.groupId)
    ).length;
  }, [reviews, state.user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-blue-700 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">本月收入</p>
              <p className="text-3xl font-bold font-mono">{formatCurrency(stats.currentMonthRevenue)}</p>
              <p className={`text-sm mt-2 ${stats.growthRate >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {formatPercent(stats.growthRate)}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-success/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">进行中实验</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeExperiments}</p>
              <p className="text-sm text-gray-500 mt-2">个实验正在进行</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-accent/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">待验证想法</p>
              <p className="text-3xl font-bold text-gray-900">{pendingValidations}</p>
              <p className="text-sm text-gray-500 mt-2">个想法待验证</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl">
              <Lightbulb className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">团队成员</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              <p className="text-sm text-gray-500 mt-2">位小组成员</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="近6月收入趋势">
            <TrendChart data={trendData} />
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-gray-600">订阅收入</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span className="text-sm text-gray-600">一次性购买</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm text-gray-600">广告收入</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="实验效果排行">
            <div className="space-y-4">
              {topExperiments.map((exp, idx) => (
                <div key={exp.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{exp.name}</p>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs font-bold ${
                        (exp.actualValue || 0) >= exp.targetValue ? 'text-success' : 'text-danger'
                      }`}>
                        {formatPercent(exp.actualValue || 0)}
                      </div>
                      <ProgressBar 
                        value={exp.actualValue || 0} 
                        max={exp.targetValue}
                        size="sm"
                        color={(exp.actualValue || 0) >= exp.targetValue ? '#38a169' : '#e53e3e'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/experiments">
              <Button variant="ghost" className="w-full mt-4">
                查看全部实验 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      <Card title="待办提醒" className="bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">下次复盘时间</p>
              <p className="text-lg font-bold text-primary">
                {nextReview ? nextReview.toLocaleDateString('zh-CN') : '未设置'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">待验证想法</p>
              <p className="text-lg font-bold text-accent">{pendingValidations} 个</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="p-2 bg-success/10 rounded-lg">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">待点评笔记</p>
              <p className="text-lg font-bold text-success">{pendingReviews} 篇</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="快速操作">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/revenue">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="p-3 bg-blue-500 rounded-xl text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">添加收入</p>
                <p className="text-sm text-gray-500">记录新的收入流水</p>
              </div>
            </div>
          </Link>

          <Link to="/experiments">
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="p-3 bg-accent rounded-xl text-white">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">创建实验</p>
                <p className="text-sm text-gray-500">记录新的产品实验</p>
              </div>
            </div>
          </Link>

          <Link to="/reviews">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer">
              <div className="p-3 bg-success rounded-xl text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">写笔记</p>
                <p className="text-sm text-gray-500">发布经营心得</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
