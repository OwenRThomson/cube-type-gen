#!/usr/bin/env node

import { Command } from "commander";
import { registerGenerateCommand } from "./commands/validate";

const program = new Command();
registerGenerateCommand(program);
program.parseAsync();
