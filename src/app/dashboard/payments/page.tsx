"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api"; // Axios instance 
import PaymentModal from "./PaymentModal";
import { CreditCard, ArrowRight, Download, Calendar, Users, DollarSign, FileText } from 'lucide-react';

interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  affiliation: string;
  createdAt: string;
}

interface Subscriber {
  id: number;
  status: string; // active / inactive (عضوية)
  subscribed_at: string;
  user: IUser;
  subscription?: Subscription | null; // تفاصيل الاشتراك الشهري الحالي
}

interface Subscription {
  id: number;
  month: number;
  year: number;
  status: string;
  amount: number;
  payment_method: string | null;
  paidAt: string | null;

}

// Backend response shapes
interface BackendUser {
  id: number;
  name: string;
  email: string;
  phone: number | string;
  address?: string | null;
}

interface BackendSubscription {
  id: number;
  amount: number;
  month: number | string;
  payment_method?: string | null;
  status: string;
  paid_at?: string | null;
  paidAt?: string | null;
  year: number | string;
}

interface BackendItem {
  Subscriber_Id?: number;
  id?: number;
  status: string;
  subscribed_at?: string | null;
  user: BackendUser;
  subscriptions: BackendSubscription[];
}

export default function SubscriptionsPage() {
  // ⏳ حالة التحميل
  const [loading, setLoading] = useState(false);

  // 📅 اختيار الشهر والسنة
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // 📦 بيانات الاشتراكات
  const [subscriptions, setSubscriptions] = useState<Subscriber[]>([]);

  // 💳 حالة نافذة الدفع
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Subscriber | null>(null);

  // 🖨 مرجع الجدول لتصديره
  const tableRef = useRef<HTMLTableElement>(null);

  // 📡 جلب البيانات من الباك إند
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/subscription?month=${month}&year=${year}`);
      const apiItems = (response?.data?.data ?? []) as BackendItem[];
      const normalized: Subscriber[] = apiItems.map((item: BackendItem) => {
        const subsArray = Array.isArray(item.subscriptions) ? item.subscriptions : [];
        const current = subsArray.find((s) => Number(s.month) === month && Number(s.year) === year) || null;
        const subscription: Subscription | null = current
          ? {
              id: Number(current.id),
              month: Number(current.month),
              year: Number(current.year),
              status: String(current.status || '').toLowerCase(),
              amount: Number(current.amount) || 0,
              payment_method: current.payment_method ?? null,
              paidAt: current.paid_at ?? current.paidAt ?? null,
            }
          : null;

        const user = item.user;
        return {
          id: Number(item.Subscriber_Id ?? item.id ?? 0),
          status: String(item.status ?? ''),
          subscribed_at: item.subscribed_at ?? '',
          user: {
            id: Number(user?.id ?? 0),
            name: String(user?.name ?? ''),
            email: String(user?.email ?? ''),
            phone: String(user?.phone ?? ''),
            role: '',
            affiliation: '',
            createdAt: '',
          },
          subscription,
        };
      });

      setSubscriptions(normalized);
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  // ⏱ تحميل البيانات عند تغيير الشهر أو السنة
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 📄 تصدير الجدول إلى PDF
  
  const printPdf = async () => {
    if (!tableRef.current) {
      toast.error('لا يمكن العثور على الجدول للطباعة');
      return;
    }
  
    try {
      // إنشاء عنصر منفصل للطباعة
      const printElement = document.createElement('div');
      printElement.innerHTML = `
        <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; background: white;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px;">
            <h1 style="color: #10b981; margin: 0; font-size: 24px;">إدارة الاشتراكات الشهرية</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">${getMonthName(month)} ${year}</p>
          </div>
  
          <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #d1fae5;">
                <div style="color: #10b981; font-size: 24px; font-weight: bold;">${totalSubscriptions}</div>
                <div style="color: #6b7280; font-size: 12px;">إجمالي الاشتراكات</div>
              </div>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #dcfce7;">
                <div style="color: #16a34a; font-size: 24px; font-weight: bold;">${paidSubscriptions}</div>
                <div style="color: #6b7280; font-size: 12px;">الاشتراكات المدفوعة</div>
              </div>
              <div style="background: #fefce8; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #fef3c7;">
                <div style="color: #ca8a04; font-size: 24px; font-weight: bold;">${pendingSubscriptions}</div>
                <div style="color: #6b7280; font-size: 12px;">قيد الانتظار</div>
              </div>
              <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #dbeafe;">
                <div style="color: #2563eb; font-size: 24px; font-weight: bold;">${totalAmount} ر.س</div>
                <div style="color: #6b7280; font-size: 12px;">إجمالي المبالغ</div>
              </div>
            </div>
          </div>
  
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; font-size: 12px;">
            <thead style="background: linear-gradient(90deg, #ecfdf5, #f0fdf4);">
              <tr>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151; font-weight: bold;">الاسم</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151; font-weight: bold;">الهاتف</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151; font-weight: bold;">نوع العضو</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151; font-weight: bold;">الحالة</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151; font-weight: bold;">تاريخ الدفع</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151; font-weight: bold;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${subscriptions.map((sub, index) => `
                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                  <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">${sub.user.name}</td>
                  <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">${sub.user.phone}</td>
                  <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">
                    <span style="
                      padding: 4px 8px;
                      border-radius: 12px;
                      font-size: 10px;
                      font-weight: 500;
                      ${sub.status === "active"
                        ? 'background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;'
                        : 'background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;'
                      }
                    ">
                      ${sub.status === "active" ? "منتسب" : "غير منتسب"}
                    </span>
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">
                    <span style="
                      padding: 4px 8px;
                      border-radius: 12px;
                      font-size: 10px;
                      font-weight: 500;
                      ${(sub.subscription?.status === "paid")
                        ? 'background: #f0fdf4; color: #166534; border: 1px solid #dcfce7;'
                        : (sub.subscription?.status === "pending")
                        ? 'background: #fefce8; color: #92400e; border: 1px solid #fef3c7;'
                        : 'background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;'
                      }
                    ">
                      ${(sub.subscription?.status === "paid") ? "✅ مدفوع" : (sub.subscription?.status === "pending") ? "⌛ قيد الانتظار" : "❌ فشل"}
                    </span>
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">${sub.subscription?.paidAt || "-"}</td>
                  <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right; font-weight: bold; color: #10b981;">${sub.subscription?.amount ?? 0} ر.س</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
  
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>تم إنشاء هذا التقرير في ${new Date().toLocaleDateString('ar-SA')}</p>
            <p>الجمعية الخيرية - لوحة التحكم</p>
          </div>
        </div>
      `;
  
      // إضافة العنصر إلى الصفحة
      printElement.setAttribute('data-print-element', 'true');
      printElement.style.position = 'static'; // ❌ بدل fixed
      printElement.style.width = '100%';
      printElement.style.backgroundColor = 'white';
      printElement.style.overflow = 'visible'; // ❌ بدل auto
      document.body.appendChild(printElement);
  
      // انتظار قليل لضمان تحميل العنصر
      await new Promise(resolve => setTimeout(resolve, 200));
  
      // استيراد html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
  
      // إنشاء PDF
      await html2pdf()
        .from(printElement)
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `اشتراكات-${getMonthName(month)}-${year}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait", compress: true },
        })
        .save();
  
      // إزالة العنصر المؤقت
      document.body.removeChild(printElement);
  
      toast.success('تم تصدير PDF بنجاح! 📄', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          padding: '16px',
          borderRadius: '12px',
        },
      });
  
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء تصدير PDF', { position: 'top-center' });
  
      // إزالة العنصر في حالة حدوث خطأ
      const existingElement = document.querySelector('[data-print-element]');
      if (existingElement) {
        document.body.removeChild(existingElement);
      }
    }
  };
  

  // حساب الإحصائيات
  // const totalSubscriptions = subscriptions?.length ?? 0;
  // const paidSubscriptions = subscriptions.filter(sub => sub.subscription.status === "active" )?.length ?? 0;
  // const pendingSubscriptions = subscriptions.filter(sub => sub.subscription.status === "paid")?.length ?? 0;
  // const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.subscription.amount, 0);
  const totalSubscriptions = subscriptions?.length ?? 0;

  const paidSubscriptions = subscriptions?.filter(sub => sub.subscription?.status === "paid").length ?? 0;
  
  const pendingSubscriptions = subscriptions?.filter(sub => sub.subscription?.status === "pending").length ?? 0;
  
  const totalAmount = subscriptions?.reduce((sum, sub) => sum + (sub.subscription?.amount ?? 0), 0) ?? 0;
  
  // الحصول على اسم الشهر
  const getMonthName = (monthNumber: number) => {
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return months[monthNumber - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-white">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة الاشتراكات الشهرية</h1>
            <p className="text-gray-600">إدارة وتتبع جميع الاشتراكات والمدفوعات</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className="w-4 h-4" />
          <span>لوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-emerald-600 font-medium">إدارة الاشتراكات</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي الاشتراكات</p>
              <p className="text-2xl font-bold text-emerald-600">{totalSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">الاشتراكات المدفوعة</p>
              <p className="text-2xl font-bold text-green-600">{paidSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">قيد الانتظار</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي المبالغ</p>
              <p className="text-2xl font-bold text-blue-600">{totalAmount} ر.س</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">الفترة الزمنية:</span>
            </div>
            
            {/* اختيار الشهر */}
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))} 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>

            {/* اختيار السنة */}
            <select 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))} 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* زر تصدير PDF */}
          <button 
            onClick={printPdf} 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                <tr>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">الاسم</th>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">الهاتف</th>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">نوع العضو</th>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">الحالة</th>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">تاريخ الدفع</th>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">المبلغ</th>
                  <th className="p-4 text-right font-semibold text-gray-700 border-b border-emerald-200">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length > 0 ? (
                  subscriptions.map((sub, index) => (
                    <tr key={sub.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-4 text-right border-b border-gray-100">{sub.user.name}</td>
                      <td className="p-4 text-right border-b border-gray-100">{sub.user.phone}</td>
                      <td className="p-4 text-right border-b border-gray-100">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === "active" 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {sub.status === "active" ? "منتسب" : "غير منتسب"}
                        </span>
                      </td>
                      <td className="p-4 text-right border-b border-gray-100">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (sub.subscription?.status === "paid") 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {(sub.subscription?.status === "paid") ? "تم " : "لم يدفع بعد"}
                        </span>
                      </td>
                      <td className="p-4 text-right border-b border-gray-100">{sub.subscription?.paidAt || "-"}</td>
                      <td className="p-4 text-right border-b border-gray-100 font-semibold text-emerald-600">{sub.subscription?.amount ?? 0} ر.س</td>
                      <td className="p-4 text-right border-b border-gray-100">
                        {sub.subscription?.status !== "paid" && (
                          <button
                            onClick={() => {
                              setSelectedUser(sub);
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-sm font-medium"
                          >
                            دفع
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">لا توجد بيانات</p>
                        <p className="text-sm">لم يتم العثور على اشتراكات للفترة المحددة</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 💳 نافذة الدفع */}
      {showPaymentModal && selectedUser && (
        <PaymentModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedUser={{
            id: selectedUser.user.id.toString(),
            name: selectedUser.user.name,
            phoneNumber: selectedUser.user.phone,
            memberType: selectedUser.status === "active" ? "AFFILIATED" : "NON_MEMBER",
            affiliation: selectedUser.user.affiliation,
            status: selectedUser.subscription?.status === "paid" ? "COMPLETED" : "PENDING",
            paidAt: selectedUser.subscription?.paidAt ?? null,
            amount: selectedUser.subscription?.amount ?? 0,
            method: selectedUser.subscription?.payment_method ?? null
          }}
          month={month}
          year={year}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
