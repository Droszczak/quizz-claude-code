export type ShareMethod = 'share' | 'download' | 'error';

export interface ShareResult {
  ok: boolean;
  method: ShareMethod;
  error?: unknown;
}

function canFileShare(file: File): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.canShare === 'function' &&
      typeof navigator.share === 'function' &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    // Safari and some embedded WebViews can throw on canShare even when the
    // API is present. Treat that as "share unavailable" and let the caller
    // fall back to the download path.
    return false;
  }
}

function triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    document.body.removeChild(link);
  }
}

export async function shareResult(
  node: HTMLElement,
  filename = 'quizz-claude-code.png',
): Promise<ShareResult> {
  let dataUrl: string;
  try {
    const { toPng } = await import('html-to-image');
    dataUrl = await toPng(node, {
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: '#0f0f0f',
    });
  } catch (error) {
    console.error('shareResult: PNG generation failed', error);
    return { ok: false, method: 'error', error };
  }

  let file: File | null = null;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    file = new File([blob], filename, { type: 'image/png' });
  } catch (error) {
    // Fetch of data: URL or File construction failed — still try download.
    console.error('shareResult: file construction failed', error);
  }

  if (file && canFileShare(file)) {
    try {
      await navigator.share({
        files: [file],
        title: 'Quizz Claude Code',
        text: 'Veja meu resultado no Quizz Claude Code!',
      });
      return { ok: true, method: 'share' };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User intentionally cancelled the share sheet — do not download.
        return { ok: false, method: 'share', error: err };
      }
      // Any other share error → fall through to download below.
      console.error('shareResult: navigator.share failed', err);
    }
  }

  try {
    triggerDownload(dataUrl, filename);
    return { ok: true, method: 'download' };
  } catch (error) {
    console.error('shareResult: download failed', error);
    return { ok: false, method: 'error', error };
  }
}
