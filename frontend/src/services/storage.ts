import { fetchFromApi } from '../api';

export async function uploadFile(file: File): Promise<string> {
  // 1. Get Presigned URL
  const { uploadUrl, key } = await fetchFromApi('requester/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type
    })
  });

  // 2. Upload to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });

  return key;
}

export async function registerUser(userId: string, role: 'Requester' | 'Worker', name: string) {
    return await fetchFromApi('users/profile', {
        method: 'POST',
        body: JSON.stringify({ userId, role, name })
    });
}
