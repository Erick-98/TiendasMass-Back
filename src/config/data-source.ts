import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const isCompiled = __dirname.includes("dist");

export const AppDataSource = new DataSource({
  type: "mysql",
  host:  "trolley.proxy.rlwy.net",
  port:  27302,
  username:  "root",
  password:  "MWGSSmACPRSBZJsJaRsSdwTRoZBjLkgh",
  database:  "tiendasmass",
  synchronize: true,
  logging: true,
  entities: [isCompiled ? "dist/entities/**/*.js" : "src/entities/**/*.ts"],
});