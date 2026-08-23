import html2canvas from 'html2canvas';

export async function exportAsPNG(elementId: string, filename: string = 'analytics.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to export as PNG:', error);
  }
}
