import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  X,
  Banknote,
  Smartphone,
  Building,
} from 'lucide-react';
import { useAuth } from '@/backend/lib/auth-context';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionRef?: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

export default function PaymentsManagement() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  useEffect(() => {
    loadPayments();
    loadStudents();
  }, []);
  
  const loadPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };
  
  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };
  
  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.get('userId'),
          amount: parseInt(formData.get('amount') as string) * 100, // Convert to cents
          paymentMethod: formData.get('paymentMethod'),
          transactionRef: formData.get('transactionRef'),
          notes: formData.get('notes'),
        }),
      });
      
      if (response.ok) {
        toast.success('Payment recorded successfully');
        setShowRecordForm(false);
        loadPayments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to record payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };
  
  const generateReceipt = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/receipt`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Receipt downloaded');
      } else {
        toast.error('Failed to generate receipt');
      }
    } catch (error) {
      toast.error('Failed to generate receipt');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-crimson rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }
  
  const filteredPayments = payments.filter(payment =>
    payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (payment.transactionRef && payment.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      default:
        return null;
    }
  };
  
  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'bank':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'cash':
        return <Banknote className="w-4 h-4 text-gray-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const formatAmount = (amount: number) => {
    return `KES ${(amount / 100).toLocaleString()}`;
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Payment Management</h1>
          <p className="text-gray-600 mt-2">Record and track student payments</p>
        </div>
        <button
          onClick={() => setShowRecordForm(true)}
          className="btn-brand"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {payments.filter(p => p.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {payments.filter(p => p.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {formatAmount(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or transaction reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>
      
      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{payment.userName}</p>
                        <p className="text-sm text-gray-500">{payment.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{formatAmount(payment.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="text-sm text-gray-600 capitalize">
                          {payment.paymentMethod || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{payment.transactionRef || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 
                         new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {payment.status === 'paid' && (
                          <button 
                            onClick={() => generateReceipt(payment)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                            title="Download Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No payments found</p>
          </div>
        )}
      </div>
      
      {/* Record Payment Form Modal */}
      {showRecordForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-display">Record Payment</h3>
              <button onClick={() => setShowRecordForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleRecordPayment}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>
                <select name="userId" className="form-input" required>
                  <option value="">Select student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (KES) *
                </label>
                <input 
                  type="number" 
                  name="amount" 
                  className="form-input" 
                  placeholder="14300" 
                  required 
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select name="paymentMethod" className="form-input" required>
                  <option value="">Select method...</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Reference
                </label>
                <input 
                  type="text" 
                  name="transactionRef" 
                  className="form-input" 
                  placeholder="M-Pesa code, bank ref, or receipt number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea 
                  name="notes" 
                  className="form-input" 
                  rows={2}
                  placeholder="Additional notes..."
                ></textarea>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRecordForm(false)}
                  className="btn-outline flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand flex-1 justify-center">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}