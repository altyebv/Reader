import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// API functions
async function fetchKnownAccounts() {
  const response = await fetch(`${API_BASE_URL}/api/accounts/known`);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return await response.json();
}

async function addKnownAccount(accountNumber, ownerName) {
  const response = await fetch(`${API_BASE_URL}/api/accounts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account_number: accountNumber,
      owner_name: ownerName
    })
  });
  if (!response.ok) throw new Error('Failed to add account');
  return await response.json();
}

async function deleteKnownAccount(accountNumber) {
  const response = await fetch(`${API_BASE_URL}/api/accounts/${accountNumber}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete account');
  return await response.json();
}

const KnownAccountsManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ number: '', name: '' });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchKnownAccounts();
      setAccounts(data);
    } catch (err) {
      setError('فشل تحميل الحسابات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.number.trim() || !newAccount.name.trim()) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await addKnownAccount(newAccount.number, newAccount.name);
      
      setSuccess('تم إضافة الحساب بنجاح');
      setNewAccount({ number: '', name: '' });
      setShowAddForm(false);
      
      await loadAccounts();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('فشل إضافة الحساب');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (accountNumber) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;

    try {
      setError(null);
      await deleteKnownAccount(accountNumber);
      setSuccess('تم حذف الحساب بنجاح');
      await loadAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('فشل حذف الحساب');
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAccount();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          <span className="text-gray-600 font-medium">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-50 to-white px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">الحسابات المعروفة</h3>
              <p className="text-sm text-gray-600">إدارة الحسابات للإكمال التلقائي</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">
              {accounts.length} حساب
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`
                px-4 py-2.5 rounded-xl font-bold text-sm transition-all
                flex items-center gap-2 shadow-sm border-2
                ${showAddForm
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300'
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-teal-600'
                }
              `}
            >
              {showAddForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span className='text-red-400'>إلغاء</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>إضافة حساب</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900 text-right">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-900 text-right">{success}</p>
          </div>
        </div>
      )}

      {/* Add Account Form */}
      {showAddForm && (
        <div className="mx-6 mt-4 mb-4 p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                رقم الحساب
              </label>
              <input
                type="text"
                value={newAccount.number}
                onChange={(e) => setNewAccount({ ...newAccount, number: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="أدخل رقم الحساب"
                dir="ltr"
                className="
                  w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-300
                  focus:border-teal-500 focus:ring-4 focus:ring-teal-100
                  transition-all text-left font-mono
                "
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                اسم صاحب الحساب
              </label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="أدخل اسم صاحب الحساب"
                dir="rtl"
                className="
                  w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-300
                  focus:border-teal-500 focus:ring-4 focus:ring-teal-100
                  transition-all text-right
                "
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
            </div>

            <button
              onClick={handleAddAccount}
              disabled={saving}
              className="
                w-full px-4 py-3 rounded-xl font-bold text-sm transition-all
                bg-gradient-to-r from-teal-500 to-teal-600
                hover:from-teal-600 hover:to-teal-700
                text-white shadow-lg hover:shadow-xl
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ الحساب</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="p-6">
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">لا توجد حسابات محفوظة</p>
            <p className="text-sm text-gray-400 mt-1">ابدأ بإضافة حساب جديد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.value}
                className="
                  flex items-center justify-between p-4 rounded-xl
                  bg-gradient-to-r from-gray-50 to-white
                  border-2 border-gray-200 hover:border-teal-300
                  transition-all group
                "
              >
                <div className="flex items-center gap-3">
                  {account.verified && (
                    <div className="px-2.5 py-1 bg-teal-500 text-white text-xs rounded-lg font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>موثق</span>
                    </div>
                  )}
                  <div className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg font-bold">
                    {account.frequency} مرة
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.account_number || account.value)}
                    className="
                      p-2 rounded-lg text-red-600 hover:bg-red-50
                      transition-all opacity-0 group-hover:opacity-100
                    "
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    {account.owner_name || account.display_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-600 font-mono mt-0.5">
                    {account.account_number || account.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnownAccountsManager;