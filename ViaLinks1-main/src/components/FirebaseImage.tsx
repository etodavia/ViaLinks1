import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface FirebaseImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storagePath: string;
  fallbackUrl?: string;
}

export const FirebaseImage: React.FC<FirebaseImageProps> = ({ 
  storagePath, 
  fallbackUrl, 
  ...props 
}) => {
  const [url, setUrl] = useState<string | undefined>(fallbackUrl);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!storagePath) return;

    const fetchUrl = async () => {
      try {
        const cleanPath = storagePath.startsWith('/') ? storagePath.substring(1) : storagePath;
        const imageRef = ref(storage, cleanPath);
        const downloadUrl = await getDownloadURL(imageRef);
        setUrl(downloadUrl);
        setError(false);
      } catch (err: any) {
        console.warn(`Firebase Storage Error [${storagePath}]:`, err.message);
        setError(true);
      }
    };

    fetchUrl();
  }, [storagePath]);

  if (error && !fallbackUrl) {
    return <div className="bg-slate-200 animate-pulse rounded-lg w-full h-full flex items-center justify-center text-slate-400 text-xs">Erro ao carregar</div>;
  }

  return (
    <img 
      src={url || fallbackUrl} 
      {...props} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
};
