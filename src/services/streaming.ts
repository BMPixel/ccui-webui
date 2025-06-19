import type { StreamEventType } from '@/types';

export interface StreamConnection {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  onMessage: (callback: (message: StreamEventType) => void) => void;
  onError: (callback: (error: string) => void) => void;
  onClose: (callback: () => void) => void;
}

export class ConversationStream implements StreamConnection {
  private streamingId: string;
  private abortController: AbortController | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private messageHandlers: Array<(message: StreamEventType) => void> = [];
  private errorHandlers: Array<(error: string) => void> = [];
  private closeHandlers: Array<() => void> = [];
  private _isConnected = false;

  constructor(streamingId: string) {
    this.streamingId = streamingId;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    if (this._isConnected) {
      throw new Error('Stream is already connected');
    }

    this.abortController = new AbortController();

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/stream/${this.streamingId}`, {
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/x-ndjson',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Stream connection failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Stream response has no body');
      }

      this.reader = response.body.getReader();
      this._isConnected = true;

      // Start reading the stream
      this.readStream();
    } catch (error) {
      this._isConnected = false;
      this.abortController = null;
      if (error instanceof Error && error.name !== 'AbortError') {
        this.notifyError(`Connection failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async readStream(): Promise<void> {
    if (!this.reader) return;

    try {
      let buffer = '';

      while (this._isConnected && this.reader) {
        const { done, value } = await this.reader.read();
        
        if (done) {
          this.handleClose();
          break;
        }

        // Decode the chunk and add to buffer
        buffer += this.decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            try {
              const message = JSON.parse(trimmedLine) as StreamEventType;
              this.notifyMessage(message);
            } catch (parseError) {
              console.warn('Failed to parse stream message:', trimmedLine, parseError);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        this.notifyError(`Stream read error: ${error.message}`);
      }
      this.handleClose();
    }
  }

  disconnect(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    if (this.reader) {
      this.reader.cancel().catch(() => {
        // Ignore errors during cleanup
      });
      this.reader = null;
    }

    this._isConnected = false;
    this.abortController = null;
  }

  private handleClose(): void {
    this._isConnected = false;
    this.reader = null;
    this.abortController = null;
    this.notifyClose();
  }

  onMessage(callback: (message: StreamEventType) => void): void {
    this.messageHandlers.push(callback);
  }

  onError(callback: (error: string) => void): void {
    this.errorHandlers.push(callback);
  }

  onClose(callback: () => void): void {
    this.closeHandlers.push(callback);
  }

  private notifyMessage(message: StreamEventType): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyError(error: string): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  private notifyClose(): void {
    this.closeHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in close handler:', error);
      }
    });
  }
}

// Utility function to create a stream connection
export function createStream(streamingId: string): ConversationStream {
  return new ConversationStream(streamingId);
} 