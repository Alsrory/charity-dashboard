'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'
import { FileText, ArrowRight, Calendar, User, Edit, Trash2, ArrowLeft, Clock, Eye, Share2, AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface News {
  id: string
  title: string
  details: string
  photo: string | null
  publish_date: string
  writer: Writer
  created_at?: string
  updated_at?: string
}

interface Writer {
  id: string  
  name: string
}

const ViewNews = () => {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [id])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/news/${id}`)
      const data = response.data.data
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
      toast.error('حدث خطأ أثناء تحميل الخبر')
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = () => {
    setDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setDeleteModal(false)
  }

  const handleDelete = async () => {
    if (!news) return

    setDeleting(true)
    try {
      const response = await api.delete(`/news/${news.id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.status === 200) {
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
        })
        router.push('/dashboard/news')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error('حدث خطأ أثناء حذف الخبر', {
        position: 'top-center'
      })
    } finally {
      setDeleting(false)
      closeDeleteModal()
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "تاريخ غير متوفر"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل الخبر...</p>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            الخبر غير موجود
          </h3>
          <p className="text-gray-500 mb-6">
            يبدو أن الخبر الذي تبحث عنه غير موجود أو تم حذفه
          </p>
          <Link
            href="/dashboard/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للأخبار
          </Link>
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
            <h1 className="text-3xl font-bold text-gray-800">تفاصيل الخبر</h1>
            <p className="text-gray-600">عرض جميع تفاصيل الخبر المحدد</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>لوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
          <Link href="/dashboard/news" className="text-orange-600 hover:text-orange-700 transition-colors">
            إدارة الأخبار
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-orange-600 font-medium">تفاصيل الخبر</span>
        </div>
      </div>

      {/* News Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* News Image */}
        {news.photo && (
          <div className="relative h-96 w-full">
            <Image
              src={news.photo}
              alt={news.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/file.svg"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 right-4 text-white">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                <p className="text-sm font-medium">صورة الخبر</p>
              </div>
            </div>
          </div>
        )}

        {/* News Details */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
            {news.title}
          </h2>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ النشر</p>
                <p className="font-semibold text-gray-800">{formatDate(news.publish_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">الكاتب</p>
                <p className="font-semibold text-gray-800">{news.writer.name || 'غير محدد'}</p>
              </div>
            </div>

            {news.created_at && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                  <p className="font-semibold text-gray-800">{formatDate(news.created_at)}</p>
                </div>
              </div>
            )}

            {news.updated_at && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">آخر تحديث</p>
                  <p className="font-semibold text-gray-800">{formatDate(news.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-700">محتوى الخبر</h3>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {news.details}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
            <Link
              href={`/dashboard/news/${news.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Edit className="w-5 h-5" />
              تعديل الخبر
            </Link>

            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200"
            >
              <Trash2 className="w-5 h-5" />
              حذف الخبر
            </button>

            <Link
              href="/dashboard/news"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للأخبار
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
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
                  <h4 className="font-semibold text-gray-800">{news.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{news.details}</p>
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

export default ViewNews
