import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageCircle, Eye, Bookmark, Lock, Users, Send, Lightbulb, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatRelativeTime, reviewTypeLabels } from '../../utils/formatters';
import { Comment } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { reviews, user, groups, viewingAs, navigationContext } = state;

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const review = reviews.find(r => r.id === id);
  
  const currentUser = viewingAs || user;
  
  const relatedGroup = useMemo(() => {
    return groups.find(g => g.id === review?.groupId);
  }, [groups, review?.groupId]);

  useEffect(() => {
    if (review) {
      dispatch({
        type: 'SET_NAVIGATION_CONTEXT',
        payload: {
          fromGroups: true,
          fromReview: false,
          groupId: review.groupId,
          reviewId: review.id
        }
      });
      const updatedReview = { ...review, views: review.views + 1 };
      dispatch({ type: 'UPDATE_REVIEW', payload: updatedReview });
    }
  }, [id]);

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">文章不存在或已被删除</p>
            <Button onClick={() => navigate('/reviews')}>返回列表</Button>
          </div>
        </Card>
      </div>
    );
  }

  const isGroupMember = review.groupId 
    ? relatedGroup?.members.some(m => m.id === currentUser?.id)
    : true;

  const canView = review.visibility === 'private' 
    ? review.authorId === currentUser?.id
    : isGroupMember || review.authorId === currentUser?.id;

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">您没有权限查看此文章</p>
            <Button onClick={() => navigate('/reviews')}>返回列表</Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleLike = () => {
    const updatedReview = { ...review, likes: review.likes + 1 };
    dispatch({ type: 'UPDATE_REVIEW', payload: updatedReview });
  };

  const handleToggleBookmark = () => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: review.id });
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    const newComment: Comment = {
      id: uuidv4(),
      authorId: currentUser?.id || 'user-001',
      authorName: currentUser?.name || '匿名用户',
      content: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    dispatch({
      type: 'ADD_COMMENT',
      payload: { reviewId: review.id, comment: newComment }
    });

    setCommentText('');
    setIsSubmitting(false);
  };

  const handleBack = () => {
    dispatch({
      type: 'SET_NAVIGATION_CONTEXT',
      payload: {
        fromGroups: false,
        fromReview: false
      }
    });
    
    if (navigationContext.fromReview) {
      navigate('/reviews');
    } else if (viewingAs && navigationContext.groupId) {
      navigate('/groups');
    } else if (review.groupId) {
      navigate('/groups');
    } else {
      navigate('/reviews');
    }
  };

  const getBackPath = () => {
    if (viewingAs && navigationContext.groupId) {
      return { label: relatedGroup?.name || '小组', path: '/groups' };
    } else if (review.groupId) {
      return { label: relatedGroup?.name || '小组', path: '/groups' };
    } else {
      return { label: '复盘文章', path: '/reviews' };
    }
  };

  const backPath = getBackPath();

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal">$2</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br/>');
  };

  const sortedComments = useMemo(() => {
    return [...review.comments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [review.comments]);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回 {backPath.label}</span>
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-100">
        <Link to={backPath.path} className="hover:text-primary flex items-center gap-1">
          {backPath.label}
        </Link>
        {relatedGroup && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{review.title}</span>
          </>
        )}
        {viewingAs && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
            {viewingAs.name} 的视角
          </span>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              review.type === 'note' ? 'bg-blue-100 text-blue-700' :
              review.type === 'outline' ? 'bg-purple-100 text-purple-700' :
              'bg-green-100 text-green-700'
            }`}>
              {reviewTypeLabels[review.type]}
            </span>
            {review.isPendingValidation && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                <Lightbulb className="w-3 h-3" />
                待验证
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {review.visibility === 'private' ? (
                <><Lock className="w-3 h-3" /> 私密</>
              ) : (
                <><Users className="w-3 h-3" /> 小组可见</>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${review.isBookmarked ? 'fill-accent text-accent' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{review.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`}
              alt={review.authorName}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-900">{review.authorName}</span>
          </div>
          <span>·</span>
          <span>{formatDate(review.createdAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {review.views} 阅读
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {review.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="prose max-w-none text-gray-700 leading-relaxed">
          <p className="mb-4">
            {review.content.split('\n\n').map((paragraph, idx) => (
              <span key={idx} dangerouslySetInnerHTML={{ __html: renderMarkdown(paragraph).replace(/<p class="mb-4">|<\/p>/g, '') }} />
            ))}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ThumbsUp className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">{review.likes}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span>{review.comments.length} 评论</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          讨论区 ({review.comments.length})
        </h3>

        {review.visibility === 'group' || review.authorId === currentUser?.id ? (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <img 
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                alt={currentUser?.name || '我'}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="发表你的看法..."
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmitting}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    发布评论
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : review.authorId === currentUser?.id ? (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <img 
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                alt={currentUser?.name || '我'}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="发表你的看法..."
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmitting}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    发布评论
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            这是一篇私密笔记，只有作者可以评论
          </div>
        )}

        <div className="space-y-4">
          {review.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>暂无评论，来发表第一个看法吧</p>
            </div>
          ) : (
            sortedComments.map((comment, index) => (
              <div key={comment.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`}
                  alt={comment.authorName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    {comment.authorId === review.authorId && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                        作者
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    {index > 0 && (
                      <span className="text-xs text-gray-400">
                        · #{index + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
