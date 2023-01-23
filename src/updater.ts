import { Notion } from "./clients/Notion";
import fetch from "node-fetch";

const notion = new Notion();

export const sync = async (dbId: string) => {
  const records = await notion.queryDB(dbId);

  const queryParams = {
    ids: records.map((record) => record.geckoId).join(","),
    vs_currency: "usd",
    price_change_percentage: "24h",
  };
  // transform query params to string
  const queryString = Object.keys(queryParams)
    .map((key) => key + "=" + (queryParams as any)[key])
    .join("&");

  const results = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?${queryString}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json() as any);

  for (const record of records) {
    const gecko = results.find((result: any) => result.id === record.geckoId);
    if (!gecko) {
      console.log(record);
      continue;
    }
    notion.updateDB(record.id, gecko);
  }
  console.log(
    "Updated:",
    records.length,
    "records! at",
    new Date().toLocaleString()
  );
};
