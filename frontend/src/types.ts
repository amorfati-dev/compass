export type Status = 'unreviewed' | 'thesis_valid' | 'watchout' | 'thesis_broken';

export interface Thesis {
  id: number;
  ticker: string;
  name: string;
  type: string;
  thesis: string;
  kill_criterion: string;
  status: Status;
}

// handgepflegte Position aus der eigenen DB (nicht die Parqet-Holdings)
export interface DbPosition {
  id: number;
  broker: string;
  ticker: string;
  type: string;
  name: string;
  number_of_shares: number;
  entry_price: number;
  expected_dividend_per_share: number;
}

export interface HoldingPosition {
  isin: string;
  name: string;
  shares: number;
  current_value: number;
  purchase_value: number;
  dividend_net: number;
}

export interface HoldingsResponse {
  monthly_dividend_net: number;
  positions: HoldingPosition[];
}
