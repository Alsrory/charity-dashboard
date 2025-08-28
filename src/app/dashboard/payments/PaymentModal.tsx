import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import ReceiptTemplate from './ReceiptTemplate'
import api from '@/lib/api'
import { CreditCard, X, Loader2, Printer } from 'lucide-react'

export interface PaymentData {
  id: string
  name: string
  phoneNumber: string
  memberType: 'NON_MEMBER' | 'AFFILIATED'
  affiliation: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  paidAt: string | null
  amount: number
  method: string | null
}

interface PaymentModalProps {
  show: boolean
  onClose: () => void
  selectedUser: PaymentData | null
  month: number
  year: number
  onSuccess: () => void
}

export default function PaymentModal({
  show,
  onClose,
  selectedUser,
  month,
  year,
  onSuccess
}: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState({ amount: '', description: '' })
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    const now = new Date()
    const tzOffsetMs = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10)
  })
  const [receiptNumber, setReceiptNumber] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (show) {
      const generateReceiptNumber = async () => {
        try {
          const response = await api.get('/subscriptions')
          const subscriptions: Array<{ id: number }> = response.data.data ?? []

          // أخذ أعلى id وزيادته +1
          const lastId = subscriptions.length
            ? Math.max(...subscriptions.map(s => s.id))
            : 0
          setReceiptNumber(String(lastId).padStart(6, '0'))
          console.log(subscriptions.length);
        } catch (error) {
          console.error('Error generating receipt number:', error)
          setReceiptNumber('000001')
        }
      }
      generateReceiptNumber()
    }
  }, [show])

  const handlePrint = async () => {
    if (!receiptRef.current) return

    const element = receiptRef.current
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf()
        .from(element)
        .set({
          margin: 10,
          filename: `سند_دفع_${receiptNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save()

      setShowReceipt(false)
      onClose()
      setPaymentAmount({ amount: '', description: '' })
      onSuccess()
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('حدث خطأ أثناء إنشاء ملف PDF')
    }
  }

  const handleAddPayment = async () => {
    if (!selectedUser) return

    if (!paymentAmount.amount || Number(paymentAmount.amount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    try {
      setIsLoading(true)
      await api.post('/subscriptions', {
        subscriber_id: selectedUser.id,
        amount: Number(paymentAmount.amount),
        month,
        payment_method: 'CASH',
        status: 'paid',
        paid_at: paymentDate
      })

      toast.success('تم تسجيل الدفع بنجاح')
      setShowReceipt(true)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء تسجيل الدفع')
    } finally {
      setIsLoading(false)
    }
  }

  if (!show || !selectedUser) return null

  if (showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-3xl mx-4 p-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">سند الدفع</h3>
            </div>
            <button
              onClick={() => {
                setShowReceipt(false)
                onClose()
                setPaymentAmount({ amount: '', description: '' })
              }}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              aria-label="إغلاق"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mt-4">
            <ReceiptTemplate
              ref={receiptRef}
              receiptNumber={receiptNumber}
              selectedUser={selectedUser}
              amount={paymentAmount.amount}
              date={paymentDate}
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => {
                setShowReceipt(false)
                onClose()
                setPaymentAmount({ amount: '', description: '' })
              }}
              className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              إغلاق
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 disabled:opacity-50"
              disabled={isLoading}
            >
              <Printer className="w-4 h-4" />
              طباعة السند
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentAmount(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl mx-4">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-5 rounded-t-2xl border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">تأكيد الدفع</h2>
              <p className="text-xs text-gray-600">{`لـ ${selectedUser.name}`} • {`شهر ${month}`} • {year}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-100/60 disabled:opacity-50"
            aria-label="إغلاق"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          {/* معلومات العضو */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">الاسم</p>
                <p className="text-sm font-semibold text-gray-800">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                <p className="text-sm font-semibold text-gray-800">{selectedUser.phoneNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">نوع العضو</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.memberType === 'AFFILIATED'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {selectedUser.memberType === 'AFFILIATED' ? 'منتسب' : 'غير منتسب'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">رقم السند</p>
                <p className="text-sm font-semibold text-gray-800">{receiptNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">تاريخ الدفع</p>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* إدخال المبلغ والوصف */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={paymentAmount.amount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 pr-4 pl-12 py-2 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="أدخل المبلغ"
                  min="0"
                  step="0.01"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ر.س</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <input
                type="text"
                name="description"
                value={paymentAmount.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="أدخل الوصف (اختياري)"
              />
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => {
                onClose()
                setPaymentAmount({ amount: '', description: '' })
              }}
              className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              onClick={handleAddPayment}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'تأكيد الدفع'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
