import { categorizeFile } from '../helperFiles/fileHelpers';

export default function FileList({ files, selectMode, selectedIds = new Set(), onFileClick }) {
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  };

  return (
    <div className="w-full overflow-auto">
      <table className="file-list-table">
        <thead>
          <tr>
            <th className="file-list-checkbox-cell"></th>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => {
            const category = categorizeFile(file);
            const isSelected = selectedIds.has(file.id);
            return (
              <tr
                key={file.id}
                className={`clickable-row${selectMode ? ' selectable-row' : ''}${isSelected ? ' selected-row' : ''}`}
                onClick={() => onFileClick(file)}
              >
                <td className="file-list-checkbox-cell">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                    />
                  )}
                </td>
                <td>
                  <div className="file-list-name">
                    <span className="file-list-icon">{category.icon}</span>
                    <span className="file-list-filename">{file.fileName}</span>
                  </div>
                </td>
                <td>
                  <span className="file-list-category">{category.label}</span>
                </td>
                <td className="file-list-size">
                  {formatBytes(parseInt(file.size) || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

