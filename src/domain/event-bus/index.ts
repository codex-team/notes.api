import type { NOTE_ADDED_EVENT_NAME, NoteAddedEvent } from './events/noteAddedEvent.js';

/**
 * Event Bus provides a loosely coupled communication way between Domain and some other layers
 *
 * Extends native event emitter called EventTarget
 */
export default class EventBus extends EventTarget {
  private static instance: EventBus;

  /**
   * EventBus constructor
   */
  constructor() {
    super();
  }

  /**
   * Gets the singleton instance of the EventBus
   */
  public static getInstance(): EventBus {
    if (EventBus.instance === undefined) {
      EventBus.instance = new EventBus();
    }

    return EventBus.instance;
  }

  /**
   * Dispatches an event
   *
   * @param event - The event to dispatch
   */
  public dispatch(event: Event): boolean {
    return this.dispatchEvent(event);
  }
}

export type CrossDomainEventMap = {
  [NOTE_ADDED_EVENT_NAME]: NoteAddedEvent,
};


