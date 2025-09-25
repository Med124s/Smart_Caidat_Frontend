// export interface Nft {
//   id: number;
//   title: string;
//   last_bid?: number;
//   price: number;
//   creator?: string;
//   avatar?: string;
//   instant_price?: number;
//   ending_in?: string;
//   image: string;
// }

export interface Kpis {
  citizensCount: number;
  totalRequests: number;
  pendingRequests: number;
  archivedDocuments: number;
  storageUsedBytes?: number; // facultatif
}

export interface MonthlyStat {
  month: string; // ex: "2025-01" ou "Jan"
  count: number;
}

export interface ConfidentialityStat {
  public: number;
  interne: number;
  confidentiel: number;
}

export interface UserStat {
  userName: string;
  count: number;
}
