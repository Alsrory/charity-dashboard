'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'
import { Target, ArrowRight, Calendar, DollarSign, Edit, Trash2, ArrowLeft, Clock, Eye, TrendingUp, AlertTriangle, X, Users, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Initiative {
  id: string
  title: string
  description: string
  photo_url: string | null
  created_at: string
  current_amount: number
  target_amount: number
  updated_at?: string
}

const ViewInitiative = () => {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchInitiative()
  }, [id])

  const fetchInitiative = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/initiatives/${id}`)
      const data = response.data.data
      setInitiative(data)
    } catch (error) {
      console.error('Error fetching initiative:', error)
      toast.error('حدث خطأ أثناء تحميل المبادرة')
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
    if (!initiative) return

    setDeleting(true)
    try {
      const response = await api.delete(`/initiatives/${initiative.id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.status === 200) {
        toast.success('تم حذف المبادرة بنجاح! 🎉', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#8B5CF6',
            color: '#fff',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '12px',
          },
        })
        router.push('/dashboard/initiatives')
      }
    } catch (error) {
      console.error('Error deleting initiative:', error)
      toast.error('حدث خطأ أثناء حذف المبادرة', {
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

  const calculateProgress = () => {
    if (!initiative) return 0
    return Math.min((initiative.current_amount / initiative.target_amount) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-green-600'
    if (progress >= 60) return 'from-yellow-500 to-yellow-600'
    if (progress >= 40) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل المبادرة...</p>
        </div>
      </div>
    )
  }

  if (!initiative) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            المبادرة غير موجودة
          </h3>
          <p className="text-gray-500 mb-6">
            يبدو أن المبادرة التي تبحث عنها غير موجودة أو تم حذفها
          </p>
          <Link
            href="/dashboard/initiatives"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للمبادرات
          </Link>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const progressColor = getProgressColor(progress)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">تفاصيل المبادرة</h1>
            <p className="text-gray-600">عرض جميع تفاصيل المبادرة المحددة</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>لوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
          <Link href="/dashboard/initiatives" className="text-purple-600 hover:text-purple-700 transition-colors">
            إدارة المبادرات
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-purple-600 font-medium">تفاصيل المبادرة</span>
        </div>
      </div>

      {/* Initiative Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Initiative Image */}
        {initiative.photo_url && (
          <div className="relative h-96 w-full">
            <Image
              src={initiative.photo_url}
              alt={initiative.title}
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
                <p className="text-sm font-medium">صورة المبادرة</p>
              </div>
            </div>
          </div>
        )}

        {/* Initiative Details */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
            {initiative.title}
          </h2>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                <p className="font-semibold text-gray-800">{formatDate(initiative.created_at)}</p>
              </div>
            </div>

            {initiative.updated_at && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Clock className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">آخر تحديث</p>
                  <p className="font-semibold text-gray-800">{formatDate(initiative.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Financial Progress Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-700">المعلومات المالية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المبلغ المحقق</p>
                    <p className="text-2xl font-bold text-green-600">
                      {initiative.current_amount.toLocaleString()} ريال
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المبلغ المستهدف</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {initiative.target_amount.toLocaleString()} ريال
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-100 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">نسبة الإنجاز</span>
                <span className="text-lg font-bold text-gray-800">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                <div 
                  className={`bg-gradient-to-r ${progressColor} h-4 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {progress >= 100 ? 'تم تحقيق الهدف بالكامل! 🎉' : 'متبقي للوصول للهدف'}
                </span>
                {progress < 100 && (
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {(initiative.target_amount - initiative.current_amount).toLocaleString()} ريال
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-purple-500" />
              <h3 className="text-xl font-semibold text-gray-700">وصف المبادرة</h3>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {initiative.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
            <Link
              href={`/dashboard/initiatives/${initiative.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Edit className="w-5 h-5" />
              تعديل المبادرة
            </Link>

            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200"
            >
              <Trash2 className="w-5 h-5" />
              حذف المبادرة
            </button>

            <Link
              href="/dashboard/initiatives"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للمبادرات
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
                <p className="text-sm text-gray-600">هل أنت متأكد من حذف هذه المبادرة؟</p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Initiative Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{initiative.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{initiative.description}</p>
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
                  'حذف المبادرة'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewInitiative
