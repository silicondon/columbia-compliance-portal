import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRADES = [
  "Electrical", "HVAC/Mechanical", "Plumbing", "General Contracting",
  "Fire Protection/Suppression", "Safety/Security", "AV/IT/Telecom",
  "Environmental Remediation", "Signage/Print", "Cleaning",
  "Pumps/Electric Motors", "Consultant (Other)", "Architect",
  "Engineer", "Metal/Welding", "Waste Management", "Utilities",
  "Moving/Storage/Freight", "Doors/Glazing/Windows", "Estimating",
  "Paint/Plaster/Taping", "Roofing", "Concrete/Masonry",
  "Demolition", "Landscaping", "Elevator", "Real Estate/Leasing",
  "Commodities/Materials",
];

const VENDORS = [
  { name: "A OTTAVINO CORP", trade: "Environmental Remediation", union: "Union" },
  { name: "A S A R INTERNATIONAL CORP", trade: "Environmental Remediation", union: "Union" },
  { name: "A TECH ELECTRIC ENTERPRISES INC", trade: "Electrical", union: "Non-Union" },
  { name: "AA MAINTENANCE ENTERPRISE INC", trade: "Cleaning", union: "Non-Union" },
  { name: "AAA COOLERATION SERV INC", trade: "HVAC/Mechanical", union: "Non-Union" },
  { name: "ABBEY LOCKSMITHS INC", trade: "Safety/Security", union: "Non-Union" },
  { name: "ABC COMPUTER SERVICES INC", trade: "AV/IT/Telecom", union: "Non-Union" },
  { name: "ABC PW LLC", trade: "Pumps/Electric Motors", union: "Both" },
  { name: "ABC TANK REPAIR & LINING INC", trade: "HVAC/Mechanical", union: "Non-Union" },
  { name: "ACOM TECHNOLOGY GROUP INC", trade: "AV/IT/Telecom", union: "Non-Union" },
  { name: "ABLE FIRE PREVENTION CORP", trade: "Fire Protection/Suppression", union: "Both" },
  { name: "ABM INDUSTRY GROUPS LLC", trade: "Cleaning", union: "Union" },
  { name: "ABSOLUTE ELECTRICAL CONTRACTING OF", trade: "Electrical", union: "Union" },
  { name: "ABSOLUTE PLUMBING & HEATING CORP", trade: "Plumbing", union: "Non-Union" },
  { name: "ACA ENVIRONMENTAL SERVICES INC", trade: "Environmental Remediation", union: "Union" },
  { name: "ACADEMY MAIL BOX CO INC", trade: "Safety/Security", union: "Non-Union" },
  { name: "ACC CONSTRUCTION CORP", trade: "General Contracting", union: "Union" },
  { name: "ACCARDI COMPANIES LLC", trade: "Pumps/Electric Motors", union: "Non-Union" },
  { name: "ACCENTURE LLP", trade: "AV/IT/Telecom", union: "Non-Union" },
  { name: "ACCESSIBIL-IT INC", trade: "AV/IT/Telecom", union: "Non-Union" },
  { name: "ACCUMET LLC", trade: "HVAC/Mechanical", union: "Non-Union" },
  { name: "ACOUSTIC INC", trade: "HVAC/Mechanical", union: "Non-Union" },
  { name: "ACE RENTAL CORP", trade: "Commodities/Materials", union: "Non-Union" },
  { name: "ACTION CARTING ENVIRONMENT SVC", trade: "Waste Management", union: "Both" },
  { name: "ACTION METAL CO INC", trade: "Metal/Welding", union: "Non-Union" },
  { name: "ACTIVE DESIGN GROUP ENGINEERING DPC", trade: "Engineer", union: "Non-Union" },
  { name: "ADMIRAL CONSERVATION SVCS", trade: "Utilities", union: "Non-Union" },
  { name: "ADMROSE AIR CONDITIONING CORP", trade: "HVAC/Mechanical", union: "Union" },
  { name: "ADB ELECTRONICS LLC", trade: "AV/IT/Telecom", union: "Non-Union" },
  { name: "ADVANCE RELOCATION & STORAGE", trade: "Moving/Storage/Freight", union: "Both" },
  { name: "AEC REPROGRAPHICS INC", trade: "Signage/Print", union: "Non-Union" },
  { name: "AFFILIATED ENGINEERS INC", trade: "Engineer", union: "Both" },
  { name: "AIR QUALITY INNOVATIVE SOLUTIONS", trade: "HVAC/Mechanical", union: "Non-Union" },
  { name: "AIRGAS INC", trade: "Commodities/Materials", union: "Non-Union" },
  { name: "ALIANZA SERVICES LLC", trade: "Cleaning", union: "Non-Union" },
  { name: "ALTECH ELECTRONICS INC", trade: "Electrical", union: "Union" },
  { name: "AMERICAN HOTEL REGISTER COMPANY", trade: "Commodities/Materials", union: "Non-Union" },
  { name: "APPLIED IMAGE INC", trade: "Signage/Print", union: "Non-Union" },
  { name: "ARAMARK MANAGEMENT SERVICES LIMITED", trade: "Cleaning", union: "Non-Union" },
  { name: "ARGYLE MOTOR WORKS", trade: "Pumps/Electric Motors", union: "Non-Union" },
  { name: "ATTAIN CONSULTING GROUP LLC", trade: "Consultant (Other)", union: "Non-Union" },
  { name: "AUTOMATED LOGIC NY NJ", trade: "HVAC/Mechanical", union: "Non-Union" },
  { name: "AXIOM CONSULTING GROUP LLC", trade: "Consultant (Other)", union: "Non-Union" },
  { name: "BECKMAN COULTER INC", trade: "Commodities/Materials", union: "Non-Union" },
  { name: "BECTON DICKINSON AND COMPANY", trade: "Commodities/Materials", union: "Non-Union" },
  { name: "BELAIR INSTR CO INC", trade: "Electrical", union: "Non-Union" },
  { name: "BELLECLAIRE HOTEL LLC", trade: "Real Estate/Leasing", union: "Non-Union" },
  { name: "LINMARKS COMMERCIAL PAINTING LLC", trade: "Paint/Plaster/Taping", union: "Non-Union" },
  { name: "MADISON SERVICE CORPORATION", trade: "Fire Protection/Suppression", union: "Non-Union" },
  { name: "MCKEON DOOR EAST INC", trade: "Doors/Glazing/Windows", union: "Non-Union" },
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomDecimal(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.unionRateSheet.deleteMany();
  await prisma.vendorRate.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.insuranceRequirement.deleteMany();
  await prisma.vendor.deleteMany();

  // Create vendors
  for (let i = 0; i < VENDORS.length; i++) {
    const v = VENDORS[i];
    const vmsId = `6969${String(1000 + i).padStart(5, "0")}`;
    const isMwl = Math.random() > 0.7;
    const isSuspended = Math.random() > 0.92;
    const isExempt = Math.random() > 0.95;
    const hasFacilities = Math.random() > 0.3;
    const hasConstruction = Math.random() > 0.5;

    const vendor = await prisma.vendor.create({
      data: {
        vmsId,
        name: v.name,
        address1: `${100 + i * 10} ${["Broadway", "Park Ave", "Madison Ave", "Lexington Ave", "5th Ave"][i % 5]}`,
        city: "New York",
        state: "NY",
        zip: `100${String(10 + (i % 90)).padStart(2, "0")}`,
        phone: `212-555-${String(1000 + i).padStart(4, "0")}`,
        email: `info@${v.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.com`,
        primaryTrade: v.trade,
        unionStatus: v.union,
        mwlStatus: isMwl ? "MWL" : "Non-MWL",
        maximoEnabled: Math.random() > 0.5,
        facilities: hasFacilities,
        construction: hasConstruction,
        exemptFromInsurance: isExempt,
        status: isSuspended ? "suspended" : "active",
        suspendedDate: isSuspended ? randomDate(new Date("2024-06-01"), new Date("2025-12-01")) : null,
        suspendedReason: isSuspended ? "Expired insurance certificates" : null,
        arcVendorId: `000000${String(3000 + i)}/ACH-01`,
      },
    });

    // Insurance requirements (for non-exempt vendors)
    if (!isExempt) {
      const glRequired = [1000000, 2000000, 4000000, 5000000][Math.floor(Math.random() * 4)];
      await prisma.insuranceRequirement.create({
        data: {
          vendorId: vendor.id,
          glRequired: glRequired,
          glAggregate: glRequired * 2,
          glEachOccurrence: glRequired,
          excessRequired: hasConstruction ? 5000000 : null,
          excessAggregate: hasConstruction ? 8000000 : null,
          excessEachOccurrence: hasConstruction ? 5000000 : null,
          autoRequired: 1000000,
          autoAggregate: 1000000,
          autoEachOccurrence: 1000000,
          envRequired: v.trade === "Environmental Remediation" ? 1000000 : null,
          envAggregate: v.trade === "Environmental Remediation" ? 2000000 : null,
          envEachOccurrence: v.trade === "Environmental Remediation" ? 1000000 : null,
          workersCompRequired: true,
        },
      });
    }

    // Certificates (various statuses)
    if (!isExempt) {
      const coverageTypes = ["gl", "excess", "auto", "workers_comp"];
      if (v.trade === "Environmental Remediation") coverageTypes.push("environmental");

      for (const ct of coverageTypes) {
        const isExpired = Math.random() > 0.85;
        const isExpiringSoon = !isExpired && Math.random() > 0.8;
        const expDate = isExpired
          ? randomDate(new Date("2025-01-01"), new Date("2026-01-31"))
          : isExpiringSoon
          ? randomDate(new Date("2026-02-10"), new Date("2026-04-15"))
          : randomDate(new Date("2026-07-01"), new Date("2027-06-30"));

        const carriers = [
          "Hartford Fire Insurance",
          "Liberty Mutual Insurance",
          "Travelers Insurance",
          "Zurich American Insurance",
          "Chubb Insurance",
          "AIG",
        ];

        let status = "compliant";
        if (isExpired) status = "expired";
        else if (isExpiringSoon) status = "expiring";

        const limitAmounts: Record<string, number[]> = {
          gl: [2000000, 4000000, 2000000],
          excess: [5000000, 8000000, 5000000],
          auto: [1000000, 1000000, 1000000],
          workers_comp: [1000000, 1000000, 1000000],
          environmental: [1000000, 2000000, 1000000],
        };
        const amounts = limitAmounts[ct] || [1000000, 2000000, 1000000];

        await prisma.certificate.create({
          data: {
            vendorId: vendor.id,
            coverageType: ct,
            policyNumber: `${ct.toUpperCase().slice(0, 3)}-2026-${String(1000 + i).padStart(4, "0")}`,
            carrierName: carriers[Math.floor(Math.random() * carriers.length)],
            requiredAmount: amounts[0],
            aggregateAmount: amounts[1],
            eachOccurrenceAmount: amounts[2],
            effectiveDate: new Date(expDate.getTime() - 365 * 24 * 60 * 60 * 1000),
            expirationDate: expDate,
            complianceStatus: status,
            lastCheckedAt: new Date(),
            notifiedDate: isExpired || isExpiringSoon ? randomDate(new Date("2025-11-01"), new Date("2026-02-01")) : null,
          },
        });
      }
    }

    // Contracts (some vendors)
    if (Math.random() > 0.5) {
      const contractTypes = ["task_order", "term_consultant", "renew_contract"];
      await prisma.contract.create({
        data: {
          vendorId: vendor.id,
          contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
          title: `${v.trade} Services - ${2025 + Math.floor(Math.random() * 2)}`,
          beginDate: randomDate(new Date("2024-01-01"), new Date("2025-06-01")),
          endDate: randomDate(new Date("2026-01-01"), new Date("2027-12-31")),
          saContractValue: randomDecimal(50000, 5000000),
        },
      });
    }

    // Vendor Rates (for construction trades)
    if (hasConstruction && Math.random() > 0.4) {
      const categories: Record<string, string[]> = {
        "General Contracting": ["Carpenter", "Carpenter Foreman", "Laborer", "Superintendent", "Project Manager"],
        "Electrical": ["Electrician", "Electrician Foreman", "Helper"],
        "Plumbing": ["Plumber", "Plumber Foreman", "Helper"],
        "HVAC/Mechanical": ["Mechanic", "Mechanic Foreman", "Helper"],
        "Environmental Remediation": ["Laborer", "Plumber", "Pressure Washer Operator", "Welder"],
      };
      const subcats = categories[v.trade] || ["Laborer", "Foreman"];

      for (const sub of subcats) {
        const baseRate = randomDecimal(45, 165);
        await prisma.vendorRate.create({
          data: {
            vendorId: vendor.id,
            status: "approved",
            rateCategory: v.trade,
            rateSubCategory: `${v.trade} / ${sub}`,
            regularHourly: baseRate,
            premiumHourly: Math.round(baseRate * 1.5 * 100) / 100,
            doubleHourly: 0,
            materialMarkup: randomDecimal(0, 15),
            subMarkup: randomDecimal(0, 10),
            equipmentMarkup: 0,
            effectiveDate: new Date("2025-01-01"),
            expirationDate: new Date("2026-12-31"),
          },
        });
      }
    }
  }

  // Union Rate Sheets
  const unionTrades = [
    { trade: "Asbestos Workers", code: "6A", union: "Int'l Association of Heat & Frost Insulators & Asbestos Workers", regular: 78.50, premium: 117.75, double: 157.00, foremanReg: 83.50, foremanPrem: 125.25 },
    { trade: "Boilermakers", code: "5", union: "International Brotherhood of Boilermakers", regular: 82.71, premium: 124.07, double: 165.42, foremanReg: 87.71, foremanPrem: 131.57 },
    { trade: "Bricklayers", code: "1", union: "International Union of Bricklayers & Allied Craftworkers", regular: 85.00, premium: 127.50, double: 170.00, foremanReg: 90.00, foremanPrem: 135.00 },
    { trade: "Carpenters", code: "17 & 17 East", union: "United Brotherhood of Carpenters & Joiners - New York District Council", regular: 82.00, premium: 123.00, double: 164.00, foremanReg: 87.00, foremanPrem: 130.50 },
    { trade: "Cement Masons", code: "780", union: "Operative Plasterers & Cement Masons Local 780", regular: 73.00, premium: 109.50, double: 146.00, foremanReg: 78.00, foremanPrem: 117.00 },
    { trade: "Electricians", code: "3", union: "International Brotherhood of Electrical Workers - IBEW New York", regular: 93.50, premium: 140.25, double: 187.00, foremanReg: 98.50, foremanPrem: 147.75 },
    { trade: "Elevator Constructors", code: "1", union: "International Union of Elevator Constructors", regular: 95.00, premium: 142.50, double: 190.00, foremanReg: 100.00, foremanPrem: 150.00 },
    { trade: "Glaziers", code: "1087", union: "International Union of Painters & Allied Trades - Glaziers", regular: 76.00, premium: 114.00, double: 152.00, foremanReg: 81.00, foremanPrem: 121.50 },
    { trade: "Iron Workers", code: "40 & 361", union: "Iron Workers Locals 40 & 361", regular: 89.00, premium: 133.50, double: 178.00, foremanReg: 94.00, foremanPrem: 141.00 },
    { trade: "Laborers", code: "731", union: "Mason Tenders District Council of Greater New York", regular: 62.00, premium: 93.00, double: 124.00, foremanReg: 67.00, foremanPrem: 100.50 },
    { trade: "Operating Engineers", code: "14 & 15", union: "International Union of Operating Engineers AC & Refrigeration", regular: 88.00, premium: 132.00, double: 176.00, foremanReg: 93.00, foremanPrem: 139.50 },
    { trade: "Painters", code: "DC 9", union: "International Union of Painters & Allied Trades", regular: 68.00, premium: 102.00, double: 136.00, foremanReg: 73.00, foremanPrem: 109.50 },
    { trade: "Plasterers", code: "262", union: "Operative Plasterers & Cement Masons Intl. Assn.", regular: 75.00, premium: 112.50, double: 150.00, foremanReg: 80.00, foremanPrem: 120.00 },
    { trade: "Plumbers", code: "1", union: "United Assn. of Journeymen & Apprentices of Plumbing", regular: 92.00, premium: 138.00, double: 184.00, foremanReg: 97.00, foremanPrem: 145.50 },
    { trade: "Roofers", code: "8", union: "United Union of Roofers, Waterproofers Local 8", regular: 71.00, premium: 106.50, double: 142.00, foremanReg: 76.00, foremanPrem: 114.00 },
    { trade: "Sheet Metal Workers", code: "28", union: "Sheet Metal, Air, Rail, Transportation (SMART)", regular: 86.00, premium: 129.00, double: 172.00, foremanReg: 91.00, foremanPrem: 136.50 },
    { trade: "Sprinkler Fitters", code: "638", union: "Road Sprinkler Fitters Local Union 669", regular: 85.00, premium: 127.50, double: 170.00, foremanReg: 90.00, foremanPrem: 135.00 },
    { trade: "Steamfitters", code: "638", union: "United Assn. of Journeymen - Steamfitters", regular: 94.00, premium: 141.00, double: 188.00, foremanReg: 99.00, foremanPrem: 148.50 },
    { trade: "Teamsters", code: "282", union: "International Brotherhood of Teamsters", regular: 58.00, premium: 87.00, double: 116.00, foremanReg: 63.00, foremanPrem: 94.50 },
  ];

  for (const t of unionTrades) {
    await prisma.unionRateSheet.create({
      data: {
        trade: t.trade,
        code: t.code,
        unionName: t.union,
        regularRate: t.regular,
        premiumRate: t.premium,
        doubleRate: t.double,
        foremanRegular: t.foremanReg,
        foremanPremium: t.foremanPrem,
        foremanDouble: Math.round(t.foremanReg * 2 * 100) / 100,
        effectiveDate: new Date("2025-07-01"),
      },
    });
  }

  console.log("Seed complete!");
  const vendorCount = await prisma.vendor.count();
  const certCount = await prisma.certificate.count();
  const contractCount = await prisma.contract.count();
  const rateCount = await prisma.vendorRate.count();
  const unionCount = await prisma.unionRateSheet.count();
  console.log(`  ${vendorCount} vendors`);
  console.log(`  ${certCount} certificates`);
  console.log(`  ${contractCount} contracts`);
  console.log(`  ${rateCount} vendor rates`);
  console.log(`  ${unionCount} union rate entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
