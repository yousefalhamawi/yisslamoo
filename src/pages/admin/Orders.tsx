
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  MoreHorizontal, 
  X,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  Trash2,
  Gift,
  MessageSquare
} from 'lucide-react';
import { Order } from '../../types/admin';
import { useOrders } from '../../hooks/useOrders';
import { cn } from '../../utils/cn';
import { getColorName } from '../../utils/colorUtils';

const OrdersPage: React.FC = () => {
  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter(order => {
    const orderId = order.id || '';
    const customerName = order.customerName || '';
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = orderId.toLowerCase().includes(query) || 
                         customerName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'shipped': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'قيد التنفيذ';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdating(true);
    await updateOrderStatus(orderId, newStatus);
    setIsUpdating(false);
    setSelectedOrder(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      await deleteOrder(id);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة الطلبات</h1>
          <p className="text-slate-500 font-bold text-sm">تتبع وإدارة طلبات عملائك من مكان واحد.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
          <Printer className="w-4 h-4" />
          طباعة التقارير
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث برقم الطلب أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
          {['all', 'new', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border",
                statusFilter === status 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              )}
            >
              {status === 'all' ? 'الكل' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">طريقة الدفع</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{order.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{order.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 font-medium">
                      {new Date(order.date).toLocaleDateString('ar-SA')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{order.total.toLocaleString()} ل.س</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider",
                      getStatusColor(order.status)
                    )}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-[#F8FAFC] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-900">تفاصيل الطلب {selectedOrder.id}</h2>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider",
                    getStatusColor(selectedOrder.status)
                  )}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Order Items & Summary */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Items Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-black text-slate-900">المنتجات المطلوبة</h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={`${item.id || 'item'}-${idx}`} className="p-6 flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                              <img src={item.image || `https://picsum.photos/seed/${idx}/100/100`} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-slate-900">{item.name}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <p className="text-xs text-slate-500 font-bold">الكمية: {item.quantity}</p>
                                {item.selectedColor && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-500 font-bold">اللون:</p>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                      {item.selectedColor.startsWith('#') && (
                                        <div 
                                          className="w-3 h-3 rounded-full border border-white shadow-sm" 
                                          style={{ backgroundColor: item.selectedColor }}
                                        />
                                      )}
                                      <span className="text-[10px] font-black text-slate-700">
                                        {getColorName(item.selectedColor)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {item.selectedEngraving && (
                                  <p className="text-xs text-indigo-600 font-bold">النقش: {item.selectedEngraving}</p>
                                )}
                              </div>
                              {(item.selectedGiftWrapping || item.selectedGiftMessage) && (
                                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                  {item.selectedGiftWrapping && (
                                    <p className="text-[10px] text-amber-800 font-black mb-1 flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      {item.selectedGiftWrapping}
                                    </p>
                                  )}
                                  {item.selectedGiftMessage && (
                                    <p className="text-[10px] text-amber-700 font-bold">
                                      "{item.selectedGiftMessage}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-slate-900">{item.price.toLocaleString()} ل.س</p>
                              <p className="text-xs text-slate-400 font-bold">الإجمالي: {(item.price * item.quantity).toLocaleString()} ل.س</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>المجموع الفرعي</span>
                        <span>{(selectedOrder.total + (selectedOrder.discount || 0) - 50000).toLocaleString()} ل.س</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>تكلفة الشحن</span>
                        <span>٥٠,٠٠٠ ل.س</span>
                      </div>
                      {selectedOrder.discount && (
                        <div className="flex justify-between text-sm font-bold text-emerald-600">
                          <span>الخصم ({selectedOrder.couponCode})</span>
                          <span>-{selectedOrder.discount.toLocaleString()} ل.س</span>
                        </div>
                      )}
                      <div className="h-px bg-slate-100 my-2" />
                      <div className="flex justify-between text-xl font-black text-slate-900">
                        <span>الإجمالي الكلي</span>
                        <span>{selectedOrder.total.toLocaleString()} ل.س</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Customer & Shipping Info */}
                  <div className="space-y-8">
                    {/* Customer Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">معلومات العميل</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">البريد الإلكتروني</p>
                            <p className="text-sm font-black text-slate-900">{selectedOrder.customerName}@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">رقم الهاتف</p>
                            <p className="text-sm font-black text-slate-900" dir="ltr">{selectedOrder.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">عنوان الشحن</h3>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedOrder.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Gift Customization Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">تخصيص الإهداء</h3>
                      {selectedOrder.isGift ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                              <Gift className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">طلب إهداء</p>
                              <p className="text-sm font-black text-slate-900">نعم</p>
                            </div>
                          </div>
                          {selectedOrder.giftWrapping && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">نوع التغليف</p>
                                <p className="text-sm font-black text-slate-900">{selectedOrder.giftWrapping}</p>
                              </div>
                            </div>
                          )}
                          {selectedOrder.giftMessage && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm flex gap-3">
                              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">رسالة الإهداء</p>
                                "{selectedOrder.giftMessage}"
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-400 text-center py-4">لا يوجد تخصيص إهداء مختار</p>
                      )}
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">الجدول الزمني</h3>
                      <div className="space-y-6 relative before:absolute before:right-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        <div className="relative flex gap-4 items-start">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">تم إنشاء الطلب</p>
                            <p className="text-[10px] text-slate-400 font-bold">١١ مارس ٢٠٢٦ - ١٠:٣٠ ص</p>
                          </div>
                        </div>
                        <div className="relative flex gap-4 items-start">
                          <div className="w-6 h-6 bg-indigo-500 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">قيد المراجعة</p>
                            <p className="text-[10px] text-slate-400 font-bold">١١ مارس ٢٠٢٦ - ١٠:٤٥ ص</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-3">
                  <select 
                    id="status-select"
                    defaultValue={selectedOrder.status}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="new">جديد</option>
                    <option value="processing">قيد التنفيذ</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">إلغاء الطلب</option>
                  </select>
                  <button 
                    disabled={isUpdating}
                    onClick={() => {
                      const select = document.getElementById('status-select') as HTMLSelectElement;
                      handleStatusUpdate(selectedOrder.id, select.value as any);
                    }}
                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                    تحديث الحالة
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;
