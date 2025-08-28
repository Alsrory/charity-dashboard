'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { FileText, ArrowRight, Plus, ArrowLeft, Upload, X } from 'lucide-react'

interface ValidationErrors {
  [key: string]: string[]
}

interface News {
  title: string
  details: string
  image: File | null
}

const AddNews = () => {
  const router = useRouter()
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<Partial<News>>({
    title: '',
    details: '',
    image: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({}) // reset errors
    setIsSubmitting(true)

    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title ?? '')
    formDataToSend.append('details', formData.details ?? '')
    if (formData.image) {
      formDataToSend.append('photo', formData.image) // ← تأكد أن اسم الحقل مطابق في Laravel
    }

    try {
      if (!formData.title || !formData.details) {
        throw new Error('جميع الحقول المطلوبة يجب ملؤها')
      }

      const response = await api.post('news', formDataToSend, {
        headers: {
         
        },
      })

      if (response.status === 200) {
        toast.success('تم إضافة الخبر بنجاح! 🎉', {
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
      } else {
        toast.error('فشل في نشر الخبر', {
          position: 'top-center'
        })
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        const { message, errors } = err.response.data as {
          message?: string;
          errors?: ValidationErrors;
        };
    
        if (errors) {
          setValidationErrors(errors);
          toast.error(message || "خطأ في التحقق من البيانات", {
            position: 'top-center'
          });
        }
      } else {
        toast.error("حدث خطأ أثناء حفظ الخبر", {
          position: 'top-center'
        });
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إضافة خبر جديد</h1>
            <p className="text-gray-600">أضف خبر جديد للنظام</p>
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
          <span className="text-orange-600 font-medium">إضافة خبر جديد</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              عنوان الخبر
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="أدخل عنوان الخبر..."
              required
            />
            {validationErrors.title && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <X className="w-4 h-4" />
                <span>{validationErrors.title[0]}</span>
              </div>
            )}
          </div>

          {/* Details Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              محتوى الخبر
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="أدخل محتوى الخبر..."
              required
            />
            {validationErrors.details && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <X className="w-4 h-4" />
                <span>{validationErrors.details[0]}</span>
              </div>
            )}
          </div>

          {/* Image Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              صورة الخبر
            </label>
            <div className="space-y-3">
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="relative inline-block">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-orange-200">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="صورة الخبر"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {formData.image.name}
                  </p>
                </div>
              )}

              {/* Image Upload Icon */}
              {!formData.image && (
                <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs text-orange-600">اختر صورة</p>
                  </div>
                </div>
              )}
            </div>
            {validationErrors.photo && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <X className="w-4 h-4" />
                <span>{validationErrors.photo[0]}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-amber-500 disabled:hover:shadow-lg disabled:hover:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  نشر الخبر
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              إلغاء
            </button>

            <Link
              href="/dashboard/news"
              className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all duration-300"
            >
              <FileText className="w-5 h-5" />
              العودة للأخبار
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddNews
