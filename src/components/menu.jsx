import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Download, X, Edit2, Save } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function ReceiptOCRApp() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedData, setEditedData] = useState({});

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );

        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    }, []);

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processReceipts = async () => {
        if (files.length === 0) return;

        setProcessing(true);
        setResults([]);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch(`${API_URL}/api/extract/batch`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Processing failed');
            }

            const data = await response.json();
            setResults(data.results);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        const result = results[index];
        setEditedData({
            transaction_id: result.data.transaction_id?.value || '',
            datetime: result.data.datetime?.value || '',
            from_account: result.data.from_account?.value || '',
            to_account: result.data.to_account?.value || '',
            receiver_name: result.data.receiver_name?.value || '',
            comment: result.data.comment?.value || '',
            amount: result.data.amount?.value || '',
        });
    };

    const saveEdits = () => {
        const updatedResults = [...results];
        const result = updatedResults[editingIndex];

        // Update values
        Object.keys(editedData).forEach(key => {
            if (result.data[key]) {
                result.data[key].value = editedData[key];
                result.data[key].needs_review = false;
            }
        });

        setResults(updatedResults);
        setEditingIndex(null);
        setEditedData({});
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditedData({});
    };

    const exportToJSON = () => {
        const exportData = results.map(r => ({
            filename: r.filename,
            transaction_id: r.data.transaction_id?.value || '',
            datetime: r.data.datetime?.value || '',
            from_account: r.data.from_account?.value || '',
            to_account: r.data.to_account?.value || '',
            receiver_name: r.data.receiver_name?.value || '',
            comment: r.data.comment?.value || '',
            amount: r.data.amount?.value || '',
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipts_${new Date().toISOString()}.json`;
        a.click();
    };

    const fieldLabels = {
        transaction_id: 'Transaction ID',
        datetime: 'Date & Time',
        from_account: 'From Account',
        to_account: 'To Account',
        receiver_name: 'Receiver Name',
        comment: 'Comment',
        amount: 'Amount',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">نظام مُعالجة الإشعارات </h1>
                    <p className="text-sm sm:text-base text-gray-600">قم برفع الإشعارات للمعالجة </p>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                            قم بسحب الصور وإفلاتها هنا للمعالجة
                        </p>
                        <p className="text-sm text-gray-500 mb-4">or</p>
                        <label className="inline-block px-5 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                            تصفح الملفات
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">الإشعارات المحددة ({files.length})</h3>
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    حذف الجميع
                                </button>
                            </div>
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-700 truncate flex-1 w-full">{file.name}</span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="ml-2 text-gray-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={processReceipts}
                                disabled={processing}
                                className="w-full mt-4 px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        جاري المعالجة...
                                    </>
                                ) : (
                                    'Process Receipts'
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">النتائج</h2>
                            <button
                                onClick={exportToJSON}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export JSON
                            </button>
                        </div>

                        <div className="space-y-6">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-6 ${result.needs_review ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                                        <div className="flex items-center">
                                            {result.needs_review ? (
                                                <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
                                            ) : (
                                                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{result.filename}</h3>
                                                <p className="text-sm text-gray-600">
                                                    نسبة التأكد: {(result.overall_confidence * 100).toFixed(1)}% • {result.receipt_type}
                                                </p>
                                            </div>
                                        </div>
                                        {editingIndex !== index ? (
                                            <button
                                                onClick={() => startEditing(index)}
                                                className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 mr-1" />
                                                تعديل
                                            </button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={saveEdits}
                                                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <Save className="w-4 h-4 mr-1" />
                                                    حفظ
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                        {Object.keys(fieldLabels).map(fieldKey => {
                                            const field = result.data[fieldKey];
                                            const isEditing = editingIndex === index;

                                            return (
                                                <div key={fieldKey} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {fieldLabels[fieldKey]}
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editedData[fieldKey] || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, [fieldKey]: e.target.value })}
                                                            className="mt-1 w-full px-3 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    ) : (
                                                        <div className="mt-1">
                                                            <p className="text-gray-900 font-medium">
                                                                {field?.value || <span className="text-gray-400">غير مستخرج</span>}
                                                            </p>
                                                            {field && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Confidence: {(field.confidence * 100).toFixed(1)}%
                                                                    {field.needs_review && (
                                                                        <span className="ml-2 text-yellow-600">• يحتاج للمراجعة</span>
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Issues */}
                                    {result.issues.length > 0 && (
                                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                                            <h4 className="font-semibold text-yellow-900 mb-2">ملاحظات:</h4>
                                            <ul className="space-y-1">
                                                {result.issues.map((issue, i) => (
                                                    <li key={i} className="text-sm text-yellow-800">
                                                        • <span className="font-medium">{issue.field}:</span> {issue.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}