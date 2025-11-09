/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

/**
 * Hook-like function to copy text with temporary feedback
 * Useful for components that need copy functionality
 */
export function useCopyToClipboard() {
  const copy = async (text: string): Promise<boolean> => {
    try {
      await copyToClipboard(text);
      return true;
    } catch (error) {
      return false;
    }
  };

  return { copy };
}

