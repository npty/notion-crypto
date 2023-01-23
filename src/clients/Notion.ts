import { Client } from "@notionhq/client";
import { retry } from "../utils/index.js";

export class Notion {
  client: Client;
  private maxRetries = 3;

  constructor() {
    this.client = new Client({
      auth: process.env.NOTION_SECRET,
    });
  }

  queryDB = async (dbId: string): Promise<any[]> => {
    return retry(2000, () => this._queryDB(dbId), this.maxRetries);
  };

  updateDB = async (recordId: string, gecko: any) => {
    return retry(2000, () => this._updateDB(recordId, gecko), 3);
  };

  private _queryDB = async (dbId: string): Promise<any[]> => {
    const records = await this.client.databases
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

    return records;
  };

  private _updateDB = async (recordId: string, gecko: any) => {
    return this.client.pages.update({
      page_id: recordId,
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
  };
}
