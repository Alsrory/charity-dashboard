"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Target, ArrowRight, Plus, Search, Edit, Trash2, Calendar, DollarSign, TrendingUp, FileText, ImageIcon, Users, Clock, AlertTriangle, X, Eye } from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  description: string;
  photo_url: string | null;
  created_at: string;
  current_amount: number;
  target_amount: number;
}

const InitiativesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; initiative: Initiative | null }>({
    show: false,
    initiative: null
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoading(true);

        const response = await api.get("/initiatives");
        const initiatives = response.data;
        console.log("API Response:", initiatives.data);
        setInitiatives(Array.isArray(initiatives.data) ? initiatives.data : []);
      } catch (error) {
        console.error("Error fetching initiatives", error);
        setError("حدث خطأ أثناء جلب المبادرات");
        toast.error("حدث خطأ أثناء جلب المبادرات");
      } finally {
        setLoading(false);
      }
    };
    fetchInitiatives();
  }, []);

  const filteredInitiatives = initiatives.filter((initiative) => {
    if (
      typeof initiative !== "object" ||
      !initiative ||
      typeof initiative.title !== "string" ||
      typeof initiative.description !== "string"
    ) {
      return false;
    }
    return (
      initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      initiative.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const openDeleteModal = (initiative: Initiative) => {
    setDeleteModal({ show: true, initiative });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, initiative: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.initiative) return;

    setDeleting(true);
    try {
      const response = await api.delete(`initiatives/${deleteModal.initiative.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setInitiatives(
          initiatives.filter((initiative) => initiative.id !== deleteModal.initiative!.id)
        );
        toast.success("تم حذف المبادرة بنجاح");
        closeDeleteModal();
      } else {
        console.error("Failed to delete initiative");
        toast.error("فشل في حذف المبادرة");
      }
    } catch (error) {
      console.error("Error deleting initiative", error);
      toast.error("حدث خطأ أثناء حذف المبادرة");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة المبادرات</h1>
            <p className="text-gray-600">إدارة وتنظيم مبادرات الجمعية الخيرية</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>لوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-purple-600 font-medium">إدارة المبادرات</span>
        </div>
      </div>

      {/* Search and Add Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث عن مبادرة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <Link
            href="/dashboard/initiatives/add"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            إضافة مبادرة جديدة
          </Link>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInitiatives.map((initiative) => (
          <div
            key={initiative.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-48">
              <Image
                src={initiative.photo_url || "/file.svg"}
                alt={initiative.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/file.svg";
                }}
              />
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                {initiative.created_at
                  ? new Date(
                      initiative.created_at.replace(/\.\d{3,6}Z$/, "Z")
                    ).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "تاريخ غير متوفر"}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                {initiative.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                {initiative.description}
              </p>
              
              {/* Financial Progress Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <h4 className="text-sm font-semibold text-gray-700">المعلومات المالية</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      المبلغ الحالي
                    </span>
                    <span className="font-semibold text-green-600">
                      {initiative.current_amount.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Target className="w-4 h-4 text-purple-500" />
                      المبلغ المستهدف
                    </span>
                    <span className="font-semibold text-purple-600">
                      {initiative.target_amount.toLocaleString()} ريال
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((initiative.current_amount / initiative.target_amount) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {Math.round((initiative.current_amount / initiative.target_amount) * 100)}% مكتمل
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/initiatives/${initiative.id}/view`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </Link>
                <Link
                  href={`/dashboard/initiatives/${initiative.id}/`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </Link>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300"
                  onClick={() => openDeleteModal(initiative)}
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
      {filteredInitiatives.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              لا توجد مبادرات
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'لم يتم العثور على مبادرات تطابق البحث' : 'ابدأ بإضافة مبادرة جديدة للجمعية'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/initiatives/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                إضافة مبادرة جديدة
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.initiative && (
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
                  <h4 className="font-semibold text-gray-800">{deleteModal.initiative.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{deleteModal.initiative.description}</p>
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
  );
};

export default InitiativesList;
