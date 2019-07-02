/** @module steam-game-update-watcher */

import PollingEmitter from "polling-emitter"
import got from "got"
import matchArray from "match-array"

const fetchUpdatesRegex = new RegExp("data-changeid=\"(?<id>\\w+?)\"(?<changes>.+?)(<\\/ul|$)", "gs")
const fetchChangesRegex = new RegExp("class=\"octicon octicon-(?<icon>.+?)\"", "gs")

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

  constructor(options) {
    super({
      pollIntervalSeconds: 30,
      invalidateInitialEntries: true,
      fetchEntries: async () => {
        const result = await this.got("api/GetDepotHistory", {
          json: true,
          query: {
            depotid: this.options.depotId,
          },
        })
        if (!result.body.success) {
          throw new Error(`Did not work: result.body.success is ${result.body.success}`)
        }
        const updateBlocks = matchArray(fetchUpdatesRegex, result.body.data.Rendered)
        for (const updateBlock of updateBlocks) {
          updateBlock.changes = matchArray(fetchChangesRegex, updateBlock.changes).map(({icon}) => icon)
        }
        return updateBlocks
      },
      ...options,
    })
    this.got = got.extend({
      baseUrl: "https://steamdb.info",
    })
    this.on("invalidatedEntry", entry => {
      console.log(entry)
      debugger
    })
  }

  async fetchEntries() {
    const result = await this.got("api/GetDepotHistory", {
      json: true,
      query: {
        depotid: this.options.depotId,
      },
    })
    if (!result.body.success) {
      throw new Error(`Did not work: result.body.success is ${result.body.success}`)
    }
    const updateBlocks = matchArray(fetchUpdatesRegex, result.body.data.Rendered)
    for (const updateBlock of updateBlocks) {
      updateBlock.changes = matchArray(fetchChangesRegex, updateBlock.changes).map(({icon}) => icon)
    }
    return updateBlocks
  }

}