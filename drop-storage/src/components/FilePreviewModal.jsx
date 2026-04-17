import { categorizeFile } from '../helperFiles/fileHelpers';

export default function FilePreviewModal({ file, onClose, onDownload, onDelete }) {
  const category = categorizeFile(file);

  const formatBytes = (bytes) => {
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (Number.isNaN(size)) return '0 B';
    if (size < 1024) return `${size} B`;
    if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} MB`;
    return `${(size / 1024 ** 3).toFixed(1)} GB`;
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div>
            <p className="small-label">Preview</p>
            <h2 className="preview-title">{file.fileName}</h2>
          </div>
          <button className="preview-close" onClick={onClose} aria-label="Close preview">×</button>
        </div>

        <div className="preview-body">
          <div className={`file-icon-surface ${category.bgColor}`}>
            <div className={`file-icon ${category.color}`} style={{ fontSize: '2.4rem' }}>
              {category.icon}
            </div>
          </div>
          <div className="preview-details">
            <div>
              <p className="small-label">Type</p>
              <p>{category.label}</p>
            </div>
            <div>
              <p className="small-label">Size</p>
              <p>{formatBytes(file.size)}</p>
            </div>
          </div>
        </div>

        <div className="preview-actions">
          <button className="secondary-button" onClick={() => onDelete(file.id)}>
            Delete
          </button>
          <button className="primary-button" onClick={() => onDownload(file.id)}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
