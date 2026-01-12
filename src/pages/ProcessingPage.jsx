import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import UploadZone from '../components/processing/UploadZone';
import ReceiptPreview from '../components/processing/ReceiptPreview';
import ExtractionForm from '../components/processing/ExtractionForm';
import ProcessingQueue from '../components/processing/ProcessingQueue';
import Button from '../components/common/Button';
import { processBatchReceipts, saveReceipt, checkDuplicate } from '../utils/api';

const ProcessingPage = () => {
    const [files, setFiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [processing, setProcessing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(false);

    // Get current file and its data
    const currentFile = files[currentIndex];

    // Handle file selection from upload zone
    const handleFilesSelected = async (newFiles) => {
        const fileObjects = newFiles.map(file => ({
            name: file.name,
            file: file,
            imageUrl: URL.createObjectURL(file),
            processed: false,
            extractedData: null,
            error: null,
        }));

        setFiles(prev => [...prev, ...fileObjects]);
        setError(null);

        // Auto-process if this is the first batch
        if (files.length === 0) {
            await processFiles(fileObjects);
        }
    };

    // Process files through OCR
    const processFiles = async (filesToProcess) => {
        setProcessing(true);
        setError(null);

        try {
            const fileArray = filesToProcess.map(f => f.file);
            const response = await processBatchReceipts(fileArray);

            // Update files with extraction results
            setFiles(prev => {
                const updated = [...prev];
                response.results.forEach((result, index) => {
                    const fileIndex = prev.findIndex(f => f.name === result.filename);
                    if (fileIndex !== -1) {
                        updated[fileIndex] = {
                            ...updated[fileIndex],
                            processed: true,
                            extractedData: result.data,
                            confidence: result.overall_confidence,
                            needsReview: result.needs_review,
                            issues: result.issues || [],
                            receiptType: result.receipt_type,
                        };
                    }
                });
                return updated;
            });
        } catch (err) {
            setError(err.message || 'فشلت معالجة الإشعارات. يرجى المحاولة مرة أخرى.');
            console.error('Processing error:', err);
        } finally {
            setProcessing(false);
        }
    };

    // Handle field changes in the form
    const handleFieldChange = (field, value) => {
        setFiles(prev => {
            const updated = [...prev];
            if (updated[currentIndex]?.extractedData) {
                updated[currentIndex].extractedData[field] = {
                    ...updated[currentIndex].extractedData[field],
                    value: value,
                    needs_review: false, // Mark as reviewed when manually edited
                };
            }
            return updated;
        });

        // Check for duplicates when transaction ID changes
        if (field === 'transaction_id' && value) {
            checkForDuplicate(value);
        }
    };

    // Check if transaction ID already exists
    const checkForDuplicate = async (transactionId) => {
        try {
            const result = await checkDuplicate(transactionId);
            setDuplicateWarning(result.exists);
        } catch (err) {
            console.error('Duplicate check error:', err);
        }
    };

    // Confirm and save current receipt
    const handleConfirm = async () => {
        if (!currentFile?.extractedData) return;

        setSaving(true);
        setError(null);

        try {
            // Prepare data for saving
            const receiptData = {
                filename: currentFile.name,
                transaction_id: currentFile.extractedData.transaction_id?.value || '',
                datetime: currentFile.extractedData.datetime?.value || '',
                from_account: currentFile.extractedData.from_account?.value || '',
                to_account: currentFile.extractedData.to_account?.value || '',
                receiver_name: currentFile.extractedData.receiver_name?.value || '',
                comment: currentFile.extractedData.comment?.value || '',
                amount: currentFile.extractedData.amount?.value || '',
                receipt_type: currentFile.receiptType || '',
                confidence: currentFile.confidence || 0,
            };

            await saveReceipt(receiptData);

            // Mark as saved
            setFiles(prev => {
                const updated = [...prev];
                updated[currentIndex].saved = true;
                return updated;
            });

            // Move to next receipt
            if (currentIndex < files.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setDuplicateWarning(false);
            } else {
                // All done - could show success message or reset
                alert('تم حفظ جميع الإشعارات بنجاح!');
            }
        } catch (err) {
            setError(err.message || 'فشل حفظ الإشعار. يرجى المحاولة مرة أخرى.');
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    // Skip current receipt
    const handleSkip = () => {
        if (currentIndex < files.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setDuplicateWarning(false);
        }
    };

    // Navigate between receipts
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setDuplicateWarning(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < files.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setDuplicateWarning(false);
        }
    };

    // Remove file from queue
    const handleRemove = (index) => {
        if (index === 'all') {
            // Cleanup URLs
            files.forEach(f => URL.revokeObjectURL(f.imageUrl));
            setFiles([]);
            setCurrentIndex(0);
        } else {
            URL.revokeObjectURL(files[index].imageUrl);
            setFiles(prev => prev.filter((_, i) => i !== index));
            if (currentIndex >= files.length - 1) {
                setCurrentIndex(Math.max(0, currentIndex - 1));
            }
        }
        setDuplicateWarning(false);
    };

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            files.forEach(f => f.imageUrl && URL.revokeObjectURL(f.imageUrl));
        };
    }, []);

    // Check for duplicate when switching receipts
    useEffect(() => {
        if (currentFile?.extractedData?.transaction_id?.value) {
            checkForDuplicate(currentFile.extractedData.transaction_id.value);
        } else {
            setDuplicateWarning(false);
        }
    }, [currentIndex]);

    // Empty state - show upload zone
    if (files.length === 0) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">معالجة الإشعارات</h2>
                <UploadZone onFilesSelected={handleFilesSelected} />

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-right">{error}</p>
                    </div>
                )}
            </div>
        );
    }

    // Processing state
    if (processing) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 text-teal-600 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">جاري معالجة الإشعارات...</h3>
                    <p className="text-gray-600">يتم استخراج البيانات من {files.length} إشعار</p>
                </div>
            </div>
        );
    }

    // Main processing view
    return (
        <div className="h-screen flex flex-col p-6 gap-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <Button
                    variant="outline"
                    icon={ChevronLeft}
                    onClick={handleNext}
                    disabled={currentIndex >= files.length - 1}
                >
                    التالي
                </Button>

                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                        إشعار {currentIndex + 1} من {files.length}
                    </p>
                    <p className="text-sm text-gray-500">{currentFile?.name}</p>
                    {currentFile?.saved && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            ✓ تم الحفظ
                        </span>
                    )}
                </div>

                <Button
                    variant="outline"
                    icon={ChevronRight}
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    السابق
                </Button>
            </div>

            {/* Error/Warning Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-right flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                        ✕
                    </button>
                </div>
            )}

            {duplicateWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-right flex-1">
                        ⚠️ تحذير: رقم العملية هذا موجود مسبقاً في قاعدة البيانات
                    </p>
                </div>
            )}

            {/* Main Content - Split View */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                {/* Queue Sidebar */}
                <div className="col-span-2">
                    <ProcessingQueue
                        files={files}
                        currentIndex={currentIndex}
                        onSelectFile={setCurrentIndex}
                        onRemove={handleRemove}
                    />
                </div>

                {/* Image Preview */}
                <div className="col-span-4">
                    <ReceiptPreview
                        imageUrl={currentFile?.imageUrl}
                        zoom={zoom}
                        onZoomIn={() => setZoom(z => Math.min(200, z + 25))}
                        onZoomOut={() => setZoom(z => Math.max(50, z - 25))}
                    />
                </div>

                {/* Extraction Form */}
                <div className="col-span-6">
                    <ExtractionForm
                        data={currentFile?.extractedData || {}}
                        onFieldChange={handleFieldChange}
                        onConfirm={handleConfirm}
                        onSkip={handleSkip}
                        saving={saving}
                        needsReview={currentFile?.needsReview}
                        issues={currentFile?.issues || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProcessingPage;