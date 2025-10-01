'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PhotoUpload = ({ currentAvatar, onPhotoChange, disabled = false }) => {
  const [preview, setPreview] = useState(currentAvatar || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadPhotoMutation = useMutation({
    mutationFn: async file => {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: data => {
      setPreview(data.avatarUrl);
      onPhotoChange(data.avatarUrl);
      queryClient.invalidateQueries(['profile']);
    },
    onError: error => {
      console.error('Photo upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    uploadPhotoMutation.mutate(file, {
      onSettled: () => setUploading(false),
    });
  };

  const handleRemovePhoto = () => {
    setPreview('');
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='relative'>
        <div
          className={`w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden cursor-pointer transition-all ${
            disabled || uploading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-indigo-300 hover:shadow-lg'
          }`}
          onClick={handleClick}
        >
          {preview ? (
            <img
              src={preview}
              alt='Profile'
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
              <div className='text-4xl text-gray-400'>👤</div>
            </div>
          )}
        </div>

        {uploading && (
          <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
          </div>
        )}
      </div>

      <div className='flex flex-col items-center space-y-2'>
        <button
          type='button'
          onClick={handleClick}
          disabled={disabled || uploading}
          className='px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {uploading
            ? 'Uploading...'
            : preview
              ? 'Change Photo'
              : 'Upload Photo'}
        </button>

        {preview && (
          <button
            type='button'
            onClick={handleRemovePhoto}
            disabled={disabled || uploading}
            className='px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
        disabled={disabled || uploading}
      />

      <p className='text-xs text-gray-500 text-center max-w-xs'>
        Upload a profile photo. Max size: 5MB. Supported formats: JPG, PNG, GIF
      </p>
    </div>
  );
};

export default PhotoUpload;
