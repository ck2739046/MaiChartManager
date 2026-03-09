import {generateApi} from "swagger-typescript-api";
// @ts-ignore
import path from "node:path";

/* NOTE: all fields are optional expect one of `input`, `url`, `spec` */
generateApi({
  fileName: "apiGen.ts",
  output: path.resolve("src/client"),
  url: "http://localhost:5181/swagger/v1/swagger.json",
  templates: path.resolve("./api-templates"),
  httpClientType: "fetch", // or "fetch"
  defaultResponseType: "void",
  enumNamesAsValues: true,
})

generateApi({
  fileName: "aquaMaiVersionConfigApiGen.ts",
  output: path.resolve("src/client"),
  url: "https://aquamai-version-config.init.ink/openapi.json",
  templates: path.resolve("./api-templates"),
  httpClientType: "fetch", // or "fetch"
  defaultResponseType: "void",
  enumNamesAsValues: true,
})
