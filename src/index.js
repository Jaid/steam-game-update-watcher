/** @module steam-game-update-watcher */

import PollingEmitter from "polling-emitter"

/**
 * Returns the number of seconds passed since Unix epoch (01 January 1970)
 * @example
 * import steamGameUpdateWatcher from "steam-game-update-watcher"
 * const result = steamGameUpdateWatcher()
 * result === 1549410770
 * @function
 * @returns {number} Seconds since epoch
 */
export default class extends PollingEmitter {

  constructor() {
    super({
      pollIntervalSeconds: 300,
      invalidateInitialEntries: true,
    })
  }

}