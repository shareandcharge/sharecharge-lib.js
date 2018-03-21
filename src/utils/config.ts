const stage = process.env.sc_stage || "local";

export const config = require(`../../config/${stage}.json`);

console.log("Running on stage:", config.stage);
