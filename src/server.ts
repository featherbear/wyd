import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";

import fs from "fs";
import ICSManager from "./components/ICS";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

let ics_urls = fs.readFileSync("./data/ics_urls.txt", "utf8");

ICSManager.init(
  ics_urls
    .trim()
    .split("\n")
    .map((s) => s.trim())
);

polka() // You can also use Express
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware()
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
