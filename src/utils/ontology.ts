// utils/ontology.ts
export const connectToONTO = async (): Promise<string> => {
  if (typeof window.onto === "undefined") {
    throw new Error("ONTO Wallet not detected");
  }

  return new Promise<string>((resolve, reject) => {
    if (typeof window.onto === "undefined") {
      reject(new Error("ONTO Wallet not detected"));
      return;
    }
    window.onto
      .request({ method: "ont_getAccount" })
      .then((res: unknown) => {
        if (
          typeof res === "object" &&
          res !== null &&
          "address" in res &&
          typeof (res as { address: unknown }).address === "string"
        ) {
          resolve((res as { address: string }).address);
        } else {
          reject(new Error("Invalid response from ONTO Wallet"));
        }
      })
      .catch(reject);
  });
};

export const fetchBalance = async (addr: string): Promise<unknown> => {
  const res = await fetch(
    `https://explorer.ont.io/v2/addresses/${addr}/balance`
  );
  if (!res.ok) throw new Error("Failed to fetch balance");
  return res.json();
};

export const fetchTransactions = async (addr: string): Promise<unknown> => {
  const res = await fetch(
    `https://explorer.ont.io/v2/addresses/${addr}/transactions`
  );
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};
