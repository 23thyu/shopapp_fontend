import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Slider from '@mui/material/Slider';
import Cropper from 'react-easy-crop';
import IconifyIcon from 'components/base/IconifyIcon';
import { api } from 'services/api';

interface MediaSelectorProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
  aspectRatio?: number; // e.g. 1 (square), 3 (banner 3:1), 1.77 (16:9), undefined for no crop
  cropShape?: 'rect' | 'round'; // circular overlay for avatar, rect for banners
  allowMultiple?: boolean; // Enable selecting multiple images from library
  compact?: boolean;
  onlyUpload?: boolean;
}

// Canvas crop helper functions
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], 'cropped_image.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

export default function MediaSelector({
  label,
  value,
  onChange,
  placeholder = 'Đường dẫn hình ảnh (URL)',
  required = false,
  aspectRatio,
  cropShape = 'rect',
  allowMultiple = false,
  compact = false,
  onlyUpload = false,
}: MediaSelectorProps) {
  console.log('MediaSelector rendered. allowMultiple:', allowMultiple, 'value:', value);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Cropper states
  const [cropOpen, setCropOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  // Crop Queue states for bulk image crop
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  const startCropping = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropOpen(true);
    };
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMedia('all');
      setMediaList(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Error fetching media for selector:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (!onlyUpload) {
        fetchMedia();
      }
      if (allowMultiple) {
        const urls = value ? value.split(',').map(u => u.trim()).filter(Boolean) : [];
        setSelectedUrls(urls);
      } else {
        setSelectedUrl(value);
      }
    }
  }, [open, value, allowMultiple, onlyUpload]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (aspectRatio !== undefined) {
      const fileList = Array.from(files).slice(0, 5);
      if (files.length > 5) {
        alert('Chỉ cho phép tải lên & cắt tối đa 5 hình ảnh cùng lúc. Hệ thống sẽ lấy 5 ảnh đầu tiên.');
      }
      setCropQueue(fileList);
      setCurrentQueueIndex(0);
      startCropping(fileList[0]);
    } else {
      // Direct bulk upload if no aspect ratio is specified
      const uploadFilesCount = Math.min(files.length, 5);
      if (files.length > 5) {
        alert('Chỉ cho phép tải lên tối đa 5 hình ảnh cùng lúc. Hệ thống sẽ lấy 5 ảnh đầu tiên.');
      }

      const formData = new FormData();
      for (let i = 0; i < uploadFilesCount; i++) {
        formData.append('images', files[i]);
      }

      setUploading(true);
      try {
        const res = await api.uploadMedia(formData);
        if (!onlyUpload) {
          await fetchMedia();
        }
        
        // Select the first uploaded image automatically
        const uploadedMediaList = res?.data || [];
        const firstUploaded = uploadedMediaList[0];
        const newUrl = firstUploaded?.image_url || firstUploaded?.url;
        if (newUrl) {
          setSelectedUrl(newUrl);
          if (onlyUpload) {
            onChange(newUrl);
            setOpen(false);
          }
        }
        if (!onlyUpload) {
          setActiveTab(1); // Switch to Library tab to show the selection
        }
      } catch (err: any) {
        alert(err.message || 'Lỗi tải ảnh lên');
      } finally {
        setUploading(false);
      }
    }
    
    // Clear input so same file can be uploaded again
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const formData = new FormData();
      formData.append('images', croppedFile);

      const res = await api.uploadMedia(formData);
      if (!onlyUpload) {
        await fetchMedia();
      }
      
      const uploadedMedia = res?.data?.[0];
      const newUrl = uploadedMedia?.image_url || uploadedMedia?.url;
      if (newUrl) {
        setSelectedUrl(newUrl);
      }

      // Check if there are more images in the queue to crop
      const nextIndex = currentQueueIndex + 1;
      if (cropQueue.length > 0 && nextIndex < cropQueue.length) {
        setCurrentQueueIndex(nextIndex);
        // Load next file into the cropper
        const nextFile = cropQueue[nextIndex];
        const reader = new FileReader();
        reader.readAsDataURL(nextFile);
        reader.onload = () => {
          setImageToCrop(reader.result as string);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          // Keep crop modal open
        };
      } else {
        // All cropped and uploaded
        setCropOpen(false);
        setImageToCrop('');
        setCropQueue([]);
        setCurrentQueueIndex(0);
        if (onlyUpload && newUrl) {
          onChange(newUrl);
          setOpen(false);
        } else {
          setActiveTab(1);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi cắt hoặc tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (url: string) => {
    console.log('handleSelectImage called with:', url, 'allowMultiple:', allowMultiple);
    if (allowMultiple) {
      if (selectedUrls.includes(url)) {
        const nextUrls = selectedUrls.filter((u) => u !== url);
        console.log('Removing image. New list:', nextUrls);
        setSelectedUrls(nextUrls);
      } else {
        if (selectedUrls.length >= 5) {
          alert('Chỉ được phép chọn tối đa 5 hình ảnh.');
          return;
        }
        const nextUrls = [...selectedUrls, url];
        console.log('Adding image. New list:', nextUrls);
        setSelectedUrls(nextUrls);
      }
    } else {
      setSelectedUrl(url);
    }
  };

  const handleConfirm = () => {
    if (allowMultiple) {
      onChange(selectedUrls.join(','));
    } else {
      onChange(selectedUrl);
    }
    setOpen(false);
  };

  return (
    <Stack direction="column" spacing={1} width={compact ? 'auto' : 1}>
      {!compact && (
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {label} {required && '*'}
        </Typography>
      )}
      {compact ? (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            width: 60,
            height: 60,
            borderRadius: 1,
            border: '1px dashed rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            backgroundColor: '#fafafa',
            position: 'relative',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: '#f0f7ff',
            },
          }}
        >
          {value ? (
            <>
              <img src={value} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '9px',
                  textAlign: 'center',
                  py: 0.2,
                }}
              >
                Sửa
              </Box>
            </>
          ) : (
            <Stack alignItems="center" spacing={0.2} sx={{ color: 'text.secondary' }}>
              <IconifyIcon icon="material-symbols:add-photo-alternate-outline" fontSize={20} />
              <Typography variant="caption" sx={{ fontSize: '8px', fontWeight: 600 }}>Thêm ảnh</Typography>
            </Stack>
          )}
        </Box>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center" width={1}>
          {!onlyUpload && (
            <TextField
              fullWidth
              variant="filled"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              InputLabelProps={{ shrink: true }}
            />
          )}
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            fullWidth={onlyUpload}
            sx={{ 
              height: onlyUpload ? 42 : 56, 
              minWidth: onlyUpload ? undefined : 150,
              borderRadius: onlyUpload ? 2 : undefined,
              bgcolor: onlyUpload ? '#000000' : undefined,
              color: onlyUpload ? '#ffffff' : undefined,
              '&:hover': {
                bgcolor: onlyUpload ? '#222222' : undefined
              }
            }}
            startIcon={<IconifyIcon icon="material-symbols:image-outline" />}
          >
            {onlyUpload ? 'Tải lên ảnh đại diện mới' : 'Chọn ảnh'}
          </Button>
        </Stack>
      )}

      {/* Main WordPress-like Media Selector Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 1 }}>
          {onlyUpload ? 'Tải lên hình ảnh đại diện' : 'Chọn hoặc Tải lên hình ảnh'}
        </DialogTitle>
        
        {!onlyUpload && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
              <Tab label="Tải tập tin lên" sx={{ fontWeight: 'bold' }} />
              <Tab label="Thư viện hình ảnh" sx={{ fontWeight: 'bold' }} />
            </Tabs>
          </Box>
        )}

        <DialogContent sx={{ minHeight: onlyUpload ? 250 : 350, py: 2 }}>
          {onlyUpload || activeTab === 0 ? (
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={3} sx={{ height: 300, border: '2px dashed rgba(0,0,0,0.15)', borderRadius: 3, m: 1 }}>
              {uploading ? (
                <Stack direction="column" alignItems="center" spacing={2}>
                  <CircularProgress size={48} />
                  <Typography variant="body1" color="text.secondary">Đang tải hình ảnh lên Cloudinary...</Typography>
                </Stack>
              ) : (
                <>
                  <IconifyIcon icon="material-symbols:upload-file-outline" fontSize={64} sx={{ color: 'text.disabled' }} />
                  <Button variant="contained" component="label">
                    Chọn tệp hình ảnh
                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                  </Button>
                  <Typography variant="caption" color="text.secondary">Chấp nhận JPG, PNG, GIF, WEBP</Typography>
                </>
              )}
            </Stack>
          ) : (
            <Box>
              {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 300 }}>
                  <CircularProgress />
                </Stack>
              ) : mediaList.length === 0 ? (
                <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 300 }} spacing={2}>
                  <IconifyIcon icon="material-symbols:photo-library-outline" fontSize={48} sx={{ color: 'text.disabled' }} />
                  <Typography color="text.secondary">Chưa có ảnh nào trong thư viện</Typography>
                </Stack>
              ) : (
                <Grid container spacing={2} sx={{ maxHeight: 400, overflowY: 'auto', p: 1 }}>
                  {mediaList.map((media) => {
                    const url = media.image_url || media.url;
                    const isSelected = allowMultiple ? selectedUrls.includes(url) : selectedUrl === url;
                    return (
                      <Grid key={media.id} item xs={6} sm={4} md={3} lg={2.4}>
                        <Card
                          onClick={() => handleSelectImage(url)}
                          onDoubleClick={() => {
                            if (allowMultiple) {
                              // In multiple mode, just select, don't auto confirm double click
                              handleSelectImage(url);
                            } else {
                              handleSelectImage(url);
                              onChange(url);
                              setOpen(false);
                            }
                          }}
                          sx={{
                            cursor: 'pointer',
                            position: 'relative',
                            border: isSelected ? '3px solid #1A73E8' : '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 2,
                            boxShadow: isSelected ? 3 : 'none',
                            transform: isSelected ? 'scale(0.98)' : 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: isSelected ? '#1A73E8' : 'primary.main',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={url}
                            alt="media-item"
                            sx={{ height: 100, objectFit: 'cover' }}
                          />
                          {isSelected && (
                            <Box sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#1A73E8', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconifyIcon icon="material-symbols:check" fontSize={14} />
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 'bold' }}>Hủy</Button>
          {!onlyUpload && (
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={allowMultiple ? selectedUrls.length === 0 : !selectedUrl}
              sx={{ fontWeight: 'bold' }}
            >
              Sử dụng hình ảnh {allowMultiple && selectedUrls.length > 0 ? `(${selectedUrls.length})` : ''}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Image Cropping Step Modal */}
      <Dialog open={cropOpen} onClose={() => setCropOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          Cắt chỉnh khung ảnh {cropQueue.length > 1 ? `(${currentQueueIndex + 1} / ${cropQueue.length})` : ''}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ position: 'relative', width: '100%', height: 320, bgcolor: '#333', borderRadius: 2, overflow: 'hidden', mt: 1 }}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio || 1}
              cropShape={cropShape}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
            />
          </Box>
          <Stack spacing={2} direction="row" alignItems="center" mt={3} px={1}>
            <IconifyIcon icon="material-symbols:zoom-in" sx={{ color: 'text.secondary', fontSize: 24 }} />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_, val) => setZoom(val as number)}
              sx={{ flexGrow: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', px: 3, py: 2 }}>
          <Button onClick={() => setCropOpen(false)} sx={{ fontWeight: 'bold' }}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCropConfirm}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ fontWeight: 'bold' }}
          >
            {uploading ? 'Đang tải lên...' : 'Cắt ảnh & Tải lên'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
