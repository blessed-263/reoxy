import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 120,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
  level = 'M',
  includeMargin = false
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: size * 2, // 2x resolution for crisp high-DPI rendering in PDF export
      margin: includeMargin ? 2 : 1,
      errorCorrectionLevel: level as QRCode.QRCodeErrorCorrectionLevel,
      color: {
        dark: darkColor,
        light: lightColor
      }
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to generate QR code:', err);
          setError('QR error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor, level, includeMargin]);

  if (error) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 text-[10px] text-slate-500 font-mono border border-slate-200 ${className}`}
      >
        QR Error
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-50 border border-slate-200 animate-pulse ${className}`}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Verification QR Code"
      style={{ width: size, height: size }}
      className={`block select-none ${className}`}
      loading="eager"
    />
  );
};
