import path from "path"

import delay from "delay"
import ms from "ms.macro"

const indexModule = (process.env.MAIN ? path.resolve(process.env.MAIN) : path.join(__dirname, "..", "src")) |> require

/**
  * @type { import("../src") }
*/
const {default: SteamGameUpdateWatcher} = indexModule

it("should run", async () => {
  const watcher = new SteamGameUpdateWatcher({
    depotId: "241321", // Ittle Dew Content
    pollInterval: ms`5 seconds`,
  })
  let initialEntryFired = false
  let manifestChangedFired = false
  watcher.on("initialEntry", entry => {
    expect(entry.changes.length > 0).toBe(true)
    initialEntryFired = true
  })
  watcher.on("manifestChanged", entry => {
    expect(entry.changes).toStrictEqual({
      manifestChanged: 1,
    })
    manifestChangedFired = true
  })
  watcher.start()
  expect(watcher.isRunning).toBe(true)
  watcher.emit("newEntry", {
    id: "123",
    changes: ["git-commit"],
  })
  await delay(ms`15 seconds`)
  watcher.stop()
  expect(watcher.isRunning).toBe(false)
  expect(initialEntryFired).toBe(true)
  expect(manifestChangedFired).toBe(true)
}, ms`16 seconds`)