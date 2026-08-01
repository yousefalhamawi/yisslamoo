
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { useSharedStore } from '../../store/useSharedStore';
import { User } from '../../types/index';

interface CustomerOrdersProps {
  user: User;
  onBack: () => void;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({ user, onBack }) => {
  const { orders } = useSharedStore();
  
  // Filter orders for this user
  const userOrders = orders.filter(order => {
    if (!order.customerEmail || !user.email) return false;
    return order.customerEmail.toLowerCase().trim() === user.email.toLowerCase().trim();
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'new': return { label: 'جديد', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Clock className="w-4 h-4" /> };
      case 'processing': return { label: 'قيد التنفيذ', color: 'text-orange-600', bg: 'bg-orange-50', icon: <Package className="w-4 h-4" /> };
      case 'shipped': return { label: 'تم الشحن', color: 'text-purple-600', bg: 'bg-purple-50', icon: <Package className="w-4 h-4" /> };
      case 'delivered': return { label: 'تم التوصيل', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle className="w-4 h-4" /> };
      case 'cancelled': return { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="w-4 h-4" /> };
      default: return { label: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: <Clock className="w-4 h-4" /> };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 page-offset pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">طلباتي</h1>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold"
          >
            <span>العودة للمتجر</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات بعد</h2>
            <p className="text-gray-500 mb-8">لم تقم بإجراء أي طلبات حتى الآن. ابدأ التسوق الآن!</p>
            <button 
              onClick={onBack}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primaryDark transition-all"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => {
              const status = getStatusInfo(order.status);
              return (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-bottom border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 font-bold mb-1">رقم الطلب</div>
                        <div className="font-black text-gray-900">{order.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-sm text-gray-400 font-bold mb-1">التاريخ</div>
                        <div className="font-bold text-gray-900">{new Date(order.date).toLocaleDateString('ar-SA')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 font-bold mb-1">الإجمالي</div>
                        <div className="font-black text-primary">{order.total.toLocaleString()} ر.س</div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${status.bg} ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                          <div className="text-xs text-gray-400 mt-1">الكمية: {item.quantity}</div>
                        </div>
                        <div className="font-bold text-gray-900">{item.price.toLocaleString()} ر.س</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
