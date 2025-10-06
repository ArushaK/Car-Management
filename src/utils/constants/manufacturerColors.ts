interface ColorPreset {
  id: string;
  name: string;
  hex: string;
}

interface ManufacturerPreset {
  colors: ColorPreset[];
  defaultFinish: 'glossy' | 'matte' | 'metallic' | 'satin';
}

export const manufacturerColors: Record<string, ManufacturerPreset> = {
  'Chevrolet': {
    colors: [
      { id: 'chevy-blue', name: 'Chevrolet Blue', hex: '#003E7E' },
      { id: 'chevy-red', name: 'Victory Red', hex: '#CC0000' },
      { id: 'chevy-silver', name: 'Switchblade Silver', hex: '#D1D1D1' },
      { id: 'chevy-black', name: 'Black', hex: '#000000' },
      { id: 'chevy-white', name: 'Summit White', hex: '#FFFFFF' },
    ],
    defaultFinish: 'metallic'
  },
  'Ford': {
    colors: [
      { id: 'ford-blue', name: 'Ford Performance Blue', hex: '#00407A' },
      { id: 'ford-race-red', name: 'Race Red', hex: '#D31145' },
      { id: 'ford-silver', name: 'Iconic Silver', hex: '#DCDED7' },
      { id: 'ford-black', name: 'Shadow Black', hex: '#000000' },
      { id: 'ford-white', name: 'Oxford White', hex: '#FFFFFF' },
    ],
    defaultFinish: 'metallic'
  },
  'Toyota': {
    colors: [
      { id: 'toyota-red', name: 'Toyota Racing Red', hex: '#FF0022' },
      { id: 'toyota-silver', name: 'Celestial Silver', hex: '#CCCCCC' },
      { id: 'toyota-black', name: 'Midnight Black', hex: '#000000' },
      { id: 'toyota-white', name: 'Super White', hex: '#FFFFFF' },
      { id: 'toyota-blue', name: 'Team Blue', hex: '#00539B' },
    ],
    defaultFinish: 'metallic'
  }
};