#!/usr/bin/env python3
"""Parse GlobalAirportDatabase.txt and generate src/lib/airports.ts"""

import os

DB_PATH = "/Users/geetsoni/Downloads/GlobalAirportDatabase/GlobalAirportDatabase.txt"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "airports.ts")

# Map raw country names from the database to clean display names
COUNTRY_MAP = {
    # UK constituent countries
    "ENGLAND": "United Kingdom",
    "ENGALND": "United Kingdom",  # typo in source
    "SCOTLAND": "United Kingdom",
    "WALES": "United Kingdom",
    "NORTH IRELAND": "United Kingdom",
    "UK": "United Kingdom",
    # USA
    "USA": "United States",
    # Territories / dependencies
    "ACORES": "Portugal",
    "MADEIRA": "Portugal",
    "CANARY ISLANDS": "Spain",
    "SPANISH NORTH AFRICA": "Spain",
    "CORSE ISL.": "France",
    "FRENCH GUYANA": "French Guiana",
    "FRENCH POLYNESIA": "French Polynesia",
    "TUAMOTU ISLANDS": "French Polynesia",
    "ANTILLES": "Netherlands Antilles",
    "LEEWARD ISLANDS": "Leeward Islands",
    "GUERNSEY ISLD.": "Guernsey",
    "SHETLAND ISLAND": "United Kingdom",
    "GUINEA BISSAU": "Guinea-Bissau",
    "IVORY COAST": "Côte d'Ivoire",
    "CAPE VERDE ISLANDS": "Cape Verde",
    "COMOROS ISLANDS": "Comoros",
    "COOK ISLANDS": "Cook Islands",
    "FALKLAND ISLANDS": "Falkland Islands",
    "FAROE ISL.": "Faroe Islands",
    "MARSHALL ISLANDS": "Marshall Islands",
    "MARIANA ISLANDS": "Northern Mariana Islands",
    "SOLOMON ISLANDS": "Solomon Islands",
    "CAYMAN ISLANDS": "Cayman Islands",
    "PHOENIX ISL.": "Kiribati",
    "GALAPAGOS I. (ECUADOR": "Ecuador",
    "VIRGIN ISL.": "U.S. Virgin Islands",
    "TURKS & CAICOS I.": "Turks and Caicos",
    "JOHNSTON ATOLL": "United States",
    "MIDWAY ISLAND": "United States",
    "PALAU ISLAND": "Palau",
    "MONTSERRAT ISLAND": "Montserrat",
    "MAYOTTE ISLAND": "Mayotte",
    "REUNION ISLAND": "Réunion",
    "TUVALU ISLAND": "Tuvalu",
    "ST. KITTS & NEVIS": "Saint Kitts and Nevis",
    "ST. LUCIA ISLAND": "Saint Lucia",
    "ST. PIERRE & MIQUELON": "Saint Pierre and Miquelon",
    "ST.VINCENT/GRENADINES": "Saint Vincent and the Grenadines",
    "WALLIS & FUTUNA": "Wallis and Futuna",
    "SAO TOME & PRINCIPE": "São Tomé and Príncipe",
    "TRINIDAD & TOBAGO": "Trinidad and Tobago",
    "UNITED ARAB EMIRATES": "United Arab Emirates",
    "CENTRAL AFRICAN REP.": "Central African Republic",
    "EQUATORIAL GUINEA": "Equatorial Guinea",
    "BOSNIA-HERCEGOVINA": "Bosnia and Herzegovina",
    "FORMER MACEDONIA": "North Macedonia",
    "CZECH REPUBLIC": "Czech Republic",
    "DOMINICAN REPUBLIC": "Dominican Republic",
    "EAST TIMOR": "Timor-Leste",
    "EL SALVADOR": "El Salvador",
    "HONG KONG": "Hong Kong",
    "NEW CALEDONIA": "New Caledonia",
    "NEW ZEALAND": "New Zealand",
    "PAPUA NEW GUINEA": "Papua New Guinea",
    "PUERTO RICO": "Puerto Rico",
    "SAUDI ARABIA": "Saudi Arabia",
    "SIERRA LEONE": "Sierra Leone",
    "SOUTH AFRICA": "South Africa",
    "SRI LANKA": "Sri Lanka",
    "BURKINA FASO": "Burkina Faso",
    "COSTA RICA": "Costa Rica",
    "VIET NAM": "Vietnam",
    "YUGOSLAVIA": "Serbia",
    "ZAIRE": "DR Congo",
    "BOPHUTHATSWANA": "South Africa",
    "LUXEMBURG": "Luxembourg",
    "SURINAM": "Suriname",
    "SWAZILAND": "Eswatini",
    "ANGUILLA ISL.": "Anguilla",
    "KOREA": "South Korea",
}


def title_case(s: str) -> str:
    """Title-case but handle short words."""
    words = s.strip().split()
    result = []
    for i, w in enumerate(words):
        low = w.lower()
        if i > 0 and low in ("of", "the", "and", "de", "du", "da", "al", "el"):
            result.append(low)
        else:
            result.append(w.capitalize())
    return " ".join(result)


def parse():
    airports = []
    seen_iata = set()

    with open(DB_PATH, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            parts = line.strip().split(":")
            if len(parts) < 5:
                continue

            icao = parts[0].strip()
            iata = parts[1].strip()
            name = parts[2].strip()
            city = parts[3].strip()
            country_raw = parts[4].strip()

            # Skip entries without valid IATA codes
            if not iata or iata == "N/A" or len(iata) != 3:
                continue

            # Skip duplicates
            if iata in seen_iata:
                continue
            seen_iata.add(iata)

            # Clean country name
            country = COUNTRY_MAP.get(country_raw, title_case(country_raw))

            # Clean city name
            city_clean = title_case(city) if city else ""

            # Clean airport name — fall back to "{City} Airport" if missing
            if not name or name.upper() == "N/A":
                name_clean = f"{city_clean} Airport"
            else:
                name_clean = title_case(name)

            airports.append({
                "code": iata,
                "city": city_clean,
                "name": name_clean,
                "country": country,
            })

    # Sort by country then city
    airports.sort(key=lambda a: (a["country"], a["city"], a["code"]))

    return airports


def generate_ts(airports):
    lines = [
        '// Auto-generated from GlobalAirportDatabase.txt',
        f'// Total: {len(airports)} airports',
        '',
        'export interface Airport {',
        '  code: string;',
        '  city: string;',
        '  name: string;',
        '  country: string;',
        '}',
        '',
        'export const AIRPORTS: Airport[] = [',
    ]

    for a in airports:
        # Escape single quotes in names
        city = a["city"].replace("'", "\\'")
        name = a["name"].replace("'", "\\'")
        country = a["country"].replace("'", "\\'")
        code = a["code"]
        lines.append(f"  {{ code: '{code}', city: '{city}', name: '{name}', country: '{country}' }},")

    lines.append('];')
    lines.append('')

    return "\n".join(lines)


def main():
    airports = parse()

    # Stats
    countries = {}
    for a in airports:
        countries[a["country"]] = countries.get(a["country"], 0) + 1

    print(f"Total airports: {len(airports)}")
    print(f"Total countries: {len(countries)}")

    # Show top 15 countries
    top = sorted(countries.items(), key=lambda x: -x[1])[:15]
    for c, n in top:
        print(f"  {c}: {n}")

    # Verify key countries
    for key in ["United States", "United Kingdom", "India", "Germany", "France", "Australia", "Canada"]:
        count = countries.get(key, 0)
        print(f"  CHECK {key}: {count}")

    ts_content = generate_ts(airports)

    out_path = os.path.abspath(OUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        f.write(ts_content)

    print(f"\nWritten to {out_path}")
    print(f"File size: {len(ts_content):,} bytes")


if __name__ == "__main__":
    main()
