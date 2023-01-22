import { Client } from "@notionhq/client";

const env = {
  NOTION_SECRET: process.env.NOTION_SECRET,
};

const client = new Client({
  auth: env.NOTION_SECRET,
});

const dbId = "0c390541-5f47-407d-9890-7e09f00f9198";

const records = await client.databases
  .query({
    database_id: dbId,
    filter: {
      and: [
        {
          property: "GeckoID",
          title: {
            is_not_empty: true,
          },
        },
      ],
    },
  })
  .then((res) =>
    res.results.map((result) => {
      const _result = result as any;
      console.log("_reulst", _result);
      const geckoId = _result.properties.GeckoID.rich_text[0].plain_text;
      return {
        id: _result.id,
        geckoId,
      };
    })
  );

const queryParams = {
  ids: records.map((record) => record.geckoId).join(","),
  vs_currencies: "usd",
  include_market_cap: true,
  include_24hr_change: true,
};
// transform query params to string
const queryString = Object.keys(queryParams)
  .map((key) => key + "=" + (queryParams as any)[key])
  .join("&");

console.log(queryString);

const results = await fetch(
  `https://api.coingecko.com/api/v3/simple/price?${queryString}`,
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
).then((res) => res.json());

console.log("records", records);
console.log("db", results);

for (const record of records) {
  const gecko = results[record.geckoId];
  client.pages.update({
    page_id: record.id,
    properties: {
      Price: {
        number: gecko.usd,
      },
      Marketcap: {
        number: gecko.usd_market_cap,
      },
      "24HrChanged": {
        number: parseFloat((gecko.usd_24h_change / 100).toFixed(4)),
      },
    },
  });
}
