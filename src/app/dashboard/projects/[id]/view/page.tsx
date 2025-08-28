'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'
import { TrendingUp, ArrowRight, Calendar, Edit, Trash2, ArrowLeft, Clock, Eye, FileText, AlertTriangle, X, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Project {
  id: string
  title: string
  description: string
  status: string
  photo_url: string | null
  created_at: string
  update_at: string
}

const ViewProject = () => {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/projects/${id}`)
      const data = response.data.data
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('حدث خطأ أثناء تحميل المشروع')
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
    if (!project) return

    setDeleting(true)
    try {
      const response = await api.delete(`/projects/${project.id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.status === 200) {
        toast.success('تم حذف المشروع بنجاح! 🎉', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '12px',
          },
        })
        router.push('/dashboard/projects')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('حدث خطأ أثناء حذف المشروع', {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'مكتمل':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'قيد التنفيذ':
        return <PlayCircle className="w-5 h-5 text-blue-600" />
      case 'متوقف':
        return <PauseCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'قيد التنفيذ':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'متوقف':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل المشروع...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            المشروع غير موجود
          </h3>
          <p className="text-gray-500 mb-6">
            يبدو أن المشروع الذي تبحث عنه غير موجود أو تم حذفه
          </p>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للمشاريع
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">تفاصيل المشروع</h1>
            <p className="text-gray-600">عرض جميع تفاصيل المشروع المحدد</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>لوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
          <Link href="/dashboard/projects" className="text-green-600 hover:text-green-700 transition-colors">
            إدارة المشاريع
          </Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-green-600 font-medium">تفاصيل المشروع</span>
        </div>
      </div>

      {/* Project Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Project Image */}
        {project.photo_url && (
          <div className="relative h-96 w-full">
            <Image
              src={project.photo_url}
              alt={project.title}
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
                <p className="text-sm font-medium">صورة المشروع</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="p-8">
          {/* Title and Status */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-6">
            <h2 className="text-4xl font-bold text-gray-800 leading-tight flex-1">
              {project.title}
            </h2>
            <div className={`px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap ${getStatusColor(project.status)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(project.status)}
                {project.status}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                <p className="font-semibold text-gray-800">{formatDate(project.created_at)}</p>
              </div>
            </div>

            {project.update_at && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">آخر تحديث</p>
                  <p className="font-semibold text-gray-800">{formatDate(project.update_at)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">حالة المشروع</p>
                <p className={`font-semibold ${project.status === 'مكتمل' ? 'text-green-600' : project.status === 'قيد التنفيذ' ? 'text-blue-600' : 'text-red-600'}`}>
                  {project.status}
                </p>
              </div>
            </div>
          </div>

          {/* Project Status Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-700">معلومات المشروع</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الحالة الحالية</p>
                    <p className="text-lg font-bold text-green-600">{project.status}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                    <p className="text-lg font-bold text-blue-600">
                      {new Date(project.created_at).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">آخر تحديث</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {project.update_at ? new Date(project.update_at).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "غير متوفر"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-700">وصف المشروع</h3>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Edit className="w-5 h-5" />
              تعديل المشروع
            </Link>

            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200"
            >
              <Trash2 className="w-5 h-5" />
              حذف المشروع
            </button>

            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للمشاريع
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
                <p className="text-sm text-gray-600">هل أنت متأكد من حذف هذا المشروع؟</p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{project.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
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
                  'حذف المشروع'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewProject



