#!/usr/bin/env python3
"""
Merge GlobalAirportDatabase.txt + OpenFlights airports.dat → src/lib/airports.ts

Source 1: GlobalAirportDatabase.txt (9,300 entries, colon-delimited)
  Format: ICAO:IATA:NAME:CITY:COUNTRY:...

Source 2: OpenFlights airports.dat (7,698 entries, CSV)
  Format: id,"name","city","country","IATA","ICAO",lat,lon,alt,tz_offset,DST,tz,type,source

Strategy: Parse both, deduplicate by IATA code (GlobalAirportDB wins for entries it has,
OpenFlights fills gaps), clean country names, output TypeScript.
"""

import csv
import os
import re

GLOBAL_DB_PATH = "/Users/geetsoni/Downloads/GlobalAirportDatabase/GlobalAirportDatabase.txt"
OPENFLIGHTS_PATH = os.path.join(os.path.dirname(__file__), "openflights_airports.dat")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "airports.ts")

# ─── Country name normalization ───────────────────────────────────────────────
# Maps raw country names from EITHER source to clean, consistent display names
COUNTRY_MAP = {
    # GlobalAirportDatabase quirks
    "ENGLAND": "United Kingdom",
    "ENGALND": "United Kingdom",
    "SCOTLAND": "United Kingdom",
    "WALES": "United Kingdom",
    "NORTH IRELAND": "United Kingdom",
    "UK": "United Kingdom",
    "USA": "United States",
    "ACORES": "Portugal",
    "MADEIRA": "Portugal",
    "CANARY ISLANDS": "Spain",
    "SPANISH NORTH AFRICA": "Spain",
    "CORSE ISL.": "France",
    "FRENCH GUYANA": "French Guiana",
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
    "FRENCH POLYNESIA": "French Polynesia",

    # OpenFlights quirks
    "Korea, South": "South Korea",
    "Korea, North": "North Korea",
    "Congo (Kinshasa)": "DR Congo",
    "Congo (Brazzaville)": "Republic of the Congo",
    "Cote d'Ivoire": "Côte d'Ivoire",
    "Burma": "Myanmar",
    "Reunion": "Réunion",
    "Virgin Islands": "U.S. Virgin Islands",
    "Turks and Caicos Islands": "Turks and Caicos",
    "Sao Tome and Principe": "São Tomé and Príncipe",
    "Palestinian Territory": "Palestine",
    "Curacao": "Curaçao",
    "Saint Barthelemy": "Saint Barthélemy",
    "Bonaire, Sint Eustatius and Saba": "Caribbean Netherlands",
}


def title_case(s: str) -> str:
    """Title-case but handle short words."""
    words = s.strip().split()
    result = []
    for i, w in enumerate(words):
        low = w.lower()
        if i > 0 and low in ("of", "the", "and", "de", "du", "da", "al", "el", "la", "le"):
            result.append(low)
        else:
            result.append(w.capitalize())
    return " ".join(result)


def clean_country(raw: str) -> str:
    """Normalize a country name."""
    raw = raw.strip()
    if raw in COUNTRY_MAP:
        return COUNTRY_MAP[raw]
    # Try uppercase version (for GlobalAirportDB which is ALL CAPS)
    if raw.upper() in COUNTRY_MAP:
        return COUNTRY_MAP[raw.upper()]
    # Already clean (OpenFlights uses proper case)
    if raw and raw[0].isupper() and not raw.isupper():
        return raw
    # ALL CAPS → title case
    if raw.isupper():
        return title_case(raw)
    return raw


def clean_name(name: str, city: str) -> str:
    """Clean an airport name, fall back to '{City} Airport' if empty/N/A."""
    name = name.strip()
    if not name or name.upper() == "N/A":
        return f"{city} Airport" if city else "Airport"
    return name


def parse_global_db():
    """Parse GlobalAirportDatabase.txt → dict keyed by IATA code."""
    airports = {}
    with open(GLOBAL_DB_PATH, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            parts = line.strip().split(":")
            if len(parts) < 5:
                continue

            iata = parts[1].strip()
            name_raw = parts[2].strip()
            city_raw = parts[3].strip()
            country_raw = parts[4].strip()

            if not iata or iata == "N/A" or len(iata) != 3:
                continue
            if iata in airports:
                continue

            city = title_case(city_raw) if city_raw else ""
            country = clean_country(country_raw)
            name = clean_name(title_case(name_raw), city)

            airports[iata] = {
                "code": iata,
                "city": city,
                "name": name,
                "country": country,
            }
    return airports


def parse_openflights():
    """Parse OpenFlights airports.dat CSV → dict keyed by IATA code."""
    airports = {}
    with open(OPENFLIGHTS_PATH, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 8:
                continue

            name_raw = row[1].strip()
            city_raw = row[2].strip()
            country_raw = row[3].strip()
            iata = row[4].strip().replace('"', '')

            if not iata or iata == "\\N" or len(iata) != 3:
                continue
            if iata in airports:
                continue

            country = clean_country(country_raw)
            name = clean_name(name_raw, city_raw)

            airports[iata] = {
                "code": iata,
                "city": city_raw,
                "name": name,
                "country": country,
            }
    return airports


def merge_airports(global_db, openflights):
    """Merge both sources. GlobalAirportDB entries take priority; OpenFlights fills gaps."""
    merged = dict(global_db)  # Start with GlobalAirportDB

    added_from_of = 0
    for iata, airport in openflights.items():
        if iata not in merged:
            merged[iata] = airport
            added_from_of += 1

    print(f"GlobalAirportDB: {len(global_db)} airports")
    print(f"OpenFlights: {len(openflights)} airports")
    print(f"New from OpenFlights: {added_from_of}")
    print(f"Merged total: {len(merged)}")

    return merged


def generate_ts(airports_dict):
    """Generate TypeScript source from merged airport data."""
    airports = sorted(airports_dict.values(), key=lambda a: (a["country"], a["city"], a["code"]))

    lines = [
        '// Auto-generated from GlobalAirportDatabase.txt + OpenFlights airports.dat',
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
        # Escape single quotes and backslashes in values
        city = a["city"].replace("\\", "\\\\").replace("'", "\\'")
        name = a["name"].replace("\\", "\\\\").replace("'", "\\'")
        country = a["country"].replace("\\", "\\\\").replace("'", "\\'")
        code = a["code"]
        lines.append(f"  {{ code: '{code}', city: '{city}', name: '{name}', country: '{country}' }},")

    lines.append('];')
    lines.append('')

    return "\n".join(lines)


def main():
    global_db = parse_global_db()
    openflights = parse_openflights()
    merged = merge_airports(global_db, openflights)

    # Stats
    countries = {}
    for a in merged.values():
        countries[a["country"]] = countries.get(a["country"], 0) + 1

    print(f"\nCountries: {len(countries)}")
    top = sorted(countries.items(), key=lambda x: -x[1])[:15]
    for c, n in top:
        print(f"  {c}: {n}")

    # Verify key airports that were previously missing
    print("\nKey airport checks:")
    for code in ["LHR", "JFK", "BER", "IST", "ICN", "KIX", "PVG", "DEL", "IXC", "DXB", "SYD", "DSA", "HND", "GMP"]:
        if code in merged:
            a = merged[code]
            print(f"  ✅ {code} = {a['city']}, {a['country']} ({a['name']})")
        else:
            print(f"  ❌ {code} MISSING!")

    ts_content = generate_ts(merged)

    out_path = os.path.abspath(OUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        f.write(ts_content)

    print(f"\nWritten to {out_path}")
    print(f"File size: {len(ts_content):,} bytes")


if __name__ == "__main__":
    main()
