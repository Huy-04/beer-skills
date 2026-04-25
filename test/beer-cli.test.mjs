import assert from "node:assert/strict";
import test from "node:test";

import { main as beerCliMain } from "../scripts/commands/beer-cli.mjs";

test("beer cli import and help dispatch are not hijacked by imported guard modules", async () => {
  const exitCode = await beerCliMain(["help"]);
  assert.equal(exitCode, 0);
});
