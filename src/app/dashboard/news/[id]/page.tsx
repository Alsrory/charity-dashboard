'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, ArrowRight, Edit, ArrowLeft, Upload, X, Save, ImageIcon } from 'lucide-react'

interface News {
  id: string
  title: string
  details: string
  photo: string | null
}

const EditNews = () => {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [formData, setFormData] = useState<News>({
    id: '',
    title: '',
    details: '',
    photo: null,
  })
  const [loading, setLoading] = useState(true)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await api.get(`news/${id}`)
      const data = response.data.data

      setFormData({
        id: data.id,
        title: data.title,
        details: data.details,
        photo: data.photo ?? null,
      })
    } catch (error) {
      console.error('Error fetching news:', error)
      toast.error('حدث خطأ أثناء تحميل الخبر')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('details', formData.details)
    if (newImage) {
      formDataToSend.append('photo', newImage)
    }

    try {
      const response = await api.post(`news/${id}?_method=PUT`, formDataToSend)
      if (response.status === 200) {
        toast.success('تم تحديث الخبر بنجاح! 🎉', {
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
        toast.error('فشل في تحديث الخبر', {
          position: 'top-center'
        })
      }
    } catch (error) {
      console.error('Error updating news:', error)
      toast.error('حدث خطأ أثناء تحديث الخبر', {
        position: 'top-center'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0])
    }
  }

  const removeNewImage = () => {
    setNewImage(null)
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">تعديل الخبر</h1>
            <p className="text-gray-600">قم بتعديل بيانات الخبر المحدد</p>
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
          <span className="text-orange-600 font-medium">تعديل الخبر</span>
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
          </div>

          {/* Current Image Display */}
          {formData.photo && !newImage && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الصورة الحالية
              </label>
              <div className="relative inline-block">
                <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-orange-200">
                  <Image
                    src={formData.photo}
                    alt={formData.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/file.svg"
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  الصورة الحالية
                </p>
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.photo ? 'تغيير صورة الخبر' : 'صورة الخبر'}
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

              {/* New Image Preview */}
              {newImage && (
                <div className="relative inline-block">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-orange-200">
                    <img
                      src={URL.createObjectURL(newImage)}
                      alt="صورة جديدة"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    الصورة الجديدة: {newImage.name}
                  </p>
                </div>
              )}

              {/* Upload Icon */}
              {!newImage && !formData.photo && (
                <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs text-orange-600">اختر صورة</p>
                  </div>
                </div>
              )}
            </div>
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
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
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

export default EditNews
