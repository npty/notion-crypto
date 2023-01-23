import { retry } from "../utils";

describe("test notion_crypto", function () {
  it("test notion-crypto.retry", function (done) {
    let attempts = 0;
    let maxRetry = 3;
    retry(
      1000,
      async () => {
        attempts++;
        if (attempts < maxRetry) {
          throw new Error("Error");
        } else {
          return "done";
        }
      },
      maxRetry
    ).then((result: any) => {
      expect(result).toBe("done");
      done();
    });
  });
});
