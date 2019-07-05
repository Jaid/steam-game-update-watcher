/** @module steam-game-update-watcher */

import PollingEmitter from "polling-emitter"
import got from "got"
import matchArray from "match-array"
import KeyCounter from "key-counter"
import aliasFields from "alias-fields"
import {isEqualWith} from "lodash"
import ms from "ms.macro"

const fetchUpdatesRegex = new RegExp("data-changeid=\"(?<id>\\w+?)\"(?<changes>.+?)(<\\/ul|$)", "gs")
const fetchChangesRegex = new RegExp("class=\"octicon octicon-(?<icon>.+?)\"", "gs")

/**
 * @typedef Options
 * @type {Object}
 * @prop {number} [pollInterval=120000]
 * @prop {string} depotId
 */

/**
 * Emits an event whenever a specific Steam game gets patched.
 * @class
 * @extends {PollingEmitter}
 * @example
 * import GameUpdateWatcher from "steam-game-update-watcher"
 * const watcher = new GameUpdateWatcher({
 *   depotId: "241321", // Ittle Dew Content
 * })
 * watcher.on("contentChanged", changes => {
 *   console.log("Game content changed!")
 * })
 * watcher.start()
 */
export default class extends PollingEmitter {

  /**
   * @constructor
   * @param {Options} options
   */
  constructor(options) {
    super({
      pollInterval: ms`2 minutes`,
      invalidateInitialEntries: true,
      autostart: false,
      ...options,
    })
    this.got = got.extend({
      baseUrl: "https://steamdb.info",
    })
    this.on("newEntry", entry => {
      debugger
      const counter = new KeyCounter(entry.changes)
      const counts = aliasFields(counter.toObject(), {
        fileAdded: "diff-added",
        fileRemoved: "diff-removed",
        fileChanged: "diff-modified",
        manifestChanged: "git-commit",
      })
      const onlyManifestChanged = isEqualWith(Object.keys(counts), ["manifestChanged"])
      this.emit(onlyManifestChanged ? "manifestChanged" : "contentChanged", {
        changes: counts,
      })
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