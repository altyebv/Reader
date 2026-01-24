import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Copy, RefreshCw } from 'lucide-react';
import UploadZone from '../components/processing/UploadZone';
import ReceiptPreview from '../components/processing/ReceiptPreview';
import ExtractionForm from '../components/processing/ExtractionForm';
import ProcessingQueue from '../components/processing/ProcessingQueue';
import NotificationBar from '../components/common/NotificationBar';
import Button from '../components/common/Button';
import { processBatchReceipts, processSingleReceipt, saveReceipt, checkDuplicate } from '../utils/api';

const ProcessingPage = ({
  // State from App
  files,
  setFiles,
  currentIndex,
  setCurrentIndex,
  zoom,
  setZoom,
  processing,
  setProcessing,
  saving,
  setSaving,
  // Notifications from App
  notifications,
  addNotification,
  dismissNotification,
  clearNotifications
}) => {
  const currentFile = files[currentIndex];

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = async (newFiles) => {
    const fileObjects = newFiles.map(file => ({
      name: file.name,
      file: file,
      imageUrl: URL.createObjectURL(file),
      processed: false,
      extractedData: null,
      error: null,
      isDuplicate: false,
    }));
    const hadExisting = files.length > 0;

    setFiles(prev => [...prev, ...fileObjects]);
    clearNotifications();

    // Notify user that files were added when on the processing page
    if (hadExisting) {
      addNotification('success', `تمت إضافة ${fileObjects.length} إشعار(ات) إلى قائمة الانتظار.`);
    }

    // If user is adding more while already on the processing page, don't show full-page loader.
    // Process in background and notify the user instead.
    await processFiles(fileObjects, { showSpinner: !hadExisting });
  };

  // ============================================================================
  // PROCESSING - Progressive Loading
  // ============================================================================
  const processFiles = async (filesToProcess, { showSpinner = true } = {}) => {
    if (showSpinner) setProcessing(true);
    clearNotifications();

    try {
      let firstNotified = false;

      const promises = filesToProcess.map((f) => {
        return processSingleReceipt(f.file)
          .then(async (result) => {
            const transactionId = result.data?.transaction_id?.value;
            let isDuplicate = false;

            if (transactionId) {
              try {
                const duplicateCheck = await checkDuplicate(transactionId);
                isDuplicate = duplicateCheck.exists;
              } catch (err) {
                console.error('Duplicate check failed for', transactionId, ':', err);
              }
            }

            const processedFile = {
              ...f,
              processed: true,
              extractedData: result.data,
              confidence: result.overall_confidence,
              needsReview: result.needs_review,
              issues: result.issues || [],
              receiptType: result.receipt_type,
              isDuplicate: isDuplicate,
              tempId: result.temp_id,           // ← ADD THIS
              archivePath: result.archive_path, // ← BONUS: Also store archive path
            };

            setFiles(prev => {
              const updated = [...prev];
              const idx = updated.findIndex(item => item.name === processedFile.name);
                if (idx !== -1) {
                  updated[idx] = processedFile;
                  if (!firstNotified) {
                    firstNotified = true;
                    if (showSpinner) setProcessing(false);
                    setCurrentIndex(idx);
                    addNotification('info', 'يتم معالجة الإشعارات المتبقية في الخلفية...');
                  }
                }
              return updated;
            });

            return processedFile;
          })
          .catch(err => {
            console.error('Processing failed for', f.name, err);
            setFiles(prev => {
              const updated = [...prev];
              const idx = updated.findIndex(item => item.name === f.name);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], processed: true, error: err.message || 'Processing failed' };
              }
              return updated;
            });
            return null;
          });
      });

      const settled = await Promise.allSettled(promises);

      // Summarize results
      let duplicateCount = 0;
      let needsReviewCount = 0;

      settled.forEach(res => {
        if (res.status === 'fulfilled' && res.value) {
          if (res.value.isDuplicate) duplicateCount++;
          if (res.value.needsReview && !res.value.isDuplicate) needsReviewCount++;
        }
      });

      if (duplicateCount > 0) {
        addNotification('warning', `تم العثور على ${duplicateCount} إشعار(ات) مكررة. لن يتم حفظها.`);
      }

      if (needsReviewCount > 0) {
        addNotification('info', `${needsReviewCount} إشعار(ات) تحتاج إلى مراجعة.`);
      }

      if (duplicateCount === 0 && needsReviewCount === 0 && settled.length > 1) {
        addNotification('success', `تمت معالجة جميع الـ ${settled.length} إشعارات بنجاح!`);
      }

    } catch (err) {
      addNotification('error', err.message || 'فشلت معالجة الإشعارات. يرجى المحاولة مرة أخرى.');
      console.error('Processing error:', err);
      if (showSpinner) setProcessing(false);
    } finally {
      if (showSpinner) setProcessing(false);
    }
  };

  // ============================================================================
  // FIELD CHANGES
  // ============================================================================
  const handleFieldChange = (field, value) => {
    setFiles(prev => {
      const updated = [...prev];
      if (updated[currentIndex]?.extractedData) {
        updated[currentIndex].extractedData[field] = {
          ...updated[currentIndex].extractedData[field],
          value: value,
          needs_review: false,
        };

        // Re-check for duplicate if transaction_id changed
        if (field === 'transaction_id' && value) {
          checkForDuplicate(value, currentIndex);
        }
      }
      return updated;
    });
  };

  const checkForDuplicate = async (transactionId, fileIndex = currentIndex) => {
    try {
      const result = await checkDuplicate(transactionId);
      setFiles(prev => {
        const updated = [...prev];
        updated[fileIndex].isDuplicate = result.exists;
        return updated;
      });
      
      if (result.exists) {
        addNotification('warning', 'رقم العملية موجود مسبقاً في قاعدة البيانات.');
      }
    } catch (err) {
      console.error('Duplicate check error:', err);
    }
  };

  // ============================================================================
  // SAVE & NAVIGATION
  // ============================================================================
  const handleConfirm = async () => {
  if (!currentFile?.extractedData || currentFile.isDuplicate) return;

  setSaving(true);
  clearNotifications();

  try {
    const receiptData = {
      temp_id: currentFile.tempId,  // ← ADD THIS - CRITICAL!
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

      setFiles(prev => {
        const updated = [...prev];
        updated[currentIndex].saved = true;
        return updated;
      });

      addNotification('success', 'تم حفظ الإشعار بنجاح!');

      // Move to next file or show completion
      if (currentIndex < files.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          clearNotifications();
        }, 800);
      } else {
        const savedCount = files.filter(f => f.saved).length + 1;
        addNotification('success', `تم حفظ ${savedCount} إشعار(ات) بنجاح! 🎉`);
      }
    } catch (err) {
      addNotification('error', err.message || 'فشل حفظ الإشعار. يرجى المحاولة مرة أخرى.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
      clearNotifications();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      clearNotifications();
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
      clearNotifications();
    }
  };

  const handleRemove = (index) => {
    if (index === 'all') {
      files.forEach(f => URL.revokeObjectURL(f.imageUrl));
      setFiles([]);
      setCurrentIndex(0);
      clearNotifications();
    } else {
      URL.revokeObjectURL(files[index].imageUrl);
      setFiles(prev => prev.filter((_, i) => i !== index));
      if (currentIndex >= files.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  const handleStartOver = () => {
    files.forEach(f => f.imageUrl && URL.revokeObjectURL(f.imageUrl));
    setFiles([]);
    setCurrentIndex(0);
    clearNotifications();
  };

  // ============================================================================
  // RENDER: NO FILES
  // ============================================================================
  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center overflow-hidden">
        <UploadZone onFilesSelected={handleFilesSelected} hasExistingFiles={false} />
      </div>
    );
  }

  // ============================================================================
  // RENDER: PROCESSING
  // ============================================================================
  if (processing) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-2xl">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-3">جاري معالجة الإشعارات...</h3>
          <p className="text-slate-600 text-lg mb-2">يتم استخراج البيانات من {files.length} إشعار</p>
          <p className="text-sm text-slate-500">جاري فحص التكرارات والتحقق من الدقة</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN PROCESSING VIEW
  // ============================================================================
  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50">
      {/* Floating Notifications - Don't affect layout */}
      <NotificationBar 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />

      {/* Top Navigation Bar */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 mx-5 mt-5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            icon={ChevronLeft} 
            onClick={handleNext} 
            disabled={currentIndex >= files.length - 1}
          >
            التالي
          </Button>
          <UploadZone onFilesSelected={handleFilesSelected} hasExistingFiles={true} />
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all hover:scale-[1.02] border border-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>بداية جديدة</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">
            إشعار {currentIndex + 1} من {files.length}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs text-slate-500">{currentFile?.name}</p>
            {currentFile?.isDuplicate && (
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs rounded-full font-bold flex items-center gap-1">
                <Copy className="w-3 h-3" />
                مكرر
              </span>
            )}
            {currentFile?.saved && (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-bold">
                ✓ محفوظ
              </span>
            )}
          </div>
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

      {/* Main Content Grid - Full height without notification squeezing */}
      <div className="flex-1 min-h-0 px-5 pb-5 pt-4">
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Queue - 2 columns */}
          <div className="col-span-2 h-full overflow-hidden">
            <ProcessingQueue 
              files={files} 
              currentIndex={currentIndex} 
              onSelectFile={setCurrentIndex} 
              onRemove={handleRemove} 
            />
          </div>

          {/* Preview - 4 columns */}
          <div className="col-span-4 h-full overflow-hidden">
            <ReceiptPreview 
              imageUrl={currentFile?.imageUrl} 
              zoom={zoom} 
              onZoomChange={setZoom} 
            />
          </div>

          {/* Form - 6 columns */}
          <div className="col-span-6 h-full overflow-hidden">
            <ExtractionForm
              data={currentFile?.extractedData || {}}
              overallConfidence={currentFile?.confidence * 100}  // ← Add this
              onFieldChange={handleFieldChange}
              onConfirm={handleConfirm}
              onSkip={handleSkip}
              saving={saving}
              needsReview={currentFile?.needsReview}
              issues={currentFile?.issues || []}
              isDuplicate={currentFile?.isDuplicate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;