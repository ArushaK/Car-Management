export interface Manufacturer {
  name: string;
  logo: string;
}

export interface Driver {
  id: string;
  name: string;
  profile_url: string;
  number: number;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  manufacturer: Manufacturer;
  drivers: Driver[];
}

export interface TeamInfoProps {
  teamData: Team;
  driverData: Driver;
}