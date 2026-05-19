
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Save, X, History, ChevronDown, Loader2 } from 'lucide-react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { formatSYP, isValidExchangeRate } from '../../utils/pricingEngine';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ExchangeRateWidgetProps {
  /** عرض بسيط (في header لوحة التحكم) أم موسع (في صفحة الإعدادات) */
  variant?: 'compact' | 'full';
}

const ExchangeRateWidget: React.FC<ExchangeRateWidgetProps> = ({ variant = 'compact' }) => {
  const {
    exchangeRate,
    exchangeRateUpdatedAt,
    loading,
    history,
    historyLoading,
    updateRate,
    loadHistory,
  } = useExchangeRate();

  const [isEditing, setIsEditing] = useState(false);
  const [newRate, setNewRate] = useState(exchangeRate.toString());
  const [showHistory, setShowHistory] = useState(false);
  const [note, setNote] = useState('');

  // مزامنة الحقل مع القيمة الحالية
  useEffect(() => {
    setNewRate(exchangeRate.toString());
  }, [exchangeRate]);

  const handleSave = async () => {
    const parsed = parseFloat(newRate);
    if (!isValidExchangeRate(parsed)) return;

    const success = await updateRate(parsed, note || undefined);
    if (success) {
      setIsEditing(false);
      setNote('');
    }
  };

  const handleCancel = () => {
    setNewRate(exchangeRate.toString());
    setIsEditing(false);
    setNote('');
  };

  const previewPrice = (usd: number) => formatSYP(Math.round(usd * (parseFloat(newRate) || exchangeRate)));

  // ── الوضع المضغوط (compact) ───────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="text-xs font-black text-slate-500">$1 =</span>
        <span className="text-sm font-black text-slate-900">{exchangeRate.toLocaleString()} ل.س</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors mr-1 underline"
        >
          تعديل
        </button>

        <AnimatePresence>
          {isEditing && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-[200]"
                onClick={handleCancel}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-[210] bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 w-96"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900">تحديث سعر الدولار</h3>
                  <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600">السعر الجديد (ليرة سورية / $)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-16 text-xl font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        min="1"
                        step="1"
                        autoFocus
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">ل.س/$</span>
                    </div>
                  </div>

                  {/* معاينة */}
                  {isValidExchangeRate(parseFloat(newRate)) && (
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">معاينة فورية</p>
                      <div className="space-y-1">
                        {[5, 10, 25].map(usd => (
                          <div key={usd} className="flex justify-between text-sm">
                            <span className="font-black text-indigo-700">{previewPrice(usd)}</span>
                            <span className="text-indigo-400 font-bold">${usd}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600">ملاحظة (اختياري)</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="مثلاً: تحديث يومي"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading || !isValidExchangeRate(parseFloat(newRate))}
                      className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      حفظ السعر
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── الوضع الموسع (full) ───────────────────────────────────────
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="font-black text-slate-900">إدارة سعر صرف الدولار</h3>
      </div>

      <div className="p-8 space-y-8">
        {/* السعر الحالي */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السعر الحالي</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{exchangeRate.toLocaleString()}</span>
              <span className="text-sm font-black text-slate-400">ليرة سورية / $1</span>
            </div>
            {exchangeRateUpdatedAt && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-400">
                  آخر تحديث:{' '}
                  {formatDistanceToNow(new Date(exchangeRateUpdatedAt), { addSuffix: true, locale: ar })}
                </span>
              </div>
            )}
          </div>

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <span className="text-2xl font-black text-indigo-600">$</span>
          </div>
        </div>

        {/* حقل تعديل السعر */}
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-700">السعر الجديد (ليرة سورية مقابل $1)</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pr-4 pl-16 text-xl font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                min="1"
                step="1"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">ل.س/$</span>
            </div>
            <button
              onClick={handleSave}
              disabled={loading || parseFloat(newRate) === exchangeRate || !isValidExchangeRate(parseFloat(newRate))}
              className="px-6 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600">ملاحظة على التحديث (اختياري)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: تحديث بناءً على سعر السوق اليوم"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* معاينة الأسعار */}
        {isValidExchangeRate(parseFloat(newRate)) && (
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">معاينة تأثير السعر الجديد</p>
            <div className="grid grid-cols-3 gap-4">
              {[5, 10, 25, 50, 100, 250].map(usd => (
                <div key={usd} className="text-center bg-white/70 rounded-xl p-3 border border-white">
                  <p className="text-xs font-bold text-slate-400 mb-1">${usd}</p>
                  <p className="text-sm font-black text-slate-900">{previewPrice(usd)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* سجل التحديثات */}
        <div>
          <button
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <History className="w-4 h-4" />
            سجل تحديثات السعر
            <ChevronDown className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                {historyLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-4">لا يوجد سجل بعد</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <span className="text-sm font-black text-slate-900">{log.rate.toLocaleString()} ل.س/$</span>
                          {log.note && <span className="text-[10px] text-slate-400 font-bold mr-2">— {log.note}</span>}
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-slate-400 font-bold">
                            {new Date(log.created_at).toLocaleDateString('ar-SY')}
                          </p>
                          {log.changed_by && (
                            <p className="text-[9px] text-slate-300 font-bold">{log.changed_by}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateWidget;
