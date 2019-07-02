import path from "path"

import delay from "delay"

const indexModule = (process.env.MAIN ? path.resolve(process.env.MAIN) : path.join(__dirname, "..", "src")) |> require

/**
   * @type { import("../src") }
   */
const {default: SteamGameUpdateWatcher} = indexModule

it("should run", async () => {
  const watcher = new SteamGameUpdateWatcher({depotId: "381211"})
  delay(60000)
})