import React, { useState, useMemo } from 'react';
import { Plus, Bookmark, Lightbulb, MessageCircle, ThumbsUp, Eye, Lock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime, formatDate, reviewTypeLabels } from '../../utils/formatters';

export function ReviewsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { reviews, user } = state;

  const [filterType, setFilterType] = useState('all');
  const [showSidebar, setShowSidebar] = useState(true);

  const filteredReviews = useMemo(() => {
    let filtered = reviews;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, filterType]);

  const bookmarkedReviews = useMemo(() => {
    return reviews.filter(r => r.isBookmarked);
  }, [reviews]);

  const pendingValidationReviews = useMemo(() => {
    return reviews.filter(r => r.isPendingValidation);
  }, [reviews]);

  const handleToggleBookmark = (reviewId: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: reviewId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('note')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'note' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            笔记
          </button>
          <button
            onClick={() => setFilterType('outline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'outline' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            提纲
          </button>
          <button
            onClick={() => setFilterType('practice')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'practice' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            可借鉴
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
          </Button>
          <Button onClick={() => navigate('/reviews/new')}>
            <Plus className="w-4 h-4 mr-2" />
            写笔记
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredReviews.map(review => (
            <Card 
              key={review.id} 
              hover 
              className="cursor-pointer"
              onClick={() => navigate(`/reviews/${review.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
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
                      💡 待验证
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
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBookmark(review.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Bookmark className={`w-5 h-5 ${review.isBookmarked ? 'fill-accent text-accent' : 'text-gray-400'}`} />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {review.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {review.content.replace(/[#*`]/g, '').substring(0, 150)}...
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                {review.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`}
                    alt={review.authorName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{review.authorName}</span>
                  <span className="text-sm text-gray-400">·</span>
                  <span className="text-sm text-gray-400">{formatRelativeTime(review.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {review.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {review.comments.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {review.views}
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {filteredReviews.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">暂无文章</p>
                <Button onClick={() => navigate('/reviews/new')}>写第一篇笔记</Button>
              </div>
            </Card>
          )}
        </div>

        {showSidebar && (
          <div className="space-y-6">
            <Card title="📚 收藏夹">
              {bookmarkedReviews.length > 0 ? (
                <div className="space-y-3">
                  {bookmarkedReviews.map(review => (
                    <div 
                      key={review.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/reviews/${review.id}`)}
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                        {review.title}
                      </p>
                      <p className="text-xs text-gray-500">{review.authorName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无收藏</p>
              )}
            </Card>

            <Card title="💡 待验证想法">
              {pendingValidationReviews.length > 0 ? (
                <div className="space-y-3">
                  {pendingValidationReviews.map(review => (
                    <div 
                      key={review.id} 
                      className="p-3 bg-accent/5 rounded-lg border border-accent/20 cursor-pointer hover:bg-accent/10 transition-colors"
                      onClick={() => navigate(`/reviews/${review.id}`)}
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {review.title}
                      </p>
                      <p className="text-xs text-gray-500">{review.authorName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无待验证想法</p>
              )}
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">分享你的经营心得</p>
                <p className="text-xs text-gray-500">记录经验，沉淀知识</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
