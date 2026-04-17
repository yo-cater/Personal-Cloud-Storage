// src/utils/fileHelpers.js

export const categorizeFile = (file) => {
  const type = file.fileType?.toLowerCase() || "";
  const name = file.fileName?.toLowerCase() || "";

  // Pictures
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic)$/.test(name)) 
    return { label: 'Pictures', icon: '🖼️', color: 'text-purple-500', bgColor: 'bg-purple-50' };
  
  // Music
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a)$/.test(name)) 
    return { label: 'Music', icon: '🎵', color: 'text-pink-500', bgColor: 'bg-pink-50' };
  
  // Videos
  if (type.startsWith('video/') || /\.(mp4|mov|avi|mkv|wmv)$/.test(name)) 
    return { label: 'Videos', icon: '🎥', color: 'text-red-500', bgColor: 'bg-red-50' };
  
  // Archives
  if (/\.(zip|7z|rar|tar|gz)$/.test(name)) 
    return { label: 'Archives', icon: '📦', color: 'text-orange-500', bgColor: 'bg-orange-50' };
  
  // Windows Apps
  if (/\.(exe|msi|bat)$/.test(name)) 
    return { label: 'Apps', icon: '⚙️', color: 'text-blue-500', bgColor: 'bg-blue-50' };
  
  // Android Apps
  if (/\.(apk)$/.test(name)) 
    return { label: 'APKs', icon: '🤖', color: 'text-green-600', bgColor: 'bg-green-50' };
  
  // Default / Documents
  return { label: 'Documents', icon: '📄', color: 'text-gray-500', bgColor: 'bg-gray-50' };
};