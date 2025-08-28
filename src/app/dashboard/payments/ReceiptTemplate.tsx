import { forwardRef } from 'react'
import Image from 'next/image'

interface ReceiptTemplateProps {
  receiptNumber: string
  selectedUser: {
    name: string
    phoneNumber: string
    memberType: 'NON_MEMBER' | 'AFFILIATED'
  }
  amount: string
  date?: string
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ receiptNumber, selectedUser, amount, date }, ref) => {
    return (
      <div ref={ref} className="p-4 md:p-8 bg-white max-w-[800px] mx-auto">
        {/* رأس السند */}
        <div className="text-center mb-6 md:mb-8 border-b-2 border-gray-200 pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 md:w-28 md:h-28">
              <Image
                src="/"
                alt="شعار الجمعية"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary">جمعية التلاحم الخيرية</h1>
          <p className="text-lg md:text-xl mb-1 text-gray-700">تعز-المعافر</p>
          <p className="text-lg md:text-xl mb-4 text-gray-700">الشعوبة-الظهرة</p>
          <div className="border-t-2 border-b-2 border-primary py-2 mt-3">
            <h2 className="text-xl md:text-2xl font-bold text-primary">سند قبض</h2>
          </div>
        </div>

        {/* معلومات السند */}
        <div className="mb-6 md:mb-8">
          <div className="grid grid-cols-2  gap-4 md:gap-8 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">رقم السند:</p>
              <p className="font-bold text-lg md:text-xl text-primary">{receiptNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">التاريخ:</p>
              <p className="font-bold text-lg md:text-xl">{date ?? new Date().toLocaleDateString('en-us')}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div>
                <p className="text-gray-600 mb-2">اسم العضو:</p>
                <p className="font-bold text-lg md:text-xl">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">رقم الهاتف:</p>
                <p className="font-bold text-lg md:text-xl">{selectedUser.phoneNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">المبلغ:</p>
              <p className="font-bold text-lg md:text-xl text-primary">{amount} ريال بمني</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">نوع العضو:</p>
              <p className="font-bold text-lg md:text-xl">
                {selectedUser.memberType === 'AFFILIATED' ? 'منتسب' : 'غير منتسب'}
              </p>
            </div>
          </div>
        </div>

        {/* توقيعات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 md:mt-12">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-4">
              <p className="font-bold text-lg">توقيع المستلم</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-4">
              <p className="font-bold text-lg">توقيع أمين الصندوق</p>
            </div>
          </div>
        </div>

       
      </div>
    )
  }
)

ReceiptTemplate.displayName = 'ReceiptTemplate'

export default ReceiptTemplate 