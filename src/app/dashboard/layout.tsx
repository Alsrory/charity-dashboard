'use client'
import { Menu, Star, X, CreditCard, User2Icon, Newspaper, Projector, Home, Shield, Users, Target, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { 
      href: '/dashboard', 
      label: 'الرئيسية', 
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      href: '/dashboard/news', 
      label: 'إدارة الأخبار', 
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    { 
      href: '/dashboard/members', 
      label: 'إدارة الأعضاء', 
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      href: '/dashboard/admins', 
      label: 'إدارة المديرين', 
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    { 
      href: '/dashboard/initiatives', 
      label: 'إدارة المبادرات', 
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      href: '/dashboard/projects', 
      label: 'إدارة المشاريع', 
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      href: '/dashboard/payments', 
      label: 'دفع الاشتراكات', 
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white shadow-lg border-b border-gray-200">
        <div className="flex gap-x-3 items-center p-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            لوحة التحكم
          </h2>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMenuOpen ? 'block' : 'hidden'
        } md:block w-80 md:w-72 bg-white shadow-xl border-r border-gray-200 fixed md:relative z-50 h-full`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  لوحة التحكم
                </h2>
                <p className="text-sm text-gray-600">الجمعية الخيرية</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? `${item.bgColor} ${item.color} ${item.borderColor} border-l-4` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive ? item.bgColor : 'group-hover:bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? item.color : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                </div>
                <span className={`font-medium ${
                  isActive ? item.color : 'group-hover:text-gray-800'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-current rounded-full opacity-60"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-500">الإصدار 1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">© 2024 الجمعية الخيرية</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}

export default DashboardLayout 