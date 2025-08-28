// app/complete-profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pramse  = useParams();
  const userID=pramse.id

  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.phoneNumber) {
        router.push('/dashboard');
      } else {
        setFormData(prev => ({
          ...prev,
          name: formData.name || '',
        }));
      }
    }
    console.log(formData.name)
  }, [session, status, router]);
useEffect(()=>{
  const userData=async()=>{
    const response=await api.post(`/users/${userID}`,
      {
        method:"GET",
        headers:{
          "Content-Type":"application/json"
        }
      }
    )
    const data=await response.json()
    const {name,phone}=data
    setFormData({name,phone})
    console.log(name,phone)
  }
  userData()  
  },[])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء حفظ البيانات');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing profile:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">إكمال الملف الشخصي</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم (اختياري)
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="أدخل اسمك الكامل"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            pattern="[0-9]{9}"
            title="يجب أن يكون رقم الهاتف 9 أرقام"
            placeholder="أدخل رقم هاتفك"
          />
          <p className="mt-1 text-sm text-gray-500">
            سيتم استخدام هذا الرقم للتواصل معك
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
        </button>
      </form>
    </div>
  );
}
