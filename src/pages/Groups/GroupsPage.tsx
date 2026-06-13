import React, { useState } from 'react';
import { Plus, Calendar, Users, FileText, Bell, Settings, ChevronRight, UserPlus, X, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/formatters';
import { Group, Member } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function GroupsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { groups, reviews, user } = state;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '🔵'
  });

  const [inviteData, setInviteData] = useState({
    name: '',
    email: ''
  });

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

  const getGroupReviews = (groupId: string) => {
    return reviews.filter(r => r.groupId === groupId).slice(0, 3);
  };

  const isAdmin = selectedGroup?.members.some(
    m => m.id === user?.id && m.role === 'admin'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">我的小组</h2>
          <p className="text-sm text-gray-500 mt-1">管理你的团队和复盘计划</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建小组
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {groups.map(group => (
            <Card 
              key={group.id}
              hover
              className={`cursor-pointer ${selectedGroup?.id === group.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedGroup(group)}
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
          ))}

          {groups.length === 0 && (
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
          {selectedGroup ? (
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
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedGroup.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
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
                          {isAdmin && member.role !== 'admin' && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
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

              <Card title={`近期笔记 (${reviews.filter(r => r.groupId === selectedGroup.id).length})`}>
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
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{review.authorName}</span>
                          <span>·</span>
                          <span>{review.comments.length} 评论</span>
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
