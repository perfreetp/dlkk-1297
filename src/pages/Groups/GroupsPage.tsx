import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Users, FileText, Bell, Settings, ChevronRight, UserPlus, X, Mail, Eye, ArrowLeft, MessageCircle, History, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { Group, Member } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function GroupsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { groups, reviews, user, viewingAs } = state;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showMemberActivity, setShowMemberActivity] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '🔵'
  });

  const [inviteData, setInviteData] = useState({
    name: '',
    email: ''
  });

  const memberGroups = useMemo(() => {
    if (!viewingAs) return [];
    return groups.filter(g => g.members.some(m => m.id === viewingAs.id));
  }, [groups, viewingAs]);

  const memberReviews = useMemo(() => {
    if (!viewingAs) return [];
    const memberGroupIds = memberGroups.map(g => g.id);
    return reviews
      .filter(r => r.groupId && memberGroupIds.includes(r.groupId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, memberGroups, viewingAs]);

  const memberActivity = useMemo(() => {
    if (!viewingAs) return [];
    const activities: Array<{
      type: 'comment' | 'created';
      reviewTitle: string;
      reviewId: string;
      content: string;
      time: string;
      groupName: string;
    }> = [];

    memberReviews.forEach(review => {
      const group = groups.find(g => g.id === review.groupId);
      if (review.authorId === viewingAs.id) {
        activities.push({
          type: 'created',
          reviewTitle: review.title,
          reviewId: review.id,
          content: '发布了笔记',
          time: review.createdAt,
          groupName: group?.name || '未知小组'
        });
      }

      const memberComments = review.comments.filter(c => c.authorId === viewingAs.id);
      memberComments.forEach(comment => {
        activities.push({
          type: 'comment',
          reviewTitle: review.title,
          reviewId: review.id,
          content: comment.content,
          time: comment.createdAt,
          groupName: group?.name || '未知小组'
        });
      });
    });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [memberReviews, viewingAs, groups]);

  const handleCreateGroup = () => {
    if (!formData.name) return;

    const newGroup: Group = {
      id: uuidv4(),
      name: formData.name,
      description: formData.description,
      avatar: formData.avatar,
      members: [
        { 
          id: user?.id || 'user-001', 
          name: user?.name || '匿名用户', 
          email: user?.email || '', 
          role: 'admin' 
        }
      ],
      nextReviewDate: undefined,
      createdBy: user?.id || 'user-001',
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_GROUP', payload: newGroup });
    setShowCreateModal(false);
    setSelectedGroup(newGroup);
    setFormData({ name: '', description: '', avatar: '🔵' });
  };

  const handleInviteMember = () => {
    if (!inviteData.name || !inviteData.email || !selectedGroup) return;

    const newMember: Member = {
      id: uuidv4(),
      name: inviteData.name,
      email: inviteData.email,
      role: 'member'
    };

    const updatedGroup: Group = {
      ...selectedGroup,
      members: [...selectedGroup.members, newMember]
    };

    dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
    setSelectedGroup(updatedGroup);
    setShowInviteModal(false);
    setInviteData({ name: '', email: '' });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedGroup || memberId === user?.id) return;

    const updatedGroup: Group = {
      ...selectedGroup,
      members: selectedGroup.members.filter(m => m.id !== memberId)
    };

    dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
    setSelectedGroup(updatedGroup);
  };

  const handleUpdateReviewDate = (groupId: string, date: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedGroup = { ...group, nextReviewDate: date };
      dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(updatedGroup);
      }
    }
  };

  const handleViewAsMember = (member: Member) => {
    dispatch({ type: 'SET_VIEWING_AS', payload: member });
  };

  const handleClearViewingAs = () => {
    dispatch({ type: 'SET_VIEWING_AS', payload: null });
  };

  const getGroupReviews = (groupId: string) => {
    return reviews
      .filter(r => r.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const isAdmin = selectedGroup?.members.some(
    m => m.id === user?.id && m.role === 'admin'
  );

  const recentActivityReviews = useMemo(() => {
    if (!selectedGroup) return [];
    return reviews
      .filter(r => r.groupId === selectedGroup.id)
      .filter(r => r.comments.length > 0)
      .sort((a, b) => {
        const aLatest = a.comments.length > 0 
          ? new Date(a.comments[a.comments.length - 1].createdAt).getTime()
          : 0;
        const bLatest = b.comments.length > 0 
          ? new Date(b.comments[b.comments.length - 1].createdAt).getTime()
          : 0;
        return bLatest - aLatest;
      })
      .slice(0, 5);
  }, [reviews, selectedGroup]);

  const groupDiscussionTimeline = useMemo(() => {
    if (!selectedGroup) return [];
    const timeline: Array<{
      type: 'comment' | 'created';
      reviewTitle: string;
      reviewId: string;
      authorName: string;
      content: string;
      time: string;
      review: any;
    }> = [];

    reviews
      .filter(r => r.groupId === selectedGroup.id)
      .forEach(review => {
        review.comments.forEach(comment => {
          timeline.push({
            type: 'comment',
            reviewTitle: review.title,
            reviewId: review.id,
            authorName: comment.authorName,
            content: comment.content,
            time: comment.createdAt,
            review
          });
        });
      });

    return timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [reviews, selectedGroup]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">我的小组</h2>
          <p className="text-sm text-gray-500 mt-1">
            {viewingAs 
              ? `正在查看 ${viewingAs.name} 的视角` 
              : '管理你的团队和复盘计划'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewingAs && (
            <Button variant="secondary" onClick={() => setShowMemberActivity(!showMemberActivity)}>
              <History className="w-4 h-4 mr-2" />
              参与记录
            </Button>
          )}
          {viewingAs ? (
            <Button variant="primary" onClick={handleClearViewingAs}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回管理视图
            </Button>
          ) : (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建小组
            </Button>
          )}
        </div>
      </div>

      {viewingAs && showMemberActivity && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {viewingAs.name} 的参与记录
              <span className="text-xs text-gray-500">（{memberActivity.length} 条）</span>
            </h3>
            <button 
              onClick={() => setShowMemberActivity(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {memberActivity.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent"></div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {memberActivity.map((activity, idx) => (
                  <div 
                    key={idx}
                    className="relative flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-gray-100 hover:to-blue-100 transition-all cursor-pointer group"
                    onClick={() => navigate(`/reviews/${activity.reviewId}`)}
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                      activity.type === 'created' 
                        ? 'bg-gradient-to-br from-primary to-blue-600' 
                        : 'bg-gradient-to-br from-accent to-orange-500'
                    }`}>
                      {activity.type === 'created' ? (
                        <FileText className="w-5 h-5 text-white" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          {activity.groupName}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">
                          {activity.type === 'created' ? '发布了笔记' : '发表了评论'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{activity.reviewTitle}</p>
                      {activity.type === 'comment' && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">{activity.content}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatRelativeTime(activity.time)}</span>
                        <span>·</span>
                        <span className="text-primary group-hover:underline">查看详情 →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">暂无参与记录</p>
              <p className="text-sm text-gray-400">
                {viewingAs.name} 加入的小组还没有笔记或讨论
              </p>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {viewingAs ? (
            <Card title={`${viewingAs.name} 加入的小组`}>
              <div className="space-y-3">
                {memberGroups.length > 0 ? (
                  memberGroups.map(group => (
                    <div 
                      key={group.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        const freshGroup = groups.find(g => g.id === group.id);
                        if (freshGroup) setSelectedGroup(freshGroup);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-lg">
                          {group.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{group.name}</p>
                          <p className="text-xs text-gray-500">{group.members.length} 位成员</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">该成员还未加入任何小组</p>
                )}
              </div>
            </Card>
          ) : (
            groups.map(group => (
              <Card 
                key={group.id}
                hover
                className={`cursor-pointer ${selectedGroup?.id === group.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => {
                  const freshGroup = groups.find(g => g.id === group.id);
                  if (freshGroup) setSelectedGroup(freshGroup);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-2xl">
                      {group.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.members.length} 位成员</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                
                {group.nextReviewDate && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Bell className="w-4 h-4" />
                    <span>下次复盘: {formatDate(group.nextReviewDate)}</span>
                  </div>
                )}
              </Card>
            ))
          )}

          {groups.length === 0 && !viewingAs && (
            <Card>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">还没有小组</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  创建第一个小组
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {viewingAs ? (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingAs.name}`}
                    alt={viewingAs.name}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{viewingAs.name}</h2>
                    <p className="text-gray-600">{viewingAs.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                        已加入 {memberGroups.length} 个小组
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
                        {memberReviews.length} 篇笔记
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        {memberActivity.filter(a => a.type === 'comment').length} 条评论
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>💡 提示：</strong>您正在以 {viewingAs.name} 的身份查看小组内容，可以发表笔记和评论来验证协作流程。
                  </p>
                </div>

                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  可参与的笔记
                </h3>
                {memberReviews.length > 0 ? (
                  <div className="space-y-3">
                    {memberReviews.map(review => (
                      <div 
                        key={review.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100 hover:border-primary/30"
                        onClick={() => navigate(`/reviews/${review.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              {groups.find(g => g.id === review.groupId)?.name}
                            </span>
                            <h4 className="font-medium text-gray-900">{review.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {review.comments.length > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
                                {review.comments.length} 条讨论
                              </span>
                            )}
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {review.content.substring(0, 80)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>作者: {review.authorName}</span>
                          <span>·</span>
                          <span>{review.comments.length} 条评论</span>
                          <span>·</span>
                          <span>{formatRelativeTime(review.createdAt)}</span>
                        </div>
                        {review.comments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">最新讨论：</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.comments[review.comments.length - 1].authorName}`}
                                alt={review.comments[review.comments.length - 1].authorName}
                                className="w-4 h-4 rounded-full"
                              />
                              <span className="font-medium">{review.comments[review.comments.length - 1].authorName}:</span>
                              <span className="line-clamp-1">{review.comments[review.comments.length - 1].content}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    这些小组还没有笔记，快去发布第一篇吧！
                  </p>
                )}
              </Card>
            </div>
          ) : selectedGroup ? (
            <div className="space-y-6">
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl text-white">
                      {selectedGroup.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                      <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                    </div>
                  </div>
                  <Button variant="secondary">
                    <Settings className="w-4 h-4 mr-2" />
                    设置
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-gray-900">成员列表</h3>
                      </div>
                      {isAdmin && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setShowInviteModal(true)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          邀请
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedGroup.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 bg-white rounded-lg group">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                          {member.role === 'admin' && (
                            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                              管理员
                            </span>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewAsMember(member)}
                              className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                              title="以该成员视角查看"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAdmin && member.role !== 'admin' && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-gray-900">复盘日历</h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        type="date"
                        value={selectedGroup.nextReviewDate || ''}
                        onChange={(e) => handleUpdateReviewDate(selectedGroup.id, e.target.value)}
                      />
                      {selectedGroup.nextReviewDate && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                          <Bell className="w-4 h-4 text-primary" />
                          <span className="text-sm text-primary font-medium">
                            下次复盘: {formatDate(selectedGroup.nextReviewDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {recentActivityReviews.length > 0 && (
                <Card title="最近有动态的笔记">
                  <div className="space-y-3">
                    {recentActivityReviews.map(review => {
                      const lastComment = review.comments[review.comments.length - 1];
                      return (
                        <div 
                          key={review.id}
                          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/reviews/${review.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{review.title}</h4>
                            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                            {review.content.substring(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MessageCircle className="w-3 h-3" />
                              <span>{review.comments.length} 条评论</span>
                            </div>
                            {lastComment && (
                              <div className="flex items-center gap-2 text-xs text-accent">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lastComment.authorName}`}
                                  alt={lastComment.authorName}
                                  className="w-4 h-4 rounded-full"
                                />
                                <span>{lastComment.authorName}: {lastComment.content.substring(0, 20)}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {groupDiscussionTimeline.length > 0 && (
                <Card title={`小组讨论时间线 (${groupDiscussionTimeline.length})`}>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-gray-200"></div>
                    <div className="space-y-4">
                      {groupDiscussionTimeline.slice(0, 8).map((item, idx) => (
                        <div 
                          key={idx}
                          className="relative flex items-start gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                          onClick={() => navigate(`/reviews/${item.reviewId}`)}
                        >
                          <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{item.authorName}</span>
                              <span className="text-xs text-gray-400">评论了</span>
                              <span className="text-xs text-primary font-medium">{item.reviewTitle}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(item.time)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                    {groupDiscussionTimeline.length > 8 && (
                      <div className="mt-4 text-center">
                        <button 
                          className="text-sm text-primary hover:text-blue-700"
                          onClick={() => navigate('/reviews')}
                        >
                          查看更多讨论 →
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Card title={`所有笔记 (${reviews.filter(r => r.groupId === selectedGroup.id).length})`}>
                {getGroupReviews(selectedGroup.id).length > 0 ? (
                  <div className="space-y-3">
                    {getGroupReviews(selectedGroup.id).map(review => (
                      <div 
                        key={review.id} 
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/reviews/${review.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{review.title}</h4>
                          <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.content.substring(0, 100)}...</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>作者: {review.authorName}</span>
                            <span>·</span>
                            <span>{review.comments.length} 条评论</span>
                          </div>
                          <button 
                            className="text-xs text-primary hover:text-blue-700 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/reviews/${review.id}`);
                            }}
                          >
                            查看详情
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">暂无笔记</p>
                )}
              </Card>
            </div>
          ) : (
            <Card>
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">选择一个小组</h3>
                <p className="text-gray-500">点击左侧小组卡片查看详情</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建小组"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>取消</Button>
            <Button onClick={handleCreateGroup} disabled={!formData.name}>创建</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="小组名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：SaaS创业者联盟"
          />
          <Textarea
            label="小组描述"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="描述小组的目标和愿景..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择图标</label>
            <div className="flex gap-2">
              {['🔵', '🟢', '🟡', '🔴', '🟣', '🟠'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setFormData({ ...formData, avatar: emoji })}
                  className={`w-12 h-12 text-2xl rounded-lg border-2 ${
                    formData.avatar === emoji ? 'border-primary' : 'border-gray-200'
                  } hover:border-primary transition-colors`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="邀请成员"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>取消</Button>
            <Button onClick={handleInviteMember} disabled={!inviteData.name || !inviteData.email}>
              <UserPlus className="w-4 h-4 mr-2" />
              邀请加入
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">邀请新成员</p>
              <p className="text-xs text-blue-600 mt-1">
                输入成员的姓名和邮箱即可添加，成员加入后可以参与小组讨论和点评笔记。
              </p>
            </div>
          </div>
          <Input
            label="成员姓名"
            value={inviteData.name}
            onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
            placeholder="例如：张三"
          />
          <Input
            label="成员邮箱"
            type="email"
            value={inviteData.email}
            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            placeholder="例如：zhangsan@example.com"
          />
        </div>
      </Modal>
    </div>
  );
}
