// utils/ontology.ts
export const connectToONTO = async () => {
  if (typeof window.onto === "undefined") {
    throw new Error("ONTO Wallet not detected");
  }

  return new Promise<string>((resolve, reject) => {
    window.onto.account
      .getAccount()
      .then((res: any) => resolve(res.address))
      .catch(reject);
  });
};

export const fetchBalance = async (addr: string) => {
  const res = await fetch(`https://explorer.ont.io/v2/addresses/${addr}/balance`);
  if (!res.ok) throw new Error("Failed to fetch balance");
  return res.json();
};

export const fetchTransactions = async (addr: string) => {
  const res = await fetch(`https://explorer.ont.io/v2/addresses/${addr}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};
