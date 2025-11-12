import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const isCompiled = __dirname.includes("dist");

export const AppDataSource = new DataSource({
  type: "mysql",
  host:  "localhost",
  port:  3306,
  username:  "root",
  password:  "12345678",
  database:  "tiendasmass",
  synchronize: true,
  logging: true,
  entities: [isCompiled ? "dist/entities/**/*.js" : "src/entities/**/*.ts"],
});