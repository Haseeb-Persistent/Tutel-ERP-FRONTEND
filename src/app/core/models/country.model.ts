export interface Country {
  countryId: number;
  countryName: string;
  countryCode?: string;
  isActive: boolean;
  createdDate: Date;
}

export interface CountryRequest {
  countryId?: number; // Optional for Create, required for Update
  countryName: string;
  countryCode?: string;
  isActive?: boolean;
  excludeId?: number; // Used for check-exists
}

