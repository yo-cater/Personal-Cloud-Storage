async function uploadFile(file) {
  // 1. Ask your API for the SAS URL
  const initResponse = await fetch('/api/upload/initiate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userJwt}` 
    },
    body: JSON.stringify({
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type
    })
  });
  
  const { uploadUrl, blobPath } = await initResponse.json();

  // 2. Upload DIRECTLY to Azure (The Valet Key in action)
  const azureResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob', // Required by Azure
      'Content-Type': file.type
    },
    body: file
  });

  if (azureResponse.ok) {
    // 3. Tell your API the upload is finished so it saves to Supabase
    await fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userJwt}` 
      },
      body: JSON.stringify({
        blobPath: blobPath,
        fileName: file.name,
        fileSizeBytes: file.size
      })
    });
    alert("Upload Successful!");
  }
}