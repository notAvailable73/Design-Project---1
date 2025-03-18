// Structure: { district: [subDistricts] }
export const bangladeshData = {
  "Dhaka": [
    "Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Tejgaon", 
    "Gulshan", "Mohammadpur", "Mirpur", "Uttara", "Banani", "Khilgaon"
  ],
  "Faridpur": [
    "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", 
    "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"
  ],
  "Gazipur": [
    "Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"
  ],
  "Gopalganj": [
    "Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"
  ],
  "Kishoreganj": [
    "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", 
    "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia"
  ],
  "Madaripur": [
    "Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"
  ],
  "Manikganj": [
    "Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", 
    "Shivalaya", "Singair"
  ],
  "Munshiganj": [
    "Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"
  ],
  "Narayanganj": [
    "Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"
  ],
  "Narsingdi": [
    "Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"
  ],
  "Rajbari": [
    "Baliakandi", "Goalandaghat", "Kalukhali", "Pangsha", "Rajbari Sadar"
  ],
  "Shariatpur": [
    "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira"
  ],
  "Tangail": [
    "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", 
    "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"
  ],
  "Chattogram": [
    "Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", 
    "Hathazari", "Karnaphuli", "Lohagara", "Mirsharai", "Patiya", 
    "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"
  ],
  "Khulna": [
    "Batiaghata", "Dacope", "Daulatpur", "Dighalia", "Dumuria", "Khalishpur", 
    "Khan Jahan Ali", "Khulna Sadar", "Koyra", "Paikgachha", "Phultala", "Rupsa", "Sonadanga", "Terokhada"
  ],
  "Rajshahi": [
    "Bagha", "Bagmara", "Boalia", "Charghat", "Durgapur", "Godagari", 
    "Matihar", "Mohanpur", "Paba", "Puthia", "Rajpara", "Shah Makhdum", "Tanore"
  ],
  "Sylhet": [
    "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", 
    "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", 
    "Osmani Nagar", "Sylhet Sadar", "Zakiganj"
  ],
  "Barisal": [
    "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Barishal Sadar", 
    "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"
  ],
  "Rangpur": [
    "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", 
    "Pirganj", "Rangpur Sadar", "Taraganj"
  ],
  "Mymensingh": [
    "Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon", "Gauripur", 
    "Haluaghat", "Ishwarganj", "Mymensingh Sadar", "Muktagachha", 
    "Nandail", "Phulpur", "Trishal"
  ],
  "Comilla": [
    "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", 
    "Comilla Sadar", "Daudkandi", "Debidwar", "Homna", "Laksam", 
    "Meghna", "Monohargonj", "Muradnagar", "Nangalkot", "Titas"
  ]
};

// Get all districts
export const getAllDistricts = () => Object.keys(bangladeshData).sort();

// Get sub-districts for a given district
export const getSubDistricts = (district) => {
  return district && bangladeshData[district] ? bangladeshData[district].sort() : [];
};

// Check if a district exists
export const isValidDistrict = (district) => {
  return district && bangladeshData.hasOwnProperty(district);
};

// Check if a sub-district exists in a district
export const isValidSubDistrict = (district, subDistrict) => {
  return isValidDistrict(district) && 
    subDistrict && 
    bangladeshData[district].includes(subDistrict);
}; 