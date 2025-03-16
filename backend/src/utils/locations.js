// Districts and sub-districts in Bangladesh
export const districts = [
  {
    name: 'Dhaka',
    subDistricts: [
      'Dhanmondi',
      'Mohammadpur',
      'Mirpur',
      'Gulshan',
      'Banani',
      'Uttara',
      'Motijheel',
      'Khilgaon',
      'Badda',
      'Tejgaon',
      'Ramna',
      'Savar',
      'Keraniganj',
      'Nawabganj',
      'Dohar'
    ]
  },
  {
    name: 'Chattogram',
    subDistricts: [
      'Agrabad',
      'Halishahar',
      'Patenga',
      'Nasirabad',
      'Khulshi',
      'Kotwali',
      'Pahartali',
      'Bakalia',
      'Chandgaon',
      'Sitakunda',
      'Mirsharai',
      'Patiya',
      'Anwara',
      'Satkania',
      'Lohagara'
    ]
  },
  {
    name: 'Rajshahi',
    subDistricts: [
      'Boalia',
      'Motihar',
      'Rajpara',
      'Shah Makhdum',
      'Paba',
      'Godagari',
      'Tanore',
      'Bagmara',
      'Durgapur',
      'Puthia',
      'Bagha',
      'Charghat',
      'Mohanpur'
    ]
  },
  {
    name: 'Khulna',
    subDistricts: [
      'Khulna Sadar',
      'Sonadanga',
      'Khalishpur',
      'Daulatpur',
      'Khan Jahan Ali',
      'Batiaghata',
      'Dumuria',
      'Terokhada',
      'Rupsa',
      'Paikgachha',
      'Koyra',
      'Dighalia'
    ]
  },
  {
    name: 'Sylhet',
    subDistricts: [
      'Sylhet Sadar',
      'South Surma',
      'Companiganj',
      'Gowainghat',
      'Jaintiapur',
      'Kanaighat',
      'Zakiganj',
      'Beanibazar',
      'Bishwanath',
      'Balaganj',
      'Fenchuganj',
      'Golapganj'
    ]
  },
  {
    name: 'Barishal',
    subDistricts: [
      'Barishal Sadar',
      'Bakerganj',
      'Babuganj',
      'Wazirpur',
      'Banaripara',
      'Gournadi',
      'Agailjhara',
      'Mehendiganj',
      'Muladi',
      'Hizla'
    ]
  },
  {
    name: 'Rangpur',
    subDistricts: [
      'Rangpur Sadar',
      'Badarganj',
      'Kaunia',
      'Gangachara',
      'Mithapukur',
      'Taraganj',
      'Pirgachha',
      'Pirganj'
    ]
  },
  {
    name: 'Mymensingh',
    subDistricts: [
      'Mymensingh Sadar',
      'Trishal',
      'Bhaluka',
      'Muktagachha',
      'Fulbaria',
      'Gaffargaon',
      'Nandail',
      'Ishwarganj',
      'Phulpur',
      'Haluaghat',
      'Gouripur',
      'Dhobaura',
      'Tarakanda'
    ]
  }
];

// Function to get all districts
export const getDistricts = () => {
  return districts.map(district => district.name);
};

// Function to get sub-districts for a specific district
export const getSubDistricts = (districtName) => {
  const district = districts.find(d => d.name === districtName);
  return district ? district.subDistricts : [];
};

// Function to validate if a district exists
export const isValidDistrict = (districtName) => {
  
  return districts.some(d => d.name === districtName);
};

// Function to validate if a sub-district exists in a district
export const isValidSubDistrict = (districtName, subDistrictName) => {
  const district = districts.find(d => d.name === districtName);
  const isValid = district ? district.subDistricts.includes(subDistrictName) : false; 
  return isValid;
}; 