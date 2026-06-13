import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Tag } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useApp } from '../../contexts/AppContext';
import { Review } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function ReviewEditor() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { user, groups } = state;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'note' as 'note' | 'outline' | 'practice',
    visibility: 'group' as 'private' | 'group',
    groupId: groups[0]?.id || '',
    tags: [] as string[],
    isPendingValidation: false
  });

  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    const newReview: Review = {
      id: uuidv4(),
      title: formData.title,
      content: formData.content,
      type: formData.type,
      tags: formData.tags,
      visibility: formData.visibility,
      groupId: formData.visibility === 'group' ? formData.groupId : undefined,
      authorId: user?.id || 'user-001',
      authorName: user?.name || '匿名用户',
      likes: 0,
      views: 0,
      comments: [],
      isBookmarked: false,
      isPendingValidation: formData.isPendingValidation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_REVIEW', payload: newReview });
    navigate('/reviews');
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/gim, '<br/>');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/reviews')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回列表</span>
        </button>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? '编辑' : '预览'}
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title.trim() || !formData.content.trim()}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          <Input
            label="标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="输入文章标题..."
            className="text-xl font-semibold"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="文章类型"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'note', label: '经营笔记' },
                { value: 'outline', label: '复盘提纲' },
                { value: 'practice', label: '可借鉴做法' }
              ]}
            />
            <Select
              label="可见范围"
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
              options={[
                { value: 'private', label: '仅自己可见' },
                { value: 'group', label: '小组可见' }
              ]}
            />
          </div>

          {formData.visibility === 'group' && (
            <Select
              label="发布到小组"
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              options={groups.map(g => ({ value: g.id, label: g.name }))}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="输入标签后按回车"
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleAddTag}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pendingValidation"
              checked={formData.isPendingValidation}
              onChange={(e) => setFormData({ ...formData, isPendingValidation: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="pendingValidation" className="text-sm text-gray-700">
              标记为待验证想法
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">正文内容</label>
            {showPreview ? (
              <div className="min-h-[400px] p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{formData.title || '无标题'}</h1>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content || '暂无内容') }}
                />
              </div>
            ) : (
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={20}
                placeholder="开始写作...&#10;&#10;支持 Markdown 语法：&#10;# 标题&#10;## 二级标题&#10;**粗体** *斜体*&#10;- 列表项"
                className="font-mono text-sm"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
