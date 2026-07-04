import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
  emitEvent(event, payload = {}) {
    const message = {
      event,
      timestamp: new Date().toISOString(),
      ...payload
    };
    this.emit(event, message);
    this.emit('*', message);
  }
}

export const botEventBus = new EventBus();
