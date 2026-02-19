export interface RunResult {
  type: 'log' | 'warn' | 'error' | 'info' | 'table';
  content: any[];
  timestamp: number;
}

export async function runJavaScript(code: string, onLog: (result: RunResult) => void): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.sandbox.add('allow-scripts');
  document.body.appendChild(iframe);

  const script = `
    <script>
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        table: console.table,
      };

      function emit(type, content) {
        window.parent.postMessage({ type: 'playground-log', logType: type, content }, '*');
      }

      console.log = (...args) => emit('log', args);
      console.warn = (...args) => emit('warn', args);
      console.error = (...args) => emit('error', args);
      console.info = (...args) => emit('info', args);
      console.table = (data) => emit('table', [data]);

      window.onerror = (msg, url, line, col, error) => {
        emit('error', [msg]);
        return true;
      };

      try {
        ${code}
      } catch (err) {
        emit('error', [err.toString()]);
      }
    </script>
  `;

  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'playground-log') {
        onLog({
          type: event.data.logType,
          content: event.data.content,
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener('message', handler);

    iframe.srcdoc = script;

    // Timeout to cleanup
    setTimeout(() => {
      window.removeEventListener('message', handler);
      document.body.removeChild(iframe);
      resolve();
    }, 5000); // 5s timeout
  });
}
