'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { AxiosError } from 'axios'
import { Target, ArrowRight, TrendingUp, Calendar, Image as ImageIcon, Save, X, DollarSign, FileText, Upload, Edit } from 'lucide-react'

interface Initiative {
  id: string
  title: string
  description: string
  image: File | null
  createdAt: string
  current_amount: number
  target_amount: number
  start_date: string
  end_date: string
}

interface ValidationErrors {
  [key: string]: string[]
}

const EditInitiative = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [formData, setFormData] = useState<Partial<Initiative>>({
    title: '',
    description: '',
    image: null,
    current_amount: 0,
    target_amount: 0,
    start_date: '',
    end_date: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // جلب بيانات المبادرة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`initiatives/${id}`)
        setFormData(res.data.data) // على حسب هيكل API
      } catch {
        toast.error('فشل في جلب بيانات المبادرة')
        router.push('/dashboard/initiatives')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number'
        ? value === '' ? '' : Number(value)
        : value
    }))
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }))
      if (validationErrors['photo']) {
        setValidationErrors(prev => {
          const copy = { ...prev }
          delete copy['photo']
          return copy
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title || '')
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('current_amount', String(formData.current_amount ?? 0))
      formDataToSend.append('target_amount', String(formData.target_amount ?? 0))
      formDataToSend.append('start_date', formData.start_date || '')
      formDataToSend.append('end_date', formData.end_date || '')

      if (formData.image instanceof File) {
        formDataToSend.append('photo', formData.image)
      }

      await api.post(`initiatives/${id}?_method=PUT`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('تم تعديل المبادرة بنجاح! 🎉', {
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
      
      router.push('/dashboard/initiatives')
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        const data = err.response.data as { message?: string; errors?: ValidationErrors }
        if (data.errors) {
          setValidationErrors(data.errors)
          toast.error(data.message || 'خطأ في التحقق من البيانات', {
            position: 'top-center'
          })
        }
      } else {
        toast.error('حدث خطأ أثناء تعديل المبادرة', {
          position: 'top-center'
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">تعديل المبادرة</h1>
            <p className="text-gray-600">تعديل بيانات المبادرة الحالية</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>إدارة المبادرات</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-purple-600 font-medium">تعديل المبادرة</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">المعلومات الأساسية</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  عنوان المبادرة
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  required
                  placeholder="أدخل عنوان المبادرة"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
                {validationErrors.title && (
                  <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {validationErrors.title[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  وصف المبادرة
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="أدخل وصف تفصيلي للمبادرة"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                />
                {validationErrors.description && (
                  <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {validationErrors.description[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">المعلومات المالية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="current_amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  المبلغ الحالي
                </label>
                <input
                  type="number"
                  id="current_amount"
                  name="current_amount"
                  value={formData.current_amount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                {validationErrors.current_amount && (
                  <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {validationErrors.current_amount[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="target_amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 text-green-500" />
                  المبلغ المستهدف
                </label>
                <input
                  type="number"
                  id="target_amount"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                {validationErrors.target_amount && (
                  <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {validationErrors.target_amount[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">التواريخ</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {validationErrors.start_date && (
                  <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {validationErrors.start_date[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {validationErrors.end_date && (
                  <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {validationErrors.end_date[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">صورة المبادرة</h3>
            </div>
            
            <div>
              <label htmlFor="photo" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 text-orange-500" />
                اختر صورة جديدة للمبادرة
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="photo" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">اضغط لاختيار صورة جديدة</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG حتى 5MB</p>
                </label>
              </div>
              {validationErrors.photo && (
                <p className="text-red-600 mt-2 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {validationErrors.photo[0]}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500 disabled:hover:shadow-lg disabled:hover:transform-none"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التعديلات
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditInitiative
