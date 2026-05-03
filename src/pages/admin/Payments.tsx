
import React from 'react';
import { CreditCard, Plus, ShieldCheck, Wallet, Landmark, Loader2 } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import { cn } from '../../utils/cn';

const PaymentsPage: React.FC = () => {
  const { methods, loading, toggleMethod } = usePayments();

  const getIcon = (type: string) => {
    switch (type) {
      case 'cod': return Wallet;
      case 'card': return CreditCard;
      case 'stc': return ShieldCheck;
      case 'bank': return Landmark;
      default: return CreditCard;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إعدادات الدفع</h1>
          <p className="text-slate-500 font-bold text-sm">أدر طرق الدفع المتاحة لعملائك.</p>
        </div>
      </div>

      {loading && methods.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods.map((method) => {
            const Icon = getIcon(method.type);
            return (
              <div key={method.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    method.status === 'نشط' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {method.status}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">{method.name}</h3>
                <p className="text-sm text-slate-500 font-bold mb-6">{method.desc}</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-black hover:bg-slate-100 transition-all">إعدادات</button>
                  <button 
                    onClick={() => toggleMethod(method.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-black transition-all",
                      method.status === 'نشط' ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    {method.status === 'نشط' ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
