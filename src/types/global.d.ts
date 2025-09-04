// src/types/global.d.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fs: {
      readFile: (path: string, options?: any) => Promise<Uint8Array | string>;
    };
  }

  var io: SocketIOServer | undefined;
  
  namespace NodeJS {
    interface Global {
      io: SocketIOServer | undefined;
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

export {};