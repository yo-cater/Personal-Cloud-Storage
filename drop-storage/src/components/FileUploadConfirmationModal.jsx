const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export default function FileUploadConfirmationModal({ isOpen, file, onConfirm, onCancel }) {
  if (!isOpen || !file) return null;

  const fileSizeBytes = file.size;
  const isFileTooLarge = fileSizeBytes > MAX_FILE_SIZE_BYTES;
  
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      docx: '📝',
      xlsx: '📊',
      txt: '📋',
      zip: '📦',
    };
    return icons[ext] || '📎';
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-content">
        
        <div className="upload-modal-icon">{getFileIcon(file.name)}</div>

        <h2 className="upload-modal-title">Confirm Upload</h2>
        
        <div className="upload-modal-info">
          <div className="upload-modal-field">
            <p className="upload-modal-label">File Name</p>
            <p className="upload-modal-value">{file.name}</p>
          </div>

          <div className="upload-modal-field">
            <p className="upload-modal-label">File Size</p>
            <p className="upload-modal-value">{formatBytes(fileSizeBytes)}</p>
          </div>

          <div className="upload-modal-field">
            <p className="upload-modal-label">Max Upload Size</p>
            <p className="upload-modal-value">100 MB</p>
          </div>
        </div>

        {isFileTooLarge && (
          <div className="upload-modal-error">
            <p>⚠️ File exceeds the maximum upload limit of 100 MB</p>
          </div>
        )}

        <div className="upload-modal-buttons">
          <button
            onClick={onCancel}
            className="upload-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isFileTooLarge}
            className={`upload-modal-btn-confirm ${isFileTooLarge ? 'disabled' : ''}`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
