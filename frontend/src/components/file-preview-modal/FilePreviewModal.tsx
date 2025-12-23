import React, { useState, useEffect } from "react";
import { X, Download, FileText, FileSpreadsheet, Presentation, File as FileIcon, Loader2 } from "lucide-react";
import mammoth from "mammoth";

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        name: string;
        url: string;
        type: string;
        size?: number;
    };
    isDarkMode: boolean;
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper to check if file is an image
const isImageFile = (type: string): boolean => {
    return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(type.toLowerCase());
};

// Helper to check if file is a PDF
const isPdfFile = (type: string): boolean => {
    return type.toLowerCase() === "pdf";
};

// Helper to check if file is a Word document
const isWordFile = (type: string): boolean => {
    return ["doc", "docx"].includes(type.toLowerCase());
};

// Get icon for file type
const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (["doc", "docx"].includes(lowerType)) return FileText;
    if (["xls", "xlsx"].includes(lowerType)) return FileSpreadsheet;
    if (["ppt", "pptx"].includes(lowerType)) return Presentation;
    return FileIcon;
};

// Get file type label
const getFileTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        pdf: "PDF Document",
        doc: "Word Document",
        docx: "Word Document",
        xls: "Excel Spreadsheet",
        xlsx: "Excel Spreadsheet",
        ppt: "PowerPoint",
        pptx: "PowerPoint",
        txt: "Text File",
        png: "PNG Image",
        jpg: "JPEG Image",
        jpeg: "JPEG Image",
        gif: "GIF Image",
    };
    return labels[type.toLowerCase()] || "File";
};

// Get filename without extension
const getFileNameWithoutExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
};

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    isOpen,
    onClose,
    file,
    isDarkMode,
}) => {
    const [docxHtml, setDocxHtml] = useState<string | null>(null);
    const [isLoadingDocx, setIsLoadingDocx] = useState(false);
    const [docxError, setDocxError] = useState<string | null>(null);

    const isImage = isImageFile(file.type);
    const isPdf = isPdfFile(file.type);
    const isWord = isWordFile(file.type);
    const Icon = getFileIcon(file.type);

    // Load DOCX content when modal opens
    useEffect(() => {
        if (isOpen && isWord && file.url) {
            setIsLoadingDocx(true);
            setDocxError(null);
            setDocxHtml(null);

            // Fetch the DOCX file and convert to HTML using mammoth
            fetch(file.url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
                .then(result => {
                    setDocxHtml(result.value);
                    setIsLoadingDocx(false);
                })
                .catch(err => {
                    console.error("Error loading DOCX:", err);
                    setDocxError("לא ניתן לטעון את המסמך");
                    setIsLoadingDocx(false);
                });
        }

        return () => {
            // Cleanup on close
            if (!isOpen) {
                setDocxHtml(null);
                setDocxError(null);
            }
        };
    }, [isOpen, isWord, file.url]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
                    relative z-10 flex flex-col rounded-2xl overflow-hidden shadow-2xl w-full
                    ${(isImage || isPdf || isWord) ? "max-w-5xl max-h-[85vh]" : "max-w-lg"}
                    ${isDarkMode
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white border border-slate-200"
                    }
                `}
            >
                {/* Header */}
                <div className={`
                    flex items-center justify-between px-4 py-3 border-b
                    ${isDarkMode ? "border-slate-700" : "border-slate-200"}
                `}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                        <span className={`font-medium truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                            {getFileNameWithoutExtension(file.name)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                            .{file.type.toUpperCase()}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${isDarkMode
                                ? "hover:bg-slate-700 text-slate-400 hover:text-white"
                                : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            }
                        `}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    {isImage ? (
                        /* Image Preview */
                        <div className="flex items-center justify-center p-6 bg-black/20">
                            <img
                                src={file.url}
                                alt={file.name}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                            />
                        </div>
                    ) : isPdf ? (
                        /* PDF Preview */
                        <div className="w-full h-[70vh]">
                            <iframe
                                src={file.url}
                                title={file.name}
                                className="w-full h-full"
                            />
                        </div>
                    ) : isWord ? (
                        /* DOCX Preview using mammoth */
                        <div className="w-full min-h-[400px]">
                            {isLoadingDocx ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                        טוען מסמך...
                                    </p>
                                </div>
                            ) : docxError ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <Icon className={`w-12 h-12 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
                                    <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-500"}`}>
                                        {docxError}
                                    </p>
                                </div>
                            ) : docxHtml ? (
                                <div
                                    className={`
                                        p-6 prose max-w-none
                                        ${isDarkMode
                                            ? "prose-invert bg-slate-900/50"
                                            : "bg-white"
                                        }
                                    `}
                                    style={{ direction: 'rtl' }}
                                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                                />
                            ) : null}
                        </div>
                    ) : (
                        /* Document Info (for non-previewable files) */
                        <div className="flex flex-col items-center justify-center p-8 gap-4">
                            <div className={`
                                w-20 h-20 rounded-2xl flex items-center justify-center
                                ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
                            `}>
                                <Icon className={`w-10 h-10 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                            </div>
                            <div className="text-center">
                                <p className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                                    {getFileNameWithoutExtension(file.name)}
                                </p>
                                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    {getFileTypeLabel(file.type)}
                                    {file.size && ` • ${formatFileSize(file.size)}`}
                                </p>
                            </div>
                            <p className={`text-sm text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                תצוגה מקדימה אינה זמינה לסוג קובץ זה
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer with Download */}
                <div className={`
                    flex items-center justify-between px-4 py-3 border-t
                    ${isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}
                `}>
                    {file.size && (
                        <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                            {formatFileSize(file.size)}
                        </span>
                    )}
                    <a
                        href={file.url}
                        download={file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-md"
                    >
                        <Download className="w-4 h-4" />
                        הורד קובץ
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
