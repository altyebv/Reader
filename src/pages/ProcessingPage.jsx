import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Copy, RefreshCw } from 'lucide-react';
import UploadZone from '../components/processing/UploadZone';
import ReceiptPreview from '../components/processing/ReceiptPreview';
import ExtractionForm from '../components/processing/ExtractionForm';
import ProcessingQueue from '../components/processing/ProcessingQueue';
import NotificationBar from '../components/common/NotificationBar';
import Button from '../components/common/Button';
import { processBatchReceipts, saveReceipt, checkDuplicate } from '../utils/api';

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

    setFiles(prev => [...prev, ...fileObjects]);
    clearNotifications();

    // Process files immediately
    await processFiles(fileObjects);
  };

  // ============================================================================
  // PROCESSING
  // ============================================================================
  const processFiles = async (filesToProcess) => {
    setProcessing(true);
    clearNotifications();

    try {
      const fileArray = filesToProcess.map(f => f.file);
      const response = await processBatchReceipts(fileArray);

      console.log('Backend response:', response);

      // Process results and check for duplicates
      const processedFiles = [];
      
      for (const result of response.results) {
        const matchingFile = filesToProcess.find(f => f.name === result.filename);
        
        if (!matchingFile) {
          console.error('Could not find file for result:', result.filename);
          continue;
        }

        // Check for duplicate
        let isDuplicate = false;
        const transactionId = result.data?.transaction_id?.value;
        
        if (transactionId) {
          try {
            const duplicateCheck = await checkDuplicate(transactionId);
            isDuplicate = duplicateCheck.exists;
          } catch (err) {
            console.error('Duplicate check failed for', transactionId, ':', err);
          }
        }

        processedFiles.push({
          ...matchingFile,
          processed: true,
          extractedData: result.data,
          confidence: result.overall_confidence,
          needsReview: result.needs_review,
          issues: result.issues || [],
          receiptType: result.receipt_type,
          isDuplicate: isDuplicate,
        });
      }

      console.log('Processed files:', processedFiles);

      // Update state with processed files
      setFiles(prev => {
        const updated = [...prev];
        processedFiles.forEach((processedFile) => {
          const idx = updated.findIndex(f => f.name === processedFile.name);
          if (idx !== -1) {
            updated[idx] = processedFile;
          }
        });
        return updated;
      });

      // Show notifications
      const duplicateCount = processedFiles.filter(f => f.isDuplicate).length;
      const needsReviewCount = processedFiles.filter(f => f.needsReview && !f.isDuplicate).length;
      
      if (duplicateCount > 0) {
        addNotification('warning', `تم العثور على ${duplicateCount} إشعار(ات) مكررة. لن يتم حفظها.`);
      }
      
      if (needsReviewCount > 0) {
        addNotification('info', `${needsReviewCount} إشعار(ات) تحتاج إلى مراجعة.`);
      }
      
      if (duplicateCount === 0 && needsReviewCount === 0) {
        addNotification('success', 'تمت معالجة جميع الإشعارات بنجاح!');
      }

    } catch (err) {
      addNotification('error', err.message || 'فشلت معالجة الإشعارات. يرجى المحاولة مرة أخرى.');
      console.error('Processing error:', err);
    } finally {
      setProcessing(false);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => f.imageUrl && URL.revokeObjectURL(f.imageUrl));
    };
  }, []);

  // ============================================================================
  // RENDER: NO FILES
  // ============================================================================
  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center overflow-hidden p-8">
        <div className="w-full max-w-5xl">
          <UploadZone onFilesSelected={handleFilesSelected} hasExistingFiles={false} />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PROCESSING
  // ============================================================================
  if (processing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-20 h-20 mx-auto mb-6 text-teal-600 animate-spin" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">جاري معالجة الإشعارات...</h3>
          <p className="text-gray-600 text-lg mb-2">يتم استخراج البيانات من {files.length} إشعار</p>
          <p className="text-sm text-gray-500">جاري فحص التكرارات...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN PROCESSING VIEW
  // ============================================================================
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex-shrink-0 bg-white rounded-xl shadow-md border border-gray-200 mx-4 mt-4 px-4 py-3 flex items-center justify-between">
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
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>بداية جديدة</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">
            إشعار {currentIndex + 1} من {files.length}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs text-gray-500">{currentFile?.name}</p>
            {currentFile?.isDuplicate && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-bold flex items-center gap-1">
                <Copy className="w-3 h-3" />
                مكرر
              </span>
            )}
            {currentFile?.saved && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-bold">
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

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="flex-shrink-0 mx-4 mt-3">
          <NotificationBar 
            notifications={notifications} 
            onDismiss={dismissNotification} 
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 px-4 pb-4 pt-3">
        <div className="h-full grid grid-cols-12 gap-3">
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