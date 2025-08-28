'use client';
import api from '@/lib/api'
import { LucideNewspaper, PinIcon, Projector, UserPlus, Users, TrendingUp, Target, FileText } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const fetchCount = async ( endpoint:string ) => {
  try {
    const res = await api.get(endpoint);
    return res.data.data.length || 0;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return 0;
  }
};

const DashboardHome = () => {
  const [membersCount, setMembersCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [initiativesCount, setInitiativesCount] = useState(0);

  useEffect(() => {
    const fetchAllCounts = async () => {
      // تنفيذ كل الطلبات بالتوازي
      const [members, news, projects, initiatives] = await Promise.all([
        fetchCount('/subscribers'),
        fetchCount('/news'),
        fetchCount('/projects'),
        fetchCount('/initiatives'),
      ]);
      setMembersCount(members);
      setNewsCount(news);
      setProjectsCount(projects);
      setInitiativesCount(initiatives);
    };

    fetchAllCounts();
  }, []);

  const stats = [
    { 
      label: 'إجمالي الأعضاء', 
      value: membersCount.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'المشاريع النشطة', 
      value: projectsCount.toString(),
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'المبادرات الجارية', 
      value: initiativesCount.toString(),
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      label: 'الأخبار المنشورة', 
      value: newsCount.toString(),
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const quickActions = [
    { 
      href: '/dashboard/news/add', 
      label: 'إضافة خبر جديد', 
      icon: LucideNewspaper,
      color: 'hover:bg-orange-50 hover:border-orange-200',
      iconColor: 'text-orange-500'
    },
    { 
      href: '/dashboard/members/add', 
      label: 'إضافة عضو جديد', 
      icon: UserPlus,
      color: 'hover:bg-blue-50 hover:border-blue-200',
      iconColor: 'text-blue-500'
    },
    { 
      href: '/dashboard/admins/add', 
      label: 'إضافة مدير جديد', 
      icon: UserPlus,
      color: 'hover:bg-indigo-50 hover:border-indigo-200',
      iconColor: 'text-indigo-500'
    },
    { 
      href: '/dashboard/initiatives/add', 
      label: 'إضافة مبادرة جديدة', 
      icon: PinIcon,
      color: 'hover:bg-purple-50 hover:border-purple-200',
      iconColor: 'text-purple-500'
    },
    { 
      href: '/dashboard/projects/add', 
      label: 'إضافة مشروع جديد', 
      icon: Projector,
      color: 'hover:bg-green-50 hover:border-green-200',
      iconColor: 'text-green-500'
    },
  ]

  return (
    <div className="space-y-8 p-6">
      {/* عنوان الصفحة */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-600">إدارة شاملة لأنشطة الجمعية الخيرية</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bgColor} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">إجراءات سريعة</h2>
          <p className="text-gray-600">أضف محتوى جديد أو قم بإدارة الأنشطة</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${action.color}`}
              >
                <div className={`p-4 rounded-full bg-gray-50 mb-4`}>
                  <Icon className={`w-8 h-8 ${action.iconColor}`} />
                </div>
                <span className="font-medium text-gray-700 text-center">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome 