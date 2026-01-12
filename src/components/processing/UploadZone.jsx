import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import Button from '../common/Button.jsx';

const UploadZone = ({ onFilesSelected }) => {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );
        if (files.length > 0) onFilesSelected(files);
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        onFilesSelected(files);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
                اسحب الإشعارات وأفلتها هنا
            </p>
            <p className="text-sm text-gray-500 mb-4">أو</p>
            <div className="inline-block">
                <Button variant="primary" icon={Upload} onClick={handleButtonClick}>
                    اختر الملفات
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default UploadZone;