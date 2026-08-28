export function keyHandler(event: KeyboardEvent, callback: (index: number) => void): void {
    const input = event.currentTarget as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value) {
      event.preventDefault();
      callback(-1);
    } else if (event.key === 'Enter' && input.value) {
      event.preventDefault();
      callback(1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      callback(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      callback(-1);
    }
  }