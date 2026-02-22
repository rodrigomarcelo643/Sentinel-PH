# Cloudinary Image Service

## Overview

Cloudinary provides image upload, optimization, and CDN delivery for observation photos.

## Location
`src/services/cloudinaryService/index.ts`

## Setup

### Environment Variables
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Cloudinary Dashboard Setup

1. **Create Upload Preset**
   - Go to Settings → Upload
   - Create unsigned upload preset
   - Set folder: `sentinelph/observations`
   - Enable: Auto-tagging, format conversion

2. **Configure Transformations**
   - Max dimensions: 1920x1920
   - Quality: auto
   - Format: auto (WebP when supported)

## Functions

### 1. Upload Image

```typescript
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};
```

### 2. Delete Image

```typescript
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId }),
      }
    );
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};
```

### 3. Get Optimized URL

```typescript
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const { width = 800, height = 600, quality = 'auto', format = 'auto' } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_limit,q_${quality},f_${format}/${publicId}`;
};
```

## Component Usage

### Image Upload Component

```typescript
import { useState } from 'react';
import { uploadImage } from '@/services/cloudinaryService';

export function ImageUpload({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploadComplete(url);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {preview && <img src={preview} alt="Preview" className="mt-2 w-32 h-32 object-cover" />}
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

### Observation Photo Display

```typescript
import { getOptimizedUrl } from '@/services/cloudinaryService';

export function ObservationPhoto({ photoUrl }: { photoUrl: string }) {
  // Extract public_id from Cloudinary URL
  const publicId = photoUrl.split('/upload/')[1];
  
  return (
    <img
      src={getOptimizedUrl(publicId, { width: 400, height: 300 })}
      alt="Observation"
      loading="lazy"
      className="rounded-lg"
    />
  );
}
```

## Image Transformations

### Thumbnail Generation

```typescript
const thumbnailUrl = getOptimizedUrl(publicId, {
  width: 150,
  height: 150,
  quality: 80,
  format: 'webp',
});
```

### Responsive Images

```typescript
export function ResponsiveImage({ publicId, alt }: Props) {
  return (
    <picture>
      <source
        srcSet={getOptimizedUrl(publicId, { width: 400, format: 'webp' })}
        media="(max-width: 640px)"
        type="image/webp"
      />
      <source
        srcSet={getOptimizedUrl(publicId, { width: 800, format: 'webp' })}
        media="(max-width: 1024px)"
        type="image/webp"
      />
      <img
        src={getOptimizedUrl(publicId, { width: 1200 })}
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
}
```

## Security & Validation

### Client-Side Validation

```typescript
const validateImage = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return 'Image must be less than 5MB';
  }

  // Check dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 200 || img.height < 200) {
        resolve('Image must be at least 200x200 pixels');
      } else {
        resolve(null);
      }
    };
    img.src = URL.createObjectURL(file);
  });
};
```

### Upload Preset Configuration

```javascript
// Cloudinary Upload Preset Settings
{
  "unsigned": true,
  "folder": "sentinelph/observations",
  "allowed_formats": ["jpg", "png", "webp", "heic"],
  "max_file_size": 5242880, // 5MB
  "transformation": [
    {
      "width": 1920,
      "height": 1920,
      "crop": "limit"
    },
    {
      "quality": "auto:good"
    }
  ],
  "auto_tagging": 0.7,
  "moderation": "manual"
}
```

## Cost Estimation

### Cloudinary Pricing (Free Tier)
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month

### Monthly Usage Projection
```
Scenario: 1,000 observations/month with photos
- Storage: ~2GB (2MB avg per photo)
- Bandwidth: ~10GB (10 views per photo)
- Transformations: ~3,000 (3 sizes per photo)

Result: Within free tier ✅
```

### Paid Tier (if needed)
- **Plus Plan**: $89/month
  - 100GB storage
  - 100GB bandwidth
  - 100,000 transformations

## Best Practices

1. **Compress Before Upload**: Use browser-side compression
2. **Lazy Loading**: Load images only when visible
3. **WebP Format**: Use modern formats for smaller size
4. **CDN Caching**: Leverage Cloudinary's global CDN
5. **Responsive Images**: Serve appropriate sizes for devices
6. **Alt Text**: Always include descriptive alt text

## Error Handling

```typescript
try {
  const url = await uploadImage(file);
  // Success
} catch (error) {
  if (error.message.includes('network')) {
    // Network error - retry
  } else if (error.message.includes('size')) {
    // File too large
  } else {
    // Generic error
  }
}
```

## Future Enhancements

1. **Image Moderation**: Auto-detect inappropriate content
2. **EXIF Data Extraction**: Get GPS coordinates from photos
3. **AI Tagging**: Auto-tag observation types from images
4. **Watermarking**: Add SentinelPH watermark
5. **Duplicate Detection**: Detect reused images
6. **Compression**: Client-side compression before upload
