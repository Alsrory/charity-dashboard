'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, ArrowRight, Plus, Search, Edit, Trash2, Calendar, User, AlertTriangle, X, Eye } from 'lucide-react'

interface News {
  id: string
  title: string
  details: string
  photo: string | null
  publish_date: string
  writer: Writer
}

interface Writer {
  id: string  
  name: string
}

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; news: News | null }>({
    show: false,
    news: null
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/news')
      const data = await response.data.data ?? []
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.details.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openDeleteModal = (newsItem: News) => {
    setDeleteModal({ show: true, news: newsItem });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, news: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.news) return;

    setDeleting(true);
    try {
      const response = await api.delete(`news/${deleteModal.news.id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.status === 200) {
        setNews(news.filter(item => item.id !== deleteModal.news!.id))
        toast.success('تم حذف الخبر بنجاح! 🎉', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#F97316',
            color: '#fff',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '12px',
          },
        });
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error('حدث خطأ أثناء حذف الخبر', {
        position: 'top-center'
      });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة الأخبار</h1>
            <p className="text-gray-600">عرض وإدارة جميع الأخبار في النظام</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>لوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-orange-600 font-medium">إدارة الأخبار</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث عن خبر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
          <Link
            href="/dashboard/news/add"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            إضافة خبر جديد
          </Link>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {item.photo && (
              <div className="relative h-48">
                <Image
                  src={item.photo}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/file.svg";
                  }}
                />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                  {item.publish_date
                    ? new Date(item.publish_date).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "تاريخ غير متوفر"}
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 line-clamp-2 mb-3">
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                {item.details}
              </p>
              
              {/* News Information Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-semibold text-gray-700">معلومات الخبر</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      تاريخ النشر
                    </span>
                    <span className="font-semibold text-orange-600 text-sm">
                      {item.publish_date
                        ? new Date(item.publish_date).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "غير متوفر"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4 text-orange-500" />
                      الكاتب
                    </span>
                    <span className="font-semibold text-orange-600 text-sm">
                      {item.writer.name || 'غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/news/${item.id}/view`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </Link>
                <Link
                  href={`/dashboard/news/${item.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </Link>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300"
                  onClick={() => openDeleteModal(item)}
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              لا توجد أخبار
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'لم يتم العثور على أخبار تطابق البحث' : 'ابدأ بإضافة خبر جديد للنظام'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/news/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                إضافة خبر جديد
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.news && (
        <div className="fixed inset-0 bg-black bg-opacity-35 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
                <p className="text-sm text-gray-600">هل أنت متأكد من حذف هذا الخبر؟</p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* News Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{deleteModal.news.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{deleteModal.news.details}</p>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">
                  تحذير: لا يمكن التراجع عن هذا الإجراء بعد الحذف
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-500 disabled:hover:to-red-600 disabled:hover:shadow-lg disabled:hover:transform-none"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    جاري الحذف...
                  </>
                ) : (
                  'حذف الخبر'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsPage 