
import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Search,
  MessageSquare,
  ThumbsUp,
  Loader2,
  Trash2
} from 'lucide-react';
import { useReviews } from '../../hooks/useReviews';
import { cn } from '../../utils/cn';

const ReviewsPage: React.FC = () => {
  const { reviews, loading, updateReviewStatus, deleteReview } = useReviews();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter(review => {
    const comment = review.comment || '';
    const customer = review.customer || '';
    const productName = review.productName || '';
    const query = searchQuery.toLowerCase();
    
    return comment.toLowerCase().includes(query) || 
           customer.toLowerCase().includes(query) ||
           productName.toLowerCase().includes(query);
  });

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const positivePercentage = reviews.length > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">تقييمات العملاء</h1>
          <p className="text-slate-500 font-bold text-sm">راقب آراء عملائك وحسن جودة خدماتك.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">متوسط التقييم</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-slate-900">{averageRating}</p>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i} 
                  className={cn("w-4 h-4", i <= Math.round(Number(averageRating)) ? "fill-current" : "text-slate-200")} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">إجمالي التقييمات</p>
          <p className="text-2xl font-black text-slate-900">{reviews.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 text-amber-600">بانتظار المراجعة</p>
          <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 text-emerald-600">تقييمات إيجابية</p>
          <p className="text-2xl font-black text-slate-900">{positivePercentage}٪</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="البحث في التعليقات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-slate-50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-lg">
                    {review.customer?.[0] || '?'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{review.customer}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-current" : "text-slate-200")} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{review.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black hover:bg-emerald-100 transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        قبول
                      </button>
                      <button 
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-black hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wider">المنتج: {review.productName}</p>
                <p className="text-sm text-slate-700 font-bold leading-relaxed">{review.comment}</p>
              </div>

              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all">
                  <ThumbsUp className="w-4 h-4" />
                  مفيد (١٢)
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all">
                  <MessageSquare className="w-4 h-4" />
                  رد الإدارة
                </button>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                  review.status === 'approved' ? "bg-emerald-50 text-emerald-600" : 
                  review.status === 'rejected' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                )}>
                  {review.status === 'approved' ? 'مقبول' : review.status === 'rejected' ? 'مرفوض' : 'معلق'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
