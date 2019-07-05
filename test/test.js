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
    depotId: "381211",
    pollInterval: ms`5 seconds`,
  })
  watcher.start()
  let newEntryFired = false
  expect(watcher.isRunning).toBe(true)
  watcher.on("newEntry", entry => {
    console.log(entry)
    newEntryFired = true
    debugger
  })
  watcher.on("invalidatedEntry", entry => {
    console.log(entry)
    debugger
  })
  await delay(ms`30 seconds`)
  watcher.stop()
  expect(newEntryFired).toBe(true)
}, ms`1 minute`)