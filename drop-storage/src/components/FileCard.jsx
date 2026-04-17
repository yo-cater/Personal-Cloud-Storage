import { categorizeFile } from '../helperFiles/fileHelpers';

export default function FileCard({ file, onFileClick, selectMode, selected }) {
  const category = categorizeFile(file);

  return (
    <div
      className={`icloud-file-card file-card-clickable${selectMode ? ' selectable-card' : ''}${selected ? ' selected-card' : ''}`}
      onClick={() => onFileClick(file)}
    >
      {selectMode && (
        <div className={`selection-badge${selected ? ' selected' : ''}`}>
          {selected ? '✓' : ''}
        </div>
      )}
      <div className={`file-icon-surface ${category.bgColor}`}>
        <div className={`file-icon ${category.color}`}>{category.icon}</div>
      </div>
      <div className="file-meta">
        <p className="file-title">{file.fileName}</p>
        <div className="file-details">
          <span className="file-tag">{category.label}</span>
          <span className="file-size">{file.size}</span>
        </div>
      </div>
    </div>
  );
}
