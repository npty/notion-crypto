export const retry = (
  delay: number,
  doFn: () => any,
  maxRetry = 3
): Promise<any> => {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const _retry = (attempts: number) => {
      setTimeout(async () => {
        attempts++;
        if (attempts > maxRetry) {
          reject(new Error("Max retry attempts reached"));
        } else {
          try {
            const result = await doFn();
            resolve(result);
          } catch (error) {
            _retry(attempts);
          }
        }
      }, delay);
    };
    _retry(attempts);
  });
};
