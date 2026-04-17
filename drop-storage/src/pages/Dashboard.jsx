import { useState, useEffect } from 'react';
import FileCard from '../components/FileCard';
import FileList from '../components/FileList';
import LoginModal from '../components/LoginModal'; // Create this from the previous snippet
import FileUploadConfirmationModal from '../components/FileUploadConfirmationModal';
import FilePreviewModal from '../components/FilePreviewModal';
import ThemeToggle from '../components/ThemeToggle';
import { categorizeFile } from '../helperFiles/fileHelpers';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());

  useEffect(() => {
    checkUser();
    fetchFiles();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchFiles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch("https://the-cloud-storage.azurewebsites.net/api/files", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadConfirmation(true);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session.access_token;

    setShowUploadConfirmation(false);
    setUploadQueue(prev => [...prev, { name: selectedFile.name, progress: 0 }]);

    try {
      const initRes = await fetch("https://the-cloud-storage.azurewebsites.net/api/upload/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ fileName: selectedFile.name, fileSizeBytes: selectedFile.size, fileType: selectedFile.type })
      });
      const { uploadUrl, blobPath } = await initRes.json();

      // Upload with progress tracking using XMLHttpRequest
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadQueue(prev => prev.map(u => 
              u.name === selectedFile.name ? { ...u, progress } : u
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 201 || xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.send(selectedFile);
      });

      await fetch("https://the-cloud-storage.azurewebsites.net/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ blobPath, fileName: selectedFile.name, fileSizeBytes: selectedFile.size })
      });

      fetchFiles();
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploadQueue(prev => prev.filter(u => u.name !== selectedFile.name));
    }
  };

  const handleCancelUpload = () => {
    setShowUploadConfirmation(false);
    setSelectedFile(null);
  };

  const handleFileUpload = handleFileSelect;

  const openPreview = (file) => setPreviewFile(file);
  const closePreview = () => setPreviewFile(null);

  const handleToggleSelectionMode = () => {
    if (selectMode) {
      setSelectMode(false);
      setSelectedFileIds(new Set());
      return;
    }
    setSelectMode(true);
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const selectAllFiles = () => {
    setSelectedFileIds(new Set(filteredFiles.map(file => file.id)));
  };

  const clearSelection = () => {
    setSelectedFileIds(new Set());
  };

  const handleFileClick = (file) => {
    if (selectMode) {
      toggleFileSelection(file.id);
    } else {
      openPreview(file);
    }
  };

  const handlePreviewDownload = async (fileId) => {
    const success = await handleDownload(fileId);
    if (success) closePreview();
  };

  const handlePreviewDelete = async (fileId) => {
    const success = await handleDelete(fileId);
    if (success) closePreview();
  };

  const handleSelectedDownload = async () => {
    for (const fileId of selectedFileIds) {
      await handleDownload(fileId);
    }
  };

  const handleSelectedDelete = async () => {
    if (selectedFileIds.size === 0) return;
    if (!confirm(`Delete ${selectedFileIds.size} selected file(s)?`)) return;

    for (const fileId of Array.from(selectedFileIds)) {
      await handleDelete(fileId);
    }
    clearSelection();
  };

  const handleDownload = async (fileId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setShowLogin(true);
        return;
      }

      const response = await fetch(`https://the-cloud-storage.azurewebsites.net/api/files/download/${fileId}`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      
      if (!response.ok) throw new Error("Download failed");
      const { downloadUrl } = await response.json();

      // Trigger browser download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.click();
      return true;
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
      return false;
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setShowLogin(true);
        return;
      }

      const response = await fetch(`https://the-cloud-storage.azurewebsites.net/api/files/${fileId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      if (!response.ok) throw new Error("Delete failed");
      
      // Remove from UI optimistically
      setFiles(prev => prev.filter(f => f.id !== fileId));
      return true;
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete file");
      fetchFiles(); // Refresh if error
      return false;
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      setUser(null);
      setFiles([]);
      window.location.reload(); // Refresh to reset UI
    }
  };

  const parseFileSize = (size) => {
    if (typeof size === 'number') return size;
    if (typeof size !== 'string') return 0;

    const match = size.match(/([\d.]+)\s*(B|KB|MB|GB)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
    return value * (multipliers[unit] ?? 1);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  };

  const storageLimitBytes = 5 * 1024 * 1024 * 1024; // 5 GB plan
  const totalStorageUsed = files.reduce((sum, file) => sum + parseFileSize(file.size), 0);
  const storageUsedPercent = Math.min(100, Math.round((totalStorageUsed / storageLimitBytes) * 100));

  const filteredFiles = files.filter(file => {
    if (filter === 'All') return true;
    return categorizeFile(file).label === filter;
  });

  const categories = ['All', 'Pictures', 'Music', 'Videos', 'Archives', 'Apps', 'APKs'];

  return (
    <div className="dashboard-shell">
      <header className="icloud-header">
        <div className="icloud-topbar">
          <div className="brand-block">
            <div className="brand-icon">☁️</div>
            <div>
              <p className="brand-label">Personal Cloud</p>
              <h1 className="brand-title">Drive</h1>
            </div>
          </div>
          <div className="header-actions">
            {user && <span className="user-chip">{user.email}</span>}
            <ThemeToggle />
            {user && (
              <button
                className={selectMode ? 'secondary-button' : 'text-button'}
                onClick={handleToggleSelectionMode}
              >
                {selectMode ? 'Exit Selection' : 'Select'}
              </button>
            )}
            {user ? (
              <>
                <label className="primary-button">
                  <span>Upload</span>
                  <input type="file" className="sr-only" onChange={handleFileUpload} />
                </label>
                <button onClick={handleLogout} className="secondary-button">Log Out</button>
              </>
            ) : (
              <button onClick={() => setShowLogin(true)} className="primary-button">Sign In</button>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="summary-card">
          <div className="summary-top">
            <div>
              <p className="summary-label">Storage</p>
              <h2 className="summary-title">Your Personal Cloud Storage</h2>
            </div>
            <button className="text-button">Upgrade</button>
          </div>

          <div className="storage-stats">
            <div className="storage-bar">
              <div className="storage-fill" style={{ width: `${storageUsedPercent}%` }} />
            </div>
            <div className="storage-meta">
              <span>{formatBytes(totalStorageUsed)} used</span>
              <span>{storageUsedPercent}% of 5 GB</span>
            </div>
          </div>

          <div className="storage-summary-grid">
            <div>
              <p className="small-label">Total Files</p>
              <p className="summary-value">{files.length}</p>
            </div>
            <div>
              <p className="small-label">Available</p>
              <p className="summary-value">{formatBytes(storageLimitBytes - totalStorageUsed)}</p>
            </div>
            <div>
              <p className="small-label">Plan</p>
              <p className="summary-value">5 GB Free</p>
            </div>
          </div>
        </section>

        <section className="category-row">
          <div className="category-inner">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={filter === cat ? 'category-pill active' : 'category-pill'}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {selectMode && (
          <section className="selection-pane">
            <div className="selection-pane-info">
              <p className="small-label">Selection</p>
              <p className="selection-count">{selectedFileIds.size} selected</p>
            </div>
            <div className="selection-pane-actions">
              <button className="secondary-button" onClick={selectAllFiles}>
                Select all
              </button>
              <button className="text-button" onClick={clearSelection}>
                Clear
              </button>
              <button
                className="secondary-button"
                onClick={handleSelectedDownload}
                disabled={selectedFileIds.size === 0}
              >
                Download selected
              </button>
              <button
                className="primary-button"
                onClick={handleSelectedDelete}
                disabled={selectedFileIds.size === 0}
              >
                Delete selected
              </button>
            </div>
          </section>
        )}

        {/* 4. UPLOAD QUEUE */}
        {uploadQueue.length > 0 && (
          <div className="upload-queue-container">
            {uploadQueue.map(u => (
              <div key={u.name} className="upload-item">
                <div className="upload-item-header">
                  <span className="upload-item-name">{u.name}</span>
                  <span className="upload-item-progress-text">{u.progress}%</span>
                </div>
                <div className="upload-progress-bar">
                  <div className="upload-progress-fill" style={{ width: `${u.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. FILE VIEW - LIST FOR ALL, GRID FOR CATEGORIES */}
        {filter === 'All' ? (
          <FileList
            files={filteredFiles}
            selectMode={selectMode}
            selectedIds={selectedFileIds}
            onFileClick={handleFileClick}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {filteredFiles.map(file => (
              <FileCard 
                key={file.id} 
                file={file} 
                selectMode={selectMode}
                selected={selectedFileIds.has(file.id)}
                onFileClick={handleFileClick}
              />
            ))}
          </div>
        )}

        {/* 6. EMPTY STATE */}
        {filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-lg font-medium">No {filter === 'All' ? 'Files' : filter} Yet</p>
          </div>
        )}
      </main>

      {/* 7. UPLOAD CONFIRMATION MODAL */}
      <FileUploadConfirmationModal 
        isOpen={showUploadConfirmation} 
        file={selectedFile}
        onConfirm={handleConfirmUpload}
        onCancel={handleCancelUpload}
      />

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={closePreview}
          onDownload={() => handlePreviewDownload(previewFile.id)}
          onDelete={() => handlePreviewDelete(previewFile.id)}
        />
      )}

      {/* 8. LOGIN MODAL OVERLAY */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}