/**
 * Comprehensive Global Airport Database
 *
 * 500+ major commercial airports across every continent.
 * Used by FlightSearch component for autocomplete.
 * Sorted alphabetically by country then city.
 */

export interface Airport {
  code: string;   // IATA 3-letter code
  city: string;   // City / airport name
  country: string;
}

export const AIRPORTS: Airport[] = [
  // ─── Afghanistan ─────────────────────────────────────────────────
  { code: "KBL", city: "Kabul", country: "Afghanistan" },

  // ─── Albania ─────────────────────────────────────────────────────
  { code: "TIA", city: "Tirana", country: "Albania" },

  // ─── Algeria ─────────────────────────────────────────────────────
  { code: "ALG", city: "Algiers", country: "Algeria" },
  { code: "ORN", city: "Oran", country: "Algeria" },

  // ─── Angola ──────────────────────────────────────────────────────
  { code: "LAD", city: "Luanda", country: "Angola" },

  // ─── Argentina ───────────────────────────────────────────────────
  { code: "EZE", city: "Buenos Aires Ezeiza", country: "Argentina" },
  { code: "AEP", city: "Buenos Aires Aeroparque", country: "Argentina" },
  { code: "COR", city: "Córdoba", country: "Argentina" },
  { code: "MDZ", city: "Mendoza", country: "Argentina" },
  { code: "BRC", city: "Bariloche", country: "Argentina" },

  // ─── Armenia ─────────────────────────────────────────────────────
  { code: "EVN", city: "Yerevan", country: "Armenia" },

  // ─── Australia ───────────────────────────────────────────────────
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "MEL", city: "Melbourne", country: "Australia" },
  { code: "BNE", city: "Brisbane", country: "Australia" },
  { code: "PER", city: "Perth", country: "Australia" },
  { code: "ADL", city: "Adelaide", country: "Australia" },
  { code: "OOL", city: "Gold Coast", country: "Australia" },
  { code: "CBR", city: "Canberra", country: "Australia" },
  { code: "CNS", city: "Cairns", country: "Australia" },
  { code: "DRW", city: "Darwin", country: "Australia" },
  { code: "HBA", city: "Hobart", country: "Australia" },

  // ─── Austria ─────────────────────────────────────────────────────
  { code: "VIE", city: "Vienna", country: "Austria" },
  { code: "SZG", city: "Salzburg", country: "Austria" },
  { code: "INN", city: "Innsbruck", country: "Austria" },

  // ─── Azerbaijan ──────────────────────────────────────────────────
  { code: "GYD", city: "Baku", country: "Azerbaijan" },

  // ─── Bahamas ─────────────────────────────────────────────────────
  { code: "NAS", city: "Nassau", country: "Bahamas" },

  // ─── Bahrain ─────────────────────────────────────────────────────
  { code: "BAH", city: "Bahrain", country: "Bahrain" },

  // ─── Bangladesh ──────────────────────────────────────────────────
  { code: "DAC", city: "Dhaka", country: "Bangladesh" },
  { code: "CGP", city: "Chittagong", country: "Bangladesh" },
  { code: "ZYL", city: "Sylhet", country: "Bangladesh" },

  // ─── Barbados ────────────────────────────────────────────────────
  { code: "BGI", city: "Bridgetown", country: "Barbados" },

  // ─── Belarus ─────────────────────────────────────────────────────
  { code: "MSQ", city: "Minsk", country: "Belarus" },

  // ─── Belgium ─────────────────────────────────────────────────────
  { code: "BRU", city: "Brussels", country: "Belgium" },
  { code: "CRL", city: "Brussels Charleroi", country: "Belgium" },

  // ─── Bermuda ─────────────────────────────────────────────────────
  { code: "BDA", city: "Bermuda", country: "Bermuda" },

  // ─── Bolivia ─────────────────────────────────────────────────────
  { code: "LPB", city: "La Paz", country: "Bolivia" },
  { code: "VVI", city: "Santa Cruz", country: "Bolivia" },

  // ─── Bosnia ──────────────────────────────────────────────────────
  { code: "SJJ", city: "Sarajevo", country: "Bosnia" },

  // ─── Botswana ────────────────────────────────────────────────────
  { code: "GBE", city: "Gaborone", country: "Botswana" },

  // ─── Brazil ──────────────────────────────────────────────────────
  { code: "GRU", city: "São Paulo Guarulhos", country: "Brazil" },
  { code: "CGH", city: "São Paulo Congonhas", country: "Brazil" },
  { code: "GIG", city: "Rio de Janeiro Galeão", country: "Brazil" },
  { code: "SDU", city: "Rio de Janeiro Santos Dumont", country: "Brazil" },
  { code: "BSB", city: "Brasília", country: "Brazil" },
  { code: "CNF", city: "Belo Horizonte", country: "Brazil" },
  { code: "SSA", city: "Salvador", country: "Brazil" },
  { code: "REC", city: "Recife", country: "Brazil" },
  { code: "FOR", city: "Fortaleza", country: "Brazil" },
  { code: "CWB", city: "Curitiba", country: "Brazil" },
  { code: "POA", city: "Porto Alegre", country: "Brazil" },
  { code: "MAO", city: "Manaus", country: "Brazil" },
  { code: "FLN", city: "Florianópolis", country: "Brazil" },

  // ─── Brunei ──────────────────────────────────────────────────────
  { code: "BWN", city: "Bandar Seri Begawan", country: "Brunei" },

  // ─── Bulgaria ────────────────────────────────────────────────────
  { code: "SOF", city: "Sofia", country: "Bulgaria" },
  { code: "VAR", city: "Varna", country: "Bulgaria" },
  { code: "BOJ", city: "Burgas", country: "Bulgaria" },

  // ─── Cambodia ────────────────────────────────────────────────────
  { code: "PNH", city: "Phnom Penh", country: "Cambodia" },
  { code: "REP", city: "Siem Reap", country: "Cambodia" },

  // ─── Cameroon ────────────────────────────────────────────────────
  { code: "DLA", city: "Douala", country: "Cameroon" },

  // ─── Canada ──────────────────────────────────────────────────────
  { code: "YYZ", city: "Toronto Pearson", country: "Canada" },
  { code: "YYC", city: "Calgary", country: "Canada" },
  { code: "YVR", city: "Vancouver", country: "Canada" },
  { code: "YUL", city: "Montréal", country: "Canada" },
  { code: "YOW", city: "Ottawa", country: "Canada" },
  { code: "YEG", city: "Edmonton", country: "Canada" },
  { code: "YWG", city: "Winnipeg", country: "Canada" },
  { code: "YHZ", city: "Halifax", country: "Canada" },
  { code: "YQB", city: "Québec City", country: "Canada" },
  { code: "YXE", city: "Saskatoon", country: "Canada" },
  { code: "YQR", city: "Regina", country: "Canada" },
  { code: "YLW", city: "Kelowna", country: "Canada" },
  { code: "YXU", city: "London", country: "Canada" },

  // ─── Chile ───────────────────────────────────────────────────────
  { code: "SCL", city: "Santiago", country: "Chile" },

  // ─── China ───────────────────────────────────────────────────────
  { code: "PEK", city: "Beijing Capital", country: "China" },
  { code: "PKX", city: "Beijing Daxing", country: "China" },
  { code: "PVG", city: "Shanghai Pudong", country: "China" },
  { code: "SHA", city: "Shanghai Hongqiao", country: "China" },
  { code: "CAN", city: "Guangzhou", country: "China" },
  { code: "SZX", city: "Shenzhen", country: "China" },
  { code: "CTU", city: "Chengdu Tianfu", country: "China" },
  { code: "CKG", city: "Chongqing", country: "China" },
  { code: "HGH", city: "Hangzhou", country: "China" },
  { code: "XIY", city: "Xi'an", country: "China" },
  { code: "KMG", city: "Kunming", country: "China" },
  { code: "WUH", city: "Wuhan", country: "China" },
  { code: "NKG", city: "Nanjing", country: "China" },
  { code: "TAO", city: "Qingdao", country: "China" },
  { code: "DLC", city: "Dalian", country: "China" },
  { code: "XMN", city: "Xiamen", country: "China" },
  { code: "HRB", city: "Harbin", country: "China" },
  { code: "TSN", city: "Tianjin", country: "China" },
  { code: "SHE", city: "Shenyang", country: "China" },
  { code: "CSX", city: "Changsha", country: "China" },
  { code: "HKG", city: "Hong Kong", country: "China" },
  { code: "MFM", city: "Macau", country: "China" },

  // ─── Colombia ────────────────────────────────────────────────────
  { code: "BOG", city: "Bogotá", country: "Colombia" },
  { code: "MDE", city: "Medellín", country: "Colombia" },
  { code: "CLO", city: "Cali", country: "Colombia" },
  { code: "CTG", city: "Cartagena", country: "Colombia" },

  // ─── Costa Rica ──────────────────────────────────────────────────
  { code: "SJO", city: "San José", country: "Costa Rica" },
  { code: "LIR", city: "Liberia", country: "Costa Rica" },

  // ─── Croatia ─────────────────────────────────────────────────────
  { code: "ZAG", city: "Zagreb", country: "Croatia" },
  { code: "DBV", city: "Dubrovnik", country: "Croatia" },
  { code: "SPU", city: "Split", country: "Croatia" },

  // ─── Cuba ────────────────────────────────────────────────────────
  { code: "HAV", city: "Havana", country: "Cuba" },
  { code: "VRA", city: "Varadero", country: "Cuba" },

  // ─── Cyprus ──────────────────────────────────────────────────────
  { code: "LCA", city: "Larnaca", country: "Cyprus" },
  { code: "PFO", city: "Paphos", country: "Cyprus" },

  // ─── Czech Republic ──────────────────────────────────────────────
  { code: "PRG", city: "Prague", country: "Czech Republic" },

  // ─── Denmark ─────────────────────────────────────────────────────
  { code: "CPH", city: "Copenhagen", country: "Denmark" },
  { code: "BLL", city: "Billund", country: "Denmark" },

  // ─── Dominican Republic ──────────────────────────────────────────
  { code: "PUJ", city: "Punta Cana", country: "Dominican Republic" },
  { code: "SDQ", city: "Santo Domingo", country: "Dominican Republic" },

  // ─── Ecuador ─────────────────────────────────────────────────────
  { code: "UIO", city: "Quito", country: "Ecuador" },
  { code: "GYE", city: "Guayaquil", country: "Ecuador" },

  // ─── Egypt ───────────────────────────────────────────────────────
  { code: "CAI", city: "Cairo", country: "Egypt" },
  { code: "HRG", city: "Hurghada", country: "Egypt" },
  { code: "SSH", city: "Sharm El Sheikh", country: "Egypt" },
  { code: "LXR", city: "Luxor", country: "Egypt" },
  { code: "HBE", city: "Alexandria", country: "Egypt" },

  // ─── Estonia ─────────────────────────────────────────────────────
  { code: "TLL", city: "Tallinn", country: "Estonia" },

  // ─── Ethiopia ────────────────────────────────────────────────────
  { code: "ADD", city: "Addis Ababa", country: "Ethiopia" },

  // ─── Fiji ────────────────────────────────────────────────────────
  { code: "NAN", city: "Nadi", country: "Fiji" },
  { code: "SUV", city: "Suva", country: "Fiji" },

  // ─── Finland ─────────────────────────────────────────────────────
  { code: "HEL", city: "Helsinki", country: "Finland" },

  // ─── France ──────────────────────────────────────────────────────
  { code: "CDG", city: "Paris Charles de Gaulle", country: "France" },
  { code: "ORY", city: "Paris Orly", country: "France" },
  { code: "NCE", city: "Nice", country: "France" },
  { code: "LYS", city: "Lyon", country: "France" },
  { code: "MRS", city: "Marseille", country: "France" },
  { code: "TLS", city: "Toulouse", country: "France" },
  { code: "BOD", city: "Bordeaux", country: "France" },
  { code: "NTE", city: "Nantes", country: "France" },
  { code: "SXB", city: "Strasbourg", country: "France" },

  // ─── Georgia ─────────────────────────────────────────────────────
  { code: "TBS", city: "Tbilisi", country: "Georgia" },
  { code: "BUS", city: "Batumi", country: "Georgia" },

  // ─── Germany ─────────────────────────────────────────────────────
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "MUC", city: "Munich", country: "Germany" },
  { code: "BER", city: "Berlin Brandenburg", country: "Germany" },
  { code: "DUS", city: "Düsseldorf", country: "Germany" },
  { code: "HAM", city: "Hamburg", country: "Germany" },
  { code: "STR", city: "Stuttgart", country: "Germany" },
  { code: "CGN", city: "Cologne/Bonn", country: "Germany" },
  { code: "HAJ", city: "Hanover", country: "Germany" },
  { code: "NUE", city: "Nuremberg", country: "Germany" },
  { code: "LEJ", city: "Leipzig", country: "Germany" },
  { code: "DTM", city: "Dortmund", country: "Germany" },

  // ─── Ghana ───────────────────────────────────────────────────────
  { code: "ACC", city: "Accra", country: "Ghana" },

  // ─── Greece ──────────────────────────────────────────────────────
  { code: "ATH", city: "Athens", country: "Greece" },
  { code: "SKG", city: "Thessaloniki", country: "Greece" },
  { code: "HER", city: "Heraklion (Crete)", country: "Greece" },
  { code: "CHQ", city: "Chania (Crete)", country: "Greece" },
  { code: "RHO", city: "Rhodes", country: "Greece" },
  { code: "CFU", city: "Corfu", country: "Greece" },
  { code: "JTR", city: "Santorini", country: "Greece" },
  { code: "JMK", city: "Mykonos", country: "Greece" },
  { code: "KGS", city: "Kos", country: "Greece" },
  { code: "ZTH", city: "Zakynthos", country: "Greece" },

  // ─── Guatemala ───────────────────────────────────────────────────
  { code: "GUA", city: "Guatemala City", country: "Guatemala" },

  // ─── Hungary ─────────────────────────────────────────────────────
  { code: "BUD", city: "Budapest", country: "Hungary" },

  // ─── Iceland ─────────────────────────────────────────────────────
  { code: "KEF", city: "Reykjavik Keflavik", country: "Iceland" },

  // ─── India ───────────────────────────────────────────────────────
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "BLR", city: "Bangalore", country: "India" },
  { code: "MAA", city: "Chennai", country: "India" },
  { code: "HYD", city: "Hyderabad", country: "India" },
  { code: "CCU", city: "Kolkata", country: "India" },
  { code: "COK", city: "Kochi", country: "India" },
  { code: "AMD", city: "Ahmedabad", country: "India" },
  { code: "PNQ", city: "Pune", country: "India" },
  { code: "GOI", city: "Goa", country: "India" },
  { code: "JAI", city: "Jaipur", country: "India" },
  { code: "LKO", city: "Lucknow", country: "India" },
  { code: "IXC", city: "Chandigarh", country: "India" },
  { code: "TRV", city: "Thiruvananthapuram", country: "India" },
  { code: "GAU", city: "Guwahati", country: "India" },
  { code: "PAT", city: "Patna", country: "India" },
  { code: "BBI", city: "Bhubaneswar", country: "India" },
  { code: "SXR", city: "Srinagar", country: "India" },
  { code: "VNS", city: "Varanasi", country: "India" },
  { code: "NAG", city: "Nagpur", country: "India" },
  { code: "IXB", city: "Bagdogra", country: "India" },
  { code: "VTZ", city: "Visakhapatnam", country: "India" },
  { code: "IDR", city: "Indore", country: "India" },
  { code: "RPR", city: "Raipur", country: "India" },
  { code: "IXR", city: "Ranchi", country: "India" },
  { code: "UDR", city: "Udaipur", country: "India" },
  { code: "BDQ", city: "Vadodara", country: "India" },
  { code: "ATQ", city: "Amritsar", country: "India" },
  { code: "CCJ", city: "Calicut / Kozhikode", country: "India" },
  { code: "IXE", city: "Mangalore", country: "India" },
  { code: "IMF", city: "Imphal", country: "India" },
  { code: "DIB", city: "Dibrugarh", country: "India" },
  { code: "DED", city: "Dehradun", country: "India" },
  { code: "IXJ", city: "Jammu", country: "India" },
  { code: "JLR", city: "Jabalpur", country: "India" },
  { code: "STV", city: "Surat", country: "India" },
  { code: "RAJ", city: "Rajkot", country: "India" },
  { code: "DHM", city: "Dharamshala / Kangra", country: "India" },
  { code: "KUU", city: "Kullu / Manali", country: "India" },
  { code: "IXA", city: "Agartala", country: "India" },
  { code: "AYJ", city: "Ayodhya", country: "India" },
  { code: "TIR", city: "Tirupati", country: "India" },
  { code: "IXM", city: "Madurai", country: "India" },
  { code: "CJB", city: "Coimbatore", country: "India" },

  // ─── Indonesia ───────────────────────────────────────────────────
  { code: "CGK", city: "Jakarta", country: "Indonesia" },
  { code: "DPS", city: "Bali Denpasar", country: "Indonesia" },
  { code: "SUB", city: "Surabaya", country: "Indonesia" },
  { code: "UPG", city: "Makassar", country: "Indonesia" },
  { code: "KNO", city: "Medan", country: "Indonesia" },
  { code: "JOG", city: "Yogyakarta", country: "Indonesia" },
  { code: "PDG", city: "Padang", country: "Indonesia" },
  { code: "BPN", city: "Balikpapan", country: "Indonesia" },

  // ─── Iran ────────────────────────────────────────────────────────
  { code: "IKA", city: "Tehran Imam Khomeini", country: "Iran" },
  { code: "THR", city: "Tehran Mehrabad", country: "Iran" },
  { code: "SYZ", city: "Shiraz", country: "Iran" },
  { code: "MHD", city: "Mashhad", country: "Iran" },

  // ─── Iraq ────────────────────────────────────────────────────────
  { code: "BGW", city: "Baghdad", country: "Iraq" },
  { code: "EBL", city: "Erbil", country: "Iraq" },

  // ─── Ireland ─────────────────────────────────────────────────────
  { code: "DUB", city: "Dublin", country: "Ireland" },
  { code: "SNN", city: "Shannon", country: "Ireland" },
  { code: "ORK", city: "Cork", country: "Ireland" },

  // ─── Israel ──────────────────────────────────────────────────────
  { code: "TLV", city: "Tel Aviv", country: "Israel" },

  // ─── Italy ───────────────────────────────────────────────────────
  { code: "FCO", city: "Rome Fiumicino", country: "Italy" },
  { code: "MXP", city: "Milan Malpensa", country: "Italy" },
  { code: "LIN", city: "Milan Linate", country: "Italy" },
  { code: "VCE", city: "Venice", country: "Italy" },
  { code: "NAP", city: "Naples", country: "Italy" },
  { code: "FLR", city: "Florence", country: "Italy" },
  { code: "BGY", city: "Bergamo / Milan", country: "Italy" },
  { code: "BLQ", city: "Bologna", country: "Italy" },
  { code: "CTA", city: "Catania (Sicily)", country: "Italy" },
  { code: "PMO", city: "Palermo (Sicily)", country: "Italy" },
  { code: "PSA", city: "Pisa", country: "Italy" },
  { code: "TRN", city: "Turin", country: "Italy" },
  { code: "BRI", city: "Bari", country: "Italy" },
  { code: "CAG", city: "Cagliari (Sardinia)", country: "Italy" },
  { code: "OLB", city: "Olbia (Sardinia)", country: "Italy" },

  // ─── Jamaica ─────────────────────────────────────────────────────
  { code: "MBJ", city: "Montego Bay", country: "Jamaica" },
  { code: "KIN", city: "Kingston", country: "Jamaica" },

  // ─── Japan ───────────────────────────────────────────────────────
  { code: "HND", city: "Tokyo Haneda", country: "Japan" },
  { code: "NRT", city: "Tokyo Narita", country: "Japan" },
  { code: "KIX", city: "Osaka Kansai", country: "Japan" },
  { code: "ITM", city: "Osaka Itami", country: "Japan" },
  { code: "NGO", city: "Nagoya Chubu", country: "Japan" },
  { code: "FUK", city: "Fukuoka", country: "Japan" },
  { code: "CTS", city: "Sapporo New Chitose", country: "Japan" },
  { code: "OKA", city: "Okinawa Naha", country: "Japan" },
  { code: "KOJ", city: "Kagoshima", country: "Japan" },
  { code: "HIJ", city: "Hiroshima", country: "Japan" },

  // ─── Jordan ──────────────────────────────────────────────────────
  { code: "AMM", city: "Amman", country: "Jordan" },
  { code: "AQJ", city: "Aqaba", country: "Jordan" },

  // ─── Kazakhstan ──────────────────────────────────────────────────
  { code: "ALA", city: "Almaty", country: "Kazakhstan" },
  { code: "NQZ", city: "Astana", country: "Kazakhstan" },

  // ─── Kenya ───────────────────────────────────────────────────────
  { code: "NBO", city: "Nairobi", country: "Kenya" },
  { code: "MBA", city: "Mombasa", country: "Kenya" },

  // ─── Kuwait ──────────────────────────────────────────────────────
  { code: "KWI", city: "Kuwait City", country: "Kuwait" },

  // ─── Kyrgyzstan ──────────────────────────────────────────────────
  { code: "FRU", city: "Bishkek", country: "Kyrgyzstan" },

  // ─── Laos ────────────────────────────────────────────────────────
  { code: "VTE", city: "Vientiane", country: "Laos" },
  { code: "LPQ", city: "Luang Prabang", country: "Laos" },

  // ─── Latvia ──────────────────────────────────────────────────────
  { code: "RIX", city: "Riga", country: "Latvia" },

  // ─── Lebanon ─────────────────────────────────────────────────────
  { code: "BEY", city: "Beirut", country: "Lebanon" },

  // ─── Libya ───────────────────────────────────────────────────────
  { code: "TIP", city: "Tripoli", country: "Libya" },

  // ─── Lithuania ───────────────────────────────────────────────────
  { code: "VNO", city: "Vilnius", country: "Lithuania" },
  { code: "KUN", city: "Kaunas", country: "Lithuania" },

  // ─── Luxembourg ──────────────────────────────────────────────────
  { code: "LUX", city: "Luxembourg", country: "Luxembourg" },

  // ─── Madagascar ──────────────────────────────────────────────────
  { code: "TNR", city: "Antananarivo", country: "Madagascar" },

  // ─── Malaysia ────────────────────────────────────────────────────
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "PEN", city: "Penang", country: "Malaysia" },
  { code: "LGK", city: "Langkawi", country: "Malaysia" },
  { code: "BKI", city: "Kota Kinabalu", country: "Malaysia" },
  { code: "KCH", city: "Kuching", country: "Malaysia" },
  { code: "JHB", city: "Johor Bahru", country: "Malaysia" },

  // ─── Maldives ────────────────────────────────────────────────────
  { code: "MLE", city: "Malé", country: "Maldives" },

  // ─── Malta ───────────────────────────────────────────────────────
  { code: "MLA", city: "Malta", country: "Malta" },

  // ─── Mauritius ───────────────────────────────────────────────────
  { code: "MRU", city: "Mauritius", country: "Mauritius" },

  // ─── Mexico ──────────────────────────────────────────────────────
  { code: "MEX", city: "Mexico City", country: "Mexico" },
  { code: "CUN", city: "Cancún", country: "Mexico" },
  { code: "GDL", city: "Guadalajara", country: "Mexico" },
  { code: "MTY", city: "Monterrey", country: "Mexico" },
  { code: "TIJ", city: "Tijuana", country: "Mexico" },
  { code: "SJD", city: "San José del Cabo", country: "Mexico" },
  { code: "PVR", city: "Puerto Vallarta", country: "Mexico" },
  { code: "MID", city: "Mérida", country: "Mexico" },

  // ─── Moldova ─────────────────────────────────────────────────────
  { code: "KIV", city: "Chișinău", country: "Moldova" },

  // ─── Mongolia ────────────────────────────────────────────────────
  { code: "UBN", city: "Ulaanbaatar", country: "Mongolia" },

  // ─── Montenegro ──────────────────────────────────────────────────
  { code: "TGD", city: "Podgorica", country: "Montenegro" },
  { code: "TIV", city: "Tivat", country: "Montenegro" },

  // ─── Morocco ─────────────────────────────────────────────────────
  { code: "CMN", city: "Casablanca", country: "Morocco" },
  { code: "RAK", city: "Marrakech", country: "Morocco" },
  { code: "FEZ", city: "Fez", country: "Morocco" },
  { code: "TNG", city: "Tangier", country: "Morocco" },
  { code: "AGA", city: "Agadir", country: "Morocco" },

  // ─── Mozambique ──────────────────────────────────────────────────
  { code: "MPM", city: "Maputo", country: "Mozambique" },

  // ─── Myanmar ─────────────────────────────────────────────────────
  { code: "RGN", city: "Yangon", country: "Myanmar" },
  { code: "MDL", city: "Mandalay", country: "Myanmar" },

  // ─── Namibia ─────────────────────────────────────────────────────
  { code: "WDH", city: "Windhoek", country: "Namibia" },

  // ─── Nepal ───────────────────────────────────────────────────────
  { code: "KTM", city: "Kathmandu", country: "Nepal" },

  // ─── Netherlands ─────────────────────────────────────────────────
  { code: "AMS", city: "Amsterdam Schiphol", country: "Netherlands" },
  { code: "EIN", city: "Eindhoven", country: "Netherlands" },
  { code: "RTM", city: "Rotterdam", country: "Netherlands" },

  // ─── New Zealand ─────────────────────────────────────────────────
  { code: "AKL", city: "Auckland", country: "New Zealand" },
  { code: "WLG", city: "Wellington", country: "New Zealand" },
  { code: "CHC", city: "Christchurch", country: "New Zealand" },
  { code: "ZQN", city: "Queenstown", country: "New Zealand" },

  // ─── Nigeria ─────────────────────────────────────────────────────
  { code: "LOS", city: "Lagos", country: "Nigeria" },
  { code: "ABV", city: "Abuja", country: "Nigeria" },
  { code: "PHC", city: "Port Harcourt", country: "Nigeria" },

  // ─── North Macedonia ─────────────────────────────────────────────
  { code: "SKP", city: "Skopje", country: "North Macedonia" },

  // ─── Norway ──────────────────────────────────────────────────────
  { code: "OSL", city: "Oslo", country: "Norway" },
  { code: "BGO", city: "Bergen", country: "Norway" },
  { code: "TRD", city: "Trondheim", country: "Norway" },
  { code: "SVG", city: "Stavanger", country: "Norway" },
  { code: "TOS", city: "Tromsø", country: "Norway" },

  // ─── Oman ────────────────────────────────────────────────────────
  { code: "MCT", city: "Muscat", country: "Oman" },
  { code: "SLL", city: "Salalah", country: "Oman" },

  // ─── Pakistan ────────────────────────────────────────────────────
  { code: "ISB", city: "Islamabad", country: "Pakistan" },
  { code: "KHI", city: "Karachi", country: "Pakistan" },
  { code: "LHE", city: "Lahore", country: "Pakistan" },
  { code: "PEW", city: "Peshawar", country: "Pakistan" },
  { code: "MUX", city: "Multan", country: "Pakistan" },
  { code: "SKT", city: "Sialkot", country: "Pakistan" },
  { code: "UET", city: "Quetta", country: "Pakistan" },
  { code: "FSD", city: "Faisalabad", country: "Pakistan" },

  // ─── Panama ──────────────────────────────────────────────────────
  { code: "PTY", city: "Panama City", country: "Panama" },

  // ─── Paraguay ────────────────────────────────────────────────────
  { code: "ASU", city: "Asunción", country: "Paraguay" },

  // ─── Peru ────────────────────────────────────────────────────────
  { code: "LIM", city: "Lima", country: "Peru" },
  { code: "CUZ", city: "Cusco", country: "Peru" },

  // ─── Philippines ─────────────────────────────────────────────────
  { code: "MNL", city: "Manila", country: "Philippines" },
  { code: "CEB", city: "Cebu", country: "Philippines" },
  { code: "DVO", city: "Davao", country: "Philippines" },
  { code: "CRK", city: "Clark", country: "Philippines" },
  { code: "ILO", city: "Iloilo", country: "Philippines" },
  { code: "KLO", city: "Kalibo (Boracay)", country: "Philippines" },

  // ─── Poland ──────────────────────────────────────────────────────
  { code: "WAW", city: "Warsaw Chopin", country: "Poland" },
  { code: "WMI", city: "Warsaw Modlin", country: "Poland" },
  { code: "KRK", city: "Kraków", country: "Poland" },
  { code: "GDN", city: "Gdańsk", country: "Poland" },
  { code: "WRO", city: "Wrocław", country: "Poland" },
  { code: "KTW", city: "Katowice", country: "Poland" },
  { code: "POZ", city: "Poznań", country: "Poland" },

  // ─── Portugal ────────────────────────────────────────────────────
  { code: "LIS", city: "Lisbon", country: "Portugal" },
  { code: "OPO", city: "Porto", country: "Portugal" },
  { code: "FAO", city: "Faro (Algarve)", country: "Portugal" },
  { code: "FNC", city: "Funchal (Madeira)", country: "Portugal" },
  { code: "PDL", city: "Ponta Delgada (Azores)", country: "Portugal" },

  // ─── Qatar ───────────────────────────────────────────────────────
  { code: "DOH", city: "Doha Hamad", country: "Qatar" },

  // ─── Romania ─────────────────────────────────────────────────────
  { code: "OTP", city: "Bucharest", country: "Romania" },
  { code: "CLJ", city: "Cluj-Napoca", country: "Romania" },
  { code: "TSR", city: "Timișoara", country: "Romania" },
  { code: "IAS", city: "Iași", country: "Romania" },

  // ─── Russia ──────────────────────────────────────────────────────
  { code: "SVO", city: "Moscow Sheremetyevo", country: "Russia" },
  { code: "DME", city: "Moscow Domodedovo", country: "Russia" },
  { code: "VKO", city: "Moscow Vnukovo", country: "Russia" },
  { code: "LED", city: "St. Petersburg", country: "Russia" },
  { code: "KZN", city: "Kazan", country: "Russia" },
  { code: "SVX", city: "Yekaterinburg", country: "Russia" },
  { code: "OVB", city: "Novosibirsk", country: "Russia" },
  { code: "KRR", city: "Krasnodar", country: "Russia" },
  { code: "AER", city: "Sochi", country: "Russia" },
  { code: "ROV", city: "Rostov-on-Don", country: "Russia" },

  // ─── Rwanda ──────────────────────────────────────────────────────
  { code: "KGL", city: "Kigali", country: "Rwanda" },

  // ─── Saudi Arabia ────────────────────────────────────────────────
  { code: "JED", city: "Jeddah", country: "Saudi Arabia" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia" },
  { code: "DMM", city: "Dammam", country: "Saudi Arabia" },
  { code: "MED", city: "Medina", country: "Saudi Arabia" },
  { code: "AHB", city: "Abha", country: "Saudi Arabia" },

  // ─── Senegal ─────────────────────────────────────────────────────
  { code: "DSS", city: "Dakar", country: "Senegal" },

  // ─── Serbia ──────────────────────────────────────────────────────
  { code: "BEG", city: "Belgrade", country: "Serbia" },

  // ─── Seychelles ──────────────────────────────────────────────────
  { code: "SEZ", city: "Mahé", country: "Seychelles" },

  // ─── Singapore ───────────────────────────────────────────────────
  { code: "SIN", city: "Singapore Changi", country: "Singapore" },

  // ─── Slovakia ────────────────────────────────────────────────────
  { code: "BTS", city: "Bratislava", country: "Slovakia" },

  // ─── Slovenia ────────────────────────────────────────────────────
  { code: "LJU", city: "Ljubljana", country: "Slovenia" },

  // ─── South Africa ────────────────────────────────────────────────
  { code: "JNB", city: "Johannesburg", country: "South Africa" },
  { code: "CPT", city: "Cape Town", country: "South Africa" },
  { code: "DUR", city: "Durban", country: "South Africa" },

  // ─── South Korea ─────────────────────────────────────────────────
  { code: "ICN", city: "Seoul Incheon", country: "South Korea" },
  { code: "GMP", city: "Seoul Gimpo", country: "South Korea" },
  { code: "PUS", city: "Busan", country: "South Korea" },
  { code: "CJU", city: "Jeju", country: "South Korea" },

  // ─── Spain ───────────────────────────────────────────────────────
  { code: "MAD", city: "Madrid", country: "Spain" },
  { code: "BCN", city: "Barcelona", country: "Spain" },
  { code: "PMI", city: "Palma de Mallorca", country: "Spain" },
  { code: "AGP", city: "Málaga", country: "Spain" },
  { code: "ALC", city: "Alicante", country: "Spain" },
  { code: "TFS", city: "Tenerife South", country: "Spain" },
  { code: "LPA", city: "Gran Canaria", country: "Spain" },
  { code: "IBZ", city: "Ibiza", country: "Spain" },
  { code: "VLC", city: "Valencia", country: "Spain" },
  { code: "SVQ", city: "Seville", country: "Spain" },
  { code: "BIO", city: "Bilbao", country: "Spain" },
  { code: "ACE", city: "Lanzarote", country: "Spain" },
  { code: "FUE", city: "Fuerteventura", country: "Spain" },

  // ─── Sri Lanka ───────────────────────────────────────────────────
  { code: "CMB", city: "Colombo", country: "Sri Lanka" },

  // ─── Sudan ───────────────────────────────────────────────────────
  { code: "KRT", city: "Khartoum", country: "Sudan" },

  // ─── Sweden ──────────────────────────────────────────────────────
  { code: "ARN", city: "Stockholm Arlanda", country: "Sweden" },
  { code: "GOT", city: "Gothenburg", country: "Sweden" },
  { code: "MMX", city: "Malmö", country: "Sweden" },

  // ─── Switzerland ─────────────────────────────────────────────────
  { code: "ZRH", city: "Zurich", country: "Switzerland" },
  { code: "GVA", city: "Geneva", country: "Switzerland" },
  { code: "BSL", city: "Basel", country: "Switzerland" },

  // ─── Taiwan ──────────────────────────────────────────────────────
  { code: "TPE", city: "Taipei Taoyuan", country: "Taiwan" },
  { code: "TSA", city: "Taipei Songshan", country: "Taiwan" },
  { code: "KHH", city: "Kaohsiung", country: "Taiwan" },

  // ─── Tanzania ────────────────────────────────────────────────────
  { code: "DAR", city: "Dar es Salaam", country: "Tanzania" },
  { code: "JRO", city: "Kilimanjaro", country: "Tanzania" },
  { code: "ZNZ", city: "Zanzibar", country: "Tanzania" },

  // ─── Thailand ────────────────────────────────────────────────────
  { code: "BKK", city: "Bangkok Suvarnabhumi", country: "Thailand" },
  { code: "DMK", city: "Bangkok Don Mueang", country: "Thailand" },
  { code: "HKT", city: "Phuket", country: "Thailand" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand" },
  { code: "USM", city: "Koh Samui", country: "Thailand" },
  { code: "KBV", city: "Krabi", country: "Thailand" },
  { code: "HDY", city: "Hat Yai", country: "Thailand" },

  // ─── Trinidad and Tobago ─────────────────────────────────────────
  { code: "POS", city: "Port of Spain", country: "Trinidad and Tobago" },

  // ─── Tunisia ─────────────────────────────────────────────────────
  { code: "TUN", city: "Tunis", country: "Tunisia" },

  // ─── Turkey ──────────────────────────────────────────────────────
  { code: "IST", city: "Istanbul", country: "Turkey" },
  { code: "SAW", city: "Istanbul Sabiha Gökçen", country: "Turkey" },
  { code: "ESB", city: "Ankara", country: "Turkey" },
  { code: "AYT", city: "Antalya", country: "Turkey" },
  { code: "ADB", city: "Izmir", country: "Turkey" },
  { code: "DLM", city: "Dalaman", country: "Turkey" },
  { code: "BJV", city: "Bodrum", country: "Turkey" },
  { code: "TZX", city: "Trabzon", country: "Turkey" },
  { code: "GZT", city: "Gaziantep", country: "Turkey" },

  // ─── Uganda ──────────────────────────────────────────────────────
  { code: "EBB", city: "Entebbe / Kampala", country: "Uganda" },

  // ─── UAE ─────────────────────────────────────────────────────────
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "AUH", city: "Abu Dhabi", country: "UAE" },
  { code: "SHJ", city: "Sharjah", country: "UAE" },

  // ─── UK ──────────────────────────────────────────────────────────
  { code: "LHR", city: "London Heathrow", country: "UK" },
  { code: "LGW", city: "London Gatwick", country: "UK" },
  { code: "STN", city: "London Stansted", country: "UK" },
  { code: "LTN", city: "London Luton", country: "UK" },
  { code: "LCY", city: "London City", country: "UK" },
  { code: "MAN", city: "Manchester", country: "UK" },
  { code: "BHX", city: "Birmingham", country: "UK" },
  { code: "EDI", city: "Edinburgh", country: "UK" },
  { code: "GLA", city: "Glasgow", country: "UK" },
  { code: "BRS", city: "Bristol", country: "UK" },
  { code: "LPL", city: "Liverpool", country: "UK" },
  { code: "NCL", city: "Newcastle", country: "UK" },
  { code: "EMA", city: "East Midlands", country: "UK" },
  { code: "BFS", city: "Belfast", country: "UK" },
  { code: "ABZ", city: "Aberdeen", country: "UK" },
  { code: "CWL", city: "Cardiff", country: "UK" },
  { code: "LBA", city: "Leeds Bradford", country: "UK" },
  { code: "SOU", city: "Southampton", country: "UK" },

  // ─── Ukraine ─────────────────────────────────────────────────────
  { code: "KBP", city: "Kyiv Boryspil", country: "Ukraine" },
  { code: "LWO", city: "Lviv", country: "Ukraine" },

  // ─── United States ───────────────────────────────────────────────
  { code: "JFK", city: "New York JFK", country: "US" },
  { code: "EWR", city: "Newark Liberty", country: "US" },
  { code: "LGA", city: "New York LaGuardia", country: "US" },
  { code: "LAX", city: "Los Angeles", country: "US" },
  { code: "SFO", city: "San Francisco", country: "US" },
  { code: "ORD", city: "Chicago O'Hare", country: "US" },
  { code: "MDW", city: "Chicago Midway", country: "US" },
  { code: "ATL", city: "Atlanta", country: "US" },
  { code: "DFW", city: "Dallas/Fort Worth", country: "US" },
  { code: "DEN", city: "Denver", country: "US" },
  { code: "SEA", city: "Seattle-Tacoma", country: "US" },
  { code: "MIA", city: "Miami", country: "US" },
  { code: "FLL", city: "Fort Lauderdale", country: "US" },
  { code: "MCO", city: "Orlando", country: "US" },
  { code: "TPA", city: "Tampa", country: "US" },
  { code: "BOS", city: "Boston", country: "US" },
  { code: "PHL", city: "Philadelphia", country: "US" },
  { code: "IAD", city: "Washington Dulles", country: "US" },
  { code: "DCA", city: "Washington Reagan", country: "US" },
  { code: "BWI", city: "Baltimore/Washington", country: "US" },
  { code: "MSP", city: "Minneapolis/St. Paul", country: "US" },
  { code: "DTW", city: "Detroit", country: "US" },
  { code: "CLT", city: "Charlotte", country: "US" },
  { code: "PHX", city: "Phoenix", country: "US" },
  { code: "LAS", city: "Las Vegas", country: "US" },
  { code: "IAH", city: "Houston Intercontinental", country: "US" },
  { code: "HOU", city: "Houston Hobby", country: "US" },
  { code: "SAN", city: "San Diego", country: "US" },
  { code: "SJC", city: "San José", country: "US" },
  { code: "OAK", city: "Oakland", country: "US" },
  { code: "PDX", city: "Portland", country: "US" },
  { code: "SLC", city: "Salt Lake City", country: "US" },
  { code: "AUS", city: "Austin", country: "US" },
  { code: "SAT", city: "San Antonio", country: "US" },
  { code: "RDU", city: "Raleigh-Durham", country: "US" },
  { code: "BNA", city: "Nashville", country: "US" },
  { code: "MCI", city: "Kansas City", country: "US" },
  { code: "STL", city: "St. Louis", country: "US" },
  { code: "IND", city: "Indianapolis", country: "US" },
  { code: "CMH", city: "Columbus", country: "US" },
  { code: "CLE", city: "Cleveland", country: "US" },
  { code: "PIT", city: "Pittsburgh", country: "US" },
  { code: "MSY", city: "New Orleans", country: "US" },
  { code: "SMF", city: "Sacramento", country: "US" },
  { code: "JAX", city: "Jacksonville", country: "US" },
  { code: "MKE", city: "Milwaukee", country: "US" },
  { code: "RSW", city: "Fort Myers", country: "US" },
  { code: "ONT", city: "Ontario (California)", country: "US" },
  { code: "BUR", city: "Burbank", country: "US" },
  { code: "HNL", city: "Honolulu", country: "US" },
  { code: "OGG", city: "Maui Kahului", country: "US" },
  { code: "KOA", city: "Kona", country: "US" },
  { code: "LIH", city: "Lihue (Kauai)", country: "US" },
  { code: "ANC", city: "Anchorage", country: "US" },
  { code: "ABQ", city: "Albuquerque", country: "US" },
  { code: "OKC", city: "Oklahoma City", country: "US" },
  { code: "TUS", city: "Tucson", country: "US" },
  { code: "ELP", city: "El Paso", country: "US" },
  { code: "MEM", city: "Memphis", country: "US" },
  { code: "RNO", city: "Reno", country: "US" },
  { code: "BDL", city: "Hartford", country: "US" },
  { code: "RIC", city: "Richmond", country: "US" },
  { code: "ORF", city: "Norfolk", country: "US" },
  { code: "BUF", city: "Buffalo", country: "US" },
  { code: "SYR", city: "Syracuse", country: "US" },
  { code: "PBI", city: "West Palm Beach", country: "US" },
  { code: "DSM", city: "Des Moines", country: "US" },
  { code: "CHS", city: "Charleston", country: "US" },
  { code: "SAV", city: "Savannah", country: "US" },
  { code: "BOI", city: "Boise", country: "US" },

  // ─── Uruguay ─────────────────────────────────────────────────────
  { code: "MVD", city: "Montevideo", country: "Uruguay" },

  // ─── Uzbekistan ──────────────────────────────────────────────────
  { code: "TAS", city: "Tashkent", country: "Uzbekistan" },

  // ─── Venezuela ───────────────────────────────────────────────────
  { code: "CCS", city: "Caracas", country: "Venezuela" },

  // ─── Vietnam ─────────────────────────────────────────────────────
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "HAN", city: "Hanoi", country: "Vietnam" },
  { code: "DAD", city: "Da Nang", country: "Vietnam" },
  { code: "CXR", city: "Nha Trang", country: "Vietnam" },
  { code: "PQC", city: "Phu Quoc", country: "Vietnam" },

  // ─── Zambia ──────────────────────────────────────────────────────
  { code: "LUN", city: "Lusaka", country: "Zambia" },

  // ─── Zimbabwe ────────────────────────────────────────────────────
  { code: "HRE", city: "Harare", country: "Zimbabwe" },
  { code: "VFA", city: "Victoria Falls", country: "Zimbabwe" },
];
