/**
 * High-reliability APK downloader utility
 * Handles sandboxed iframe restrictions via Blob URL and direct fallbacks
 */
export async function downloadApkFile(
  onStateChange?: (state: 'idle' | 'downloading' | 'success' | 'error') => void
): Promise<boolean> {
  if (onStateChange) onStateChange('downloading');

  try {
    // 1. Fetch APK as blob (works reliably inside sandboxed iframe without navigation restrictions)
    const response = await fetch('/download/Mathmate.apk');
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.download = 'Mathmate.apk';
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();

    setTimeout(() => {
      if (document.body.contains(tempLink)) {
        document.body.removeChild(tempLink);
      }
      window.URL.revokeObjectURL(blobUrl);
      if (onStateChange) onStateChange('success');
      setTimeout(() => {
        if (onStateChange) onStateChange('idle');
      }, 3000);
    }, 1000);

    return true;
  } catch (err) {
    console.warn('Blob download attempt encountered an issue, trying direct fallback:', err);
    try {
      // 2. Direct fallback
      const directLink = document.createElement('a');
      directLink.href = '/download/Mathmate.apk';
      directLink.download = 'Mathmate.apk';
      directLink.target = '_blank';
      directLink.rel = 'noopener noreferrer';
      document.body.appendChild(directLink);
      directLink.click();
      setTimeout(() => {
        if (document.body.contains(directLink)) {
          document.body.removeChild(directLink);
        }
        if (onStateChange) onStateChange('success');
      }, 1000);
      return true;
    } catch (fallbackErr) {
      console.error('All download methods failed:', fallbackErr);
      if (onStateChange) onStateChange('error');
      return false;
    }
  }
}
