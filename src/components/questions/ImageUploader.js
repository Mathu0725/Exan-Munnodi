'use client';

import { useState, useRef } from 'react';

// In a real app, this would be an API call to an upload endpoint.
const fakeUploadService = async file => {
  console.log(`Simulating upload for ${file.name}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  // In a real app, the server would return a permanent URL.
  // For now, we return a local blob URL for preview purposes.
  return URL.createObjectURL(file);
};

export default function ImageUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async event => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await fakeUploadService(file);
      setPreviewUrl(imageUrl);
      onUploadComplete(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUploadComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700'>
        Question Image (Optional)
      </label>
      <div className='mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
        <div className='space-y-1 text-center'>
          {previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt='Question preview'
                className='mx-auto h-48 w-auto rounded-md object-contain'
              />
              <button
                type='button'
                onClick={handleRemoveImage}
                className='mt-4 text-sm text-red-600 hover:text-red-800 font-medium'
              >
                Remove Image
              </button>
            </div>
          ) : (
            <>
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 48 48'
                aria-hidden='true'
              >
                <path
                  d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <div className='flex text-sm text-gray-600'>
                <label
                  htmlFor='file-upload'
                  className='relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none'
                >
                  <span>Upload a file</span>
                  <input
                    id='file-upload'
                    name='file-upload'
                    type='file'
                    className='sr-only'
                    accept='image/*'
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={uploading}
                  />
                </label>
                <p className='pl-1'>or drag and drop</p>
              </div>
              <p className='text-xs text-gray-500'>PNG, JPG, GIF up to 10MB</p>
              {uploading && (
                <p className='text-sm text-indigo-500 animate-pulse'>
                  Uploading...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
