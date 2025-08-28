'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { User as UserIcon, Plus, FileDown, Search, Edit, Trash2, Users } from 'lucide-react'

interface subscriber {
  id: string
  status: string
  subscribed_at: string
  user: IUser
 
}

interface IUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  affiliation: string | null
  createdAt: string
}

const SubscribersList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [subscribers, setSubscribers] = useState<subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await api.get('/subscribers')
        if (response.status !== 200) {
          throw new Error('فشل في جلب البيانات')
        }
        const data = response.data.data ?? []

        if (!Array.isArray(data)) {
          throw new Error('تنسيق البيانات غير صحيح')
        }
        setSubscribers(data)
      } catch (error) {
        console.error('Error fetching subscribers:', error)
        setSubscribers([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubscribers()
  }, [])

  const filteredSubscribers = Array.isArray(subscribers)
    ? subscribers.filter((subscriber) => {
        const name = subscriber?.user?.name || ''
        const email = subscriber?.user?.email || ''
        const phone = subscriber?.user?.phone || ''
        const term = searchTerm.toLowerCase()

        return (
          name.toLowerCase().includes(term) ||
          email.toLowerCase().includes(term) ||
          phone.includes(searchTerm)
        )
      })
    : []

  const handleDelete = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      try {
        const response = await api.delete(`/subscribers/${userId}`, {
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.status === 200) {
          setSubscribers(subscribers.filter((user) => user.id !== userId))
        } else {
          alert('فشل في حذف العضو')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const printPdf = async () => {
  const html2pdf = (await import('html2pdf.js')).default;
  if (!subscribers.length) return;

  // إنشاء عنصر مؤقت
  const tempDiv = document.createElement('div');
  tempDiv.style.direction = 'rtl';
  tempDiv.style.textAlign = 'right';
tempDiv.innerHTML = `
  <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="text-align:center; margin-bottom: 20px;">قائمة الأعضاء</h2>
    <table style="width:100%; border-collapse: collapse; text-align: center;">
      <thead>
        <tr style="background-color: #2980b9; color: white;">
          <th style="padding: 10px; border: 1px solid #ddd;">الاسم</th>
          <th style="padding: 10px; border: 1px solid #ddd;">رقم الهاتف</th>
          <th style="padding: 10px; border: 1px solid #ddd;">الصلاحيات</th>
          <th style="padding: 10px; border: 1px solid #ddd;">تاريخ التسجيل</th>
        </tr>
      </thead>
      <tbody>
        ${filteredSubscribers
          .map(
            (s, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#f2f2f2' : '#ffffff'};">
            <td style="padding: 10px; border: 1px solid #ddd;">${s.user.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${s.user.phone || '-'}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${s.status}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(s.subscribed_at).toLocaleDateString('en-US')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="text-align:right; margin-top:20px; font-size:14px; color:#555;">
      تاريخ الطباعة: ${new Date().toLocaleDateString('en-US')} - ${new Date().toLocaleTimeString('en-US')}
    </div>
  </div>
`;

  // إضافة العنصر المؤقت إلى DOM

  document.body.appendChild(tempDiv);

  const opt = {
    margin: 10,
    filename: 'قائمة_الأعضاء.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  try {
    await html2pdf().set(opt).from(tempDiv).save();
  } catch (error) {
    console.error(error);
  } finally {
    document.body.removeChild(tempDiv);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">إدارة الأعضاء</h1>
              <p className="text-gray-600">إدارة قائمة الأعضاء والمشتركين في الجمعية</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/members/add"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              إضافة عضو جديد
            </Link>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={printPdf}
            >
              <FileDown className="w-5 h-5" />
              تصدير PDF
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن عضو بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" ref={tableRef}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    الاسم
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                  رقم الهاتف
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                  تاريخ التسجيل
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber, index) => (
                <tr
                  key={`${subscriber.id || 'no-id'}-${index}`}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {subscriber.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{subscriber.user.name}</div>
                        <div className="text-sm text-gray-500">{subscriber.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 font-medium">
                      {subscriber.user.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      subscriber.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : subscriber.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriber.status || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {new Date(subscriber.subscribed_at).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/members/${subscriber.id}/updateUser`}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(subscriber.id)}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد نتائج للبحث</p>
            <p className="text-gray-400">جرب تغيير كلمات البحث</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscribersList
