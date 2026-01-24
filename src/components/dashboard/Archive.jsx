import React, { useState, useEffect, useRef } from 'react';
import {
    Archive,
    Search,
    Eye,
    Trash2,
    Download,
    Calendar,
    FileText,
    Loader2,
    AlertCircle,
    CheckCircle,
    X,
    Filter,
    RefreshCw,
    ZoomIn,
    Image as ImageIcon,
    FileQuestion
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

async function fetchTransactions(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });

    const response = await fetch(`${API_BASE_URL}/api/transactions?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const data = await response.json();
    return data.transactions || [];
}

async function getArchivedImage(transactionId) {
    console.log(`🔍 Fetching image for: ${transactionId}`);
    const response = await fetch(`${API_BASE_URL}/api/receipts/${transactionId}/archive`);
    if (!response.ok) {
        console.error(`❌ Failed to fetch: ${transactionId}`);
        throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    console.log(`✅ Got blob for ${transactionId}:`, blob.type, blob.size, 'bytes');
    const url = URL.createObjectURL(blob);
    console.log(`🖼️ Created URL for ${transactionId}:`, url);
    return url;
}

async function deleteTransaction(receiptId) {
    const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return await response.json();
}

const ThumbnailCard = ({ transaction, onView, onDelete, onDownload }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const cardRef = useRef(null);
    const observerRef = useRef(null);
    const loadAttemptedRef = useRef(false);

    const transactionId = transaction.fields?.transaction_id?.field_value || 'غير محدد';
    const receiverName = transaction.fields?.receiver_name?.field_value || 'غير محدد';
    const amount = transaction.fields?.amount?.field_value || '0.00';
    const datetime = transaction.fields?.datetime?.field_value || transaction.created_at;
    const hasArchive = !!transaction.archive_path;

    const formatDate = (dateString) => {
        if (!dateString) return 'غير محدد';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatAmount = (amount) => {
        if (!amount) return '0.00';
        const cleaned = amount.replace(/,/g, '');
        return parseFloat(cleaned).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const loadImage = async () => {
        if (loadAttemptedRef.current || !hasArchive) return;
        
        loadAttemptedRef.current = true;
        setLoading(true);
        
        console.log(`📥 Loading thumbnail for: ${transactionId}`);
        
        try {
            const url = await getArchivedImage(transactionId);
            console.log(`✅ Thumbnail loaded successfully: ${transactionId}`);
            setImageUrl(url);
            setFailed(false);
        } catch (err) {
            console.error(`❌ Failed to load thumbnail for ${transactionId}:`, err);
            setFailed(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasArchive || !cardRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !loadAttemptedRef.current) {
                        console.log(`👁️ Card visible: ${transactionId}`);
                        loadImage();
                    }
                });
            },
            { rootMargin: '100px' }
        );

        observerRef.current.observe(cardRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [hasArchive]);

    return (
        <div
            ref={cardRef}
            className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
            onClick={() => onView(transaction, imageUrl)}
        >
            <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                {loading ? (
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-500">جاري التحميل...</p>
                    </div>
                ) : imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={`Receipt ${transactionId}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                console.error(`🖼️ Image render failed for ${transactionId}`);
                                setFailed(true);
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </>
                ) : failed ? (
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-2" />
                        <p className="text-xs text-red-400">فشل التحميل</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                loadAttemptedRef.current = false;
                                setFailed(false);
                                loadImage();
                            }}
                            className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : hasArchive ? (
                    <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">انقر للعرض</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">بدون صورة</p>
                    </div>
                )}

                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {hasArchive && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(transactionId, imageUrl);
                            }}
                            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all"
                            title="تحميل"
                        >
                            <Download className="w-4 h-4 text-gray-700" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(transaction.id, transactionId);
                        }}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-gray-50 to-white">
                <div className="text-right mb-2">
                    <div className="font-bold text-sm text-gray-900 truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>
                        {receiverName}
                    </div>
                    <div className="text-xs text-gray-600 font-mono mt-1">
                        {transactionId}
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(datetime)}</span>
                    </div>
                    <div className="font-bold text-blue-600">
                        {formatAmount(amount)} ج
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArchiveManager = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        min_amount: '',
        max_amount: ''
    });

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchTransactions(filters);
            setTransactions(data);
            console.log(`📋 Loaded ${data.length} transactions`);
        } catch (err) {
            setError('فشل تحميل الأرشيف');
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = async (transaction, cachedImageUrl) => {
        const transactionId = transaction.fields?.transaction_id?.field_value;

        if (!transaction.archive_path) {
            setError('لا توجد صورة مؤرشفة لهذا الإيصال');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (cachedImageUrl) {
            setSelectedReceipt({
                ...transaction,
                imageUrl: cachedImageUrl
            });
            return;
        }

        try {
            const imageUrl = await getArchivedImage(transactionId);
            setSelectedReceipt({
                ...transaction,
                imageUrl
            });
        } catch (err) {
            setError('فشل تحميل الصورة المؤرشفة');
            console.error('Image load error:', err);
        }
    };

    const handleDelete = async (receiptId, transactionId) => {
        if (!confirm(`هل أنت متأكد من حذف الإيصال ${transactionId}؟\nسيتم حذف الصورة المؤرشفة أيضاً.`)) {
            return;
        }

        try {
            await deleteTransaction(receiptId);
            setSuccess('تم حذف الإيصال بنجاح');
            await loadTransactions();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('فشل حذف الإيصال');
            console.error('Delete error:', err);
        }
    };

    const handleDownload = async (transactionId, cachedImageUrl) => {
        try {
            const imageUrl = cachedImageUrl || await getArchivedImage(transactionId);
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `receipt_${transactionId}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError('فشل تحميل الصورة');
            console.error('Download error:', err);
        }
    };

    const handleApplyFilters = () => {
        loadTransactions();
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            min_amount: '',
            max_amount: ''
        });
        setSearchQuery('');
    };

    const filteredTransactions = transactions.filter(t => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        const transactionId = t.fields?.transaction_id?.field_value || '';
        const receiverName = t.fields?.receiver_name?.field_value || '';
        const toAccount = t.fields?.to_account?.field_value || '';
        const comment = t.fields?.comment?.field_value || '';
        return (
            transactionId.toLowerCase().includes(search) ||
            receiverName.toLowerCase().includes(search) ||
            toAccount.toLowerCase().includes(search) ||
            comment.toLowerCase().includes(search)
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'غير محدد';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatAmount = (amount) => {
        if (!amount) return '0.00';
        const cleaned = amount.replace(/,/g, '');
        return parseFloat(cleaned).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-gray-600 font-medium">جاري تحميل الأرشيف...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-50 to-white px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                                <Archive className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">أرشيف الإيصالات</h3>
                                <p className="text-sm text-gray-600">عرض صور الإيصالات المحفوظة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-blue-100 rounded-lg text-sm font-bold text-blue-700">
                                {filteredTransactions.length} إيصال
                            </span>
                            <button onClick={loadTransactions} className="p-2.5 rounded-xl bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all" title="تحديث">
                                <RefreshCw className="w-4 h-4 text-gray-700" />
                            </button>
                            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm border-2 ${showFilters ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'}`}>
                                <Filter className="w-4 h-4" />
                                <span>فلترة</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث برقم المعاملة، اسم المستلم، رقم الحساب، أو التعليق..." dir="rtl" className="w-full pr-12 pl-4 py-3 text-sm rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-right text-black" style={{ fontFamily: 'Cairo, sans-serif' }} />
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">من تاريخ</label>
                                <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">إلى تاريخ</label>
                                <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">الحد الأدنى للمبلغ</label>
                                <input type="number" value={filters.min_amount} onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 text-right">الحد الأقصى للمبلغ</label>
                                <input type="number" value={filters.max_amount} onChange={(e) => setFilters({ ...filters, max_amount: e.target.value })} placeholder="999999.99" className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleApplyFilters} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">تطبيق الفلتر</button>
                            <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all">إعادة تعيين</button>
                        </div>
                    </div>
                )}

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
                    <div className="mx-6 mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-green-900 text-right">{success}</p>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-medium">لا توجد إيصالات مؤرشفة</p>
                            <p className="text-sm text-gray-400 mt-1">الإيصالات المحفوظة ستظهر هنا</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredTransactions.map((transaction) => (
                                <ThumbnailCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    onView={handleViewReceipt}
                                    onDelete={handleDelete}
                                    onDownload={handleDownload}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedReceipt && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReceipt(null)}>
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleDownload(selectedReceipt.fields?.transaction_id?.field_value, selectedReceipt.imageUrl)} className="p-2.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all flex items-center gap-2 text-white font-bold">
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm">تحميل</span>
                                </button>
                                <button onClick={() => { setSelectedReceipt(null); handleDelete(selectedReceipt.id, selectedReceipt.fields?.transaction_id?.field_value); }} className="p-2.5 rounded-lg bg-white/20 hover:bg-red-500 transition-all flex items-center gap-2 text-white font-bold">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-sm">حذف</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-white font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                                        {selectedReceipt.fields?.receiver_name?.field_value || 'غير محدد'}
                                    </div>
                                    <div className="text-blue-100 text-sm font-mono">
                                        {selectedReceipt.fields?.transaction_id?.field_value || 'غير محدد'}
                                    </div>
                                </div>
                                <FileText className="w-6 h-6 text-white" />
                            </div>

                            <button onClick={() => setSelectedReceipt(null)} className="p-2.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-gray-100 p-6">
                            <div className="max-w-3xl mx-auto">
                                <img src={selectedReceipt.imageUrl} alt={`Receipt ${selectedReceipt.fields?.transaction_id?.field_value}`} className="w-full h-auto rounded-lg shadow-2xl" />
                            </div>
                        </div>

                        <div className="bg-white px-6 py-4 border-t border-gray-200 flex-shrink-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-right">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">المبلغ</div>
                                    <div className="font-bold text-blue-600">
                                        {formatAmount(selectedReceipt.fields?.amount?.field_value || '0.00')} جنيه
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">التاريخ</div>
                                    <div className="font-bold text-gray-900">
                                        {formatDate(selectedReceipt.fields?.datetime?.field_value || selectedReceipt.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">إلى حساب</div>
                                    <div className="font-bold text-gray-900 font-mono text-xs">
                                        {selectedReceipt.fields?.to_account?.field_value || 'غير محدد'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">التعليق</div>
                                    <div className="font-bold text-gray-900 text-xs truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>
                                        {selectedReceipt.fields?.comment?.field_value || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ArchiveManager;