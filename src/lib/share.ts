export async function shareResult(
  node: HTMLElement,
  filename = 'quizz-claude-code.png',
): Promise<{ ok: boolean; method: 'share' | 'download' | 'error'; error?: unknown }> {
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(node, {
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: '#0f0f0f',
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: 'image/png' });

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] }) &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          files: [file],
          title: 'Quizz Claude Code',
          text: 'Veja meu resultado no Quizz Claude Code!',
        });
        return { ok: true, method: 'share' };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { ok: false, method: 'share', error: err };
        }
        // fall through to download
      }
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { ok: true, method: 'download' };
  } catch (error) {
    console.error('shareResult failed:', error);
    return { ok: false, method: 'error', error };
  }
}
