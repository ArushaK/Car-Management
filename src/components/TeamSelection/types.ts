export interface Driver {
  id: string;
  name: string;
  profile_url: string;
  number: number
}

export interface Manufacturer {
  name: string;
  logo: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  manufacturer: Manufacturer;
  drivers: Driver[];
}

export interface TeamsData {
  teams: Team[];
  manufacturers: Manufacturer[];
  metadata: {
    total_teams: number;
    total_drivers: number;
    last_updated: string;
  };
}