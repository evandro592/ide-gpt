import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
      
      // Build shortcut string
      let shortcut = '';
      if (ctrlKey || metaKey) shortcut += 'Ctrl+';
      if (shiftKey) shortcut += 'Shift+';
      if (altKey) shortcut += 'Alt+';
      shortcut += key.toUpperCase();
      
      const handler = handlers[shortcut];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}