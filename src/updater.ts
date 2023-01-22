import { Client } from "@notionhq/client";
import fetch from "node-fetch";

const env = {
  NOTION_SECRET: process.env.NOTION_SECRET,
};

const client = new Client({
  auth: env.NOTION_SECRET,
});

const dbId = "0c390541-5f47-407d-9890-7e09f00f9198";

export const sync = async () => {
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
        const geckoId = _result.properties.GeckoID.rich_text[0].plain_text;
        return {
          id: _result.id,
          geckoId,
        };
      })
    );

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
    client.pages.update({
      page_id: record.id,
      properties: {
        Price: {
          number: gecko.current_price,
        },
        Marketcap: {
          number: parseInt(gecko.market_cap?.toString() || "0"),
        },
        "24Hr": {
          number: parseFloat(
            (gecko.price_change_percentage_24h / 100).toFixed(4)
          ),
        },
        "Circulating Supply": {
          number: parseInt(gecko.circulating_supply.toString()),
        },
        "Total Supply": {
          number: parseInt(gecko.total_supply?.toString() || "0"),
        },
        Name: {
          title: [
            {
              text: {
                content: gecko.name,
              },
            },
          ],
        },
      },
    });
  }
  console.log(
    "Updated:",
    records.length,
    "records! at",
    new Date().toLocaleString()
  );
};
