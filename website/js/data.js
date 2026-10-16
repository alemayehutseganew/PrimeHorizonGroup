/* Prime Horizon Group — portal demo data.
   IMPORTANT: illustrative demo records only. Production deployments must load
   real data from the Django REST API — never treat this as business truth. */
window.PHG_DATA = (function () {
  "use strict";

  var SHARE_PRICE = 250000;
  var TOTAL_SHARES = 17;

  /* 14 founders: 3 hold two shares, 11 hold one share (per proposal scenario) */
  var shareholders = [
    { id: "SH-001", name: "Ato Dawit Bekele",      shares: 2, paid: 500000, status: "Active", email: "d.bekele@example.et",   joined: "2025-11-04" },
    { id: "SH-002", name: "W/ro Hanna Tesfaye",    shares: 2, paid: 500000, status: "Active", email: "h.tesfaye@example.et",  joined: "2025-11-04" },
    { id: "SH-003", name: "Ato Samuel Girma",      shares: 2, paid: 250000, status: "Active", email: "s.girma@example.et",    joined: "2025-11-11" },
    { id: "SH-004", name: "Ato Yonas Alemu",       shares: 1, paid: 250000, status: "Active", email: "y.alemu@example.et",    joined: "2025-11-04" },
    { id: "SH-005", name: "W/ro Mekdes Tadesse",   shares: 1, paid: 125000, status: "Active", email: "m.tadesse@example.et",  joined: "2025-11-04" },
    { id: "SH-006", name: "Ato Abel Haile",        shares: 1, paid: 250000, status: "Active", email: "a.haile@example.et",    joined: "2025-11-18" },
    { id: "SH-007", name: "Ato Nahom Fikru",       shares: 1, paid: 0,      status: "Active", email: "n.fikru@example.et",    joined: "2025-11-18" },
    { id: "SH-008", name: "W/ro Selamawit Kebede", shares: 1, paid: 250000, status: "Active", email: "s.kebede@example.et",   joined: "2025-12-02" },
    { id: "SH-009", name: "Ato Robel Assefa",      shares: 1, paid: 125000, status: "Active", email: "r.assefa@example.et",   joined: "2025-12-02" },
    { id: "SH-010", name: "Ato Kaleb Mengistu",    shares: 1, paid: 250000, status: "Active", email: "k.mengistu@example.et", joined: "2025-12-02" },
    { id: "SH-011", name: "W/ro Betelhem Degu",    shares: 1, paid: 250000, status: "Active", email: "b.degu@example.et",     joined: "2026-01-09" },
    { id: "SH-012", name: "Ato Tesfaye Wolde",     shares: 1, paid: 0,      status: "Active", email: "t.wolde@example.et",    joined: "2026-01-09" },
    { id: "SH-013", name: "Ato Girma Teshome",     shares: 1, paid: 250000, status: "Active", email: "g.teshome@example.et",  joined: "2026-01-22" },
    { id: "SH-014", name: "W/ro Lidiya Worku",     shares: 1, paid: 0, status: "Active", email: "l.worku@example.et",    joined: "2026-01-22" }
  ];

  var contributions = [
    { id: "CT-1001", sh: "SH-001", amount: 500000, date: "2025-11-06", method: "Bank transfer", ref: "CBE-884201", status: "Approved", by: "Finance Officer" },
    { id: "CT-1002", sh: "SH-002", amount: 500000, date: "2025-11-07", method: "Bank transfer", ref: "CBE-884517", status: "Approved", by: "Finance Officer" },
    { id: "CT-1003", sh: "SH-004", amount: 250000, date: "2025-11-10", method: "Bank transfer", ref: "AWB-119034", status: "Approved", by: "Finance Officer" },
    { id: "CT-1004", sh: "SH-005", amount: 125000, date: "2025-11-14", method: "Bank transfer", ref: "CBE-885002", status: "Approved", by: "Finance Officer" },
    { id: "CT-1005", sh: "SH-003", amount: 250000, date: "2025-11-20", method: "Bank transfer", ref: "CBE-886311", status: "Approved", by: "Finance Officer" },
    { id: "CT-1006", sh: "SH-006", amount: 250000, date: "2025-11-25", method: "Bank transfer", ref: "AWB-120445", status: "Approved", by: "Finance Officer" },
    { id: "CT-1007", sh: "SH-008", amount: 250000, date: "2025-12-05", method: "Bank transfer", ref: "CBE-889230", status: "Approved", by: "Finance Officer" },
    { id: "CT-1008", sh: "SH-009", amount: 125000, date: "2025-12-09", method: "Bank transfer", ref: "CBE-889911", status: "Approved", by: "Finance Officer" },
    { id: "CT-1009", sh: "SH-010", amount: 250000, date: "2025-12-15", method: "Bank transfer", ref: "NBE-330128", status: "Approved", by: "Finance Officer" },
    { id: "CT-1010", sh: "SH-013", amount: 250000, date: "2026-01-27", method: "Bank transfer", ref: "CBE-901553", status: "Approved", by: "Finance Officer" },
    { id: "CT-1011", sh: "SH-011", amount: 250000, date: "2026-02-03", method: "Bank transfer", ref: "AWB-131771", status: "Approved", by: "Finance Officer" },
    { id: "CT-1012", sh: "SH-014", amount: 125000, date: "2026-02-10", method: "Bank transfer", ref: "CBE-904119", status: "Pending",  by: "Finance Officer" },
    { id: "CT-1013", sh: "SH-005", amount: 125000, date: "2026-02-14", method: "Bank transfer", ref: "CBE-905338", status: "Pending",  by: "Finance Officer" }
  ];
  var vehicles = [
    { id: "VH-01", plate: "AA 3 T41529", make: "Toyota",     model: "Hilux",   year: 2024, category: "Pickup",      status: "Available",   driver: "Ato Mulugeta D.", odometer: 24500,  insurance: "2026-09-30", purchase: 4350000 },
    { id: "VH-02", plate: "AA 2 A78103", make: "Isuzu",      model: "NPR 75",  year: 2023, category: "Box truck",   status: "On trip",     driver: "Ato Samuel T.",   odometer: 87200,  insurance: "2026-07-15", purchase: 6800000 },
    { id: "VH-03", plate: "AA 3 B52214", make: "Hyundai",    model: "HD 170",  year: 2024, category: "Cargo truck", status: "Booked",      driver: "Ato Birhanu K.",  odometer: 41300,  insurance: "2026-11-02", purchase: 7450000 },
    { id: "VH-04", plate: "AA 1 L90458", make: "Toyota",     model: "Coaster", year: 2022, category: "Minibus",     status: "On trip",     driver: "Ato Tadesse A.",  odometer: 132800, insurance: "2026-05-20", purchase: 5200000 },
    { id: "VH-05", plate: "AA 2 K33067", make: "Mitsubishi", model: "Canter",  year: 2023, category: "Flatbed",     status: "Maintenance", driver: "—",               odometer: 95100,  insurance: "2026-08-11", purchase: 6100000 },
    { id: "VH-06", plate: "AA 3 T44780", make: "Toyota",     model: "Corolla", year: 2024, category: "Saloon",      status: "Available",   driver: "Ato Henok M.",    odometer: 18900,  insurance: "2026-12-01", purchase: 2950000 }
  ];

  var drivers = [
    { id: "DR-1", name: "Ato Mulugeta Desta", licence: "C",   status: "Active", phone: "+251 911 220 118", trips: 42 },
    { id: "DR-2", name: "Ato Samuel Tesfaye", licence: "C",   status: "Active", phone: "+251 911 335 402", trips: 57 },
    { id: "DR-3", name: "Ato Birhanu Kebede", licence: "C+",  status: "Active", phone: "+251 912 118 763", trips: 31 },
    { id: "DR-4", name: "Ato Tadesse Abebe",  licence: "B",   status: "Active", phone: "+251 911 874 220", trips: 88 },
    { id: "DR-5", name: "Ato Henok Mehari",   licence: "B",   status: "Active", phone: "+251 913 662 019", trips: 12 }
  ];

  var trips = [
    { id: "TR-2041", customer: "Raxa Distribution PLC", vehicle: "AA 2 A78103", driver: "Ato Samuel Tesfaye", route: "Addis Ababa → Bahir Dar",         start: "2026-02-10", end: "2026-02-13", price: 78000,  fuel: 14200, status: "Completed" },
    { id: "TR-2042", customer: "Habesha Beverages",     vehicle: "AA 3 B52214", driver: "Ato Birhanu Kebede", route: "Addis Ababa → Adama",             start: "2026-02-12", end: "2026-02-12", price: 22000,  fuel: 4800,  status: "Completed" },
    { id: "TR-2043", customer: "Sunrise Construction",  vehicle: "AA 1 L90458", driver: "Ato Tadesse Abebe",  route: "Staff shuttle — Bole/Merlin",     start: "2026-02-14", end: "2026-02-28", price: 96000,  fuel: 18500, status: "In progress" },
    { id: "TR-2044", customer: "Ethio Tech Solutions",  vehicle: "AA 2 K33067", driver: "—",                  route: "Addis Ababa → Hawassa",           start: "2026-02-20", end: "2026-02-22", price: 54000,  fuel: 0,     status: "Booked" },
    { id: "TR-2045", customer: "Raxa Distribution PLC", vehicle: "AA 2 A78103", driver: "Ato Samuel Tesfaye", route: "Addis Ababa → Mekelle",           start: "2026-02-24", end: "2026-02-28", price: 132000, fuel: 0,     status: "Booked" },
    { id: "TR-2046", customer: "Blue Nile Import",      vehicle: "AA 3 T41529", driver: "Ato Mulugeta Desta", route: "Modjo dry port → Warehouse",      start: "2026-02-16", end: "2026-02-16", price: 12500,  fuel: 2100,  status: "In progress" }
  ];

  var maintenance = [
    { id: "MT-301", vehicle: "AA 2 K33067", date: "2026-02-15", provider: "Merkato Motors", work: "Clutch replacement + full service", cost: 61500, next: "2026-05-15", status: "In progress" },
    { id: "MT-302", vehicle: "AA 1 L90458", date: "2026-01-28", provider: "Toyota Service",  work: "Scheduled 80,000 km service",       cost: 28400, next: "2026-04-28", status: "Completed" },
    { id: "MT-303", vehicle: "AA 2 A78103", date: "2026-01-12", provider: "Isuzu Addis",     work: "Brake pads + tyre rotation",        cost: 19800, next: "2026-04-12", status: "Completed" },
    { id: "MT-304", vehicle: "AA 3 B52214", date: "2025-12-20", provider: "Hyundai Service", work: "Engine oil, filters, diagnostics",  cost: 15200, next: "2026-03-20", status: "Completed" }
  ];
  var projects = [
    { id: "PR-101", name: "Office Network Build — Bole Branch",  customer: "Nile Insurance",       division: "Technical", value: 385000, spent: 214000, progress: 65,  status: "In progress",  manager: "Ato Nahom Fikru",   due: "2026-03-10" },
    { id: "PR-102", name: "Staff Transport Contract Q1–Q2",      customer: "Sunrise Construction", division: "Transport", value: 620000, spent: 190000, progress: 35,  status: "In progress",  manager: "Ato Dawit Bekele",  due: "2026-06-30" },
    { id: "PR-103", name: "Inventory Web Platform",              customer: "Habesha Beverages",    division: "Technical", value: 840000, spent: 512000, progress: 78,  status: "Under review", manager: "Ato Yonas Alemu",   due: "2026-03-02" },
    { id: "PR-104", name: "Warehouse Lighting Retrofit",         customer: "Blue Nile Import",     division: "Technical", value: 265000, spent: 265000, progress: 100, status: "Completed",    manager: "Ato Abel Haile",    due: "2026-01-30" },
    { id: "PR-105", name: "Generator Maintenance Program",       customer: "Ethio Tech Solutions", division: "Technical", value: 180000, spent: 42000,  progress: 20,  status: "In progress",  manager: "Ato Abel Haile",    due: "2026-05-15" },
    { id: "PR-106", name: "Freight Corridor — Addis/Dire Dawa",  customer: "Raxa Distribution PLC",division: "Transport", value: 450000, spent: 0,       progress: 5,   status: "Approved",     manager: "Ato Dawit Bekele",  due: "2026-04-20" }
  ];

  var tasks = [
    { id: "TK-511", project: "PR-101", title: "Terminate and test 48 data points",  assignee: "Ato Nahom Fikru",   priority: "High",   due: "2026-02-24", status: "In progress" },
    { id: "TK-512", project: "PR-101", title: "Configure core switch VLANs",        assignee: "Ato Girma Teshome", priority: "High",   due: "2026-02-26", status: "To do" },
    { id: "TK-513", project: "PR-103", title: "UAT session with client team",       assignee: "Ato Yonas Alemu",   priority: "Medium", due: "2026-02-25", status: "In progress" },
    { id: "TK-514", project: "PR-103", title: "Fix invoice export rounding",        assignee: "Ato Girma Teshome", priority: "High",   due: "2026-02-20", status: "Done" },
    { id: "TK-515", project: "PR-105", title: "Service 100 kVA genset — site visit", assignee: "Ato Abel Haile",   priority: "Medium", due: "2026-03-05", status: "To do" },
    { id: "TK-516", project: "PR-102", title: "Publish February shuttle schedule",   assignee: "Ato Dawit Bekele", priority: "High",   due: "2026-02-18", status: "Done" }
  ];

  var transactions = [
    { id: "FN-3001", date: "2026-02-18", type: "Income",  category: "Transport revenue",              division: "Transport", amount: 78000,  ref: "INV-2041", status: "Approved" },
    { id: "FN-3002", date: "2026-02-16", type: "Expense", category: "Fuel",                           division: "Transport", amount: 14200,  ref: "RCP-8891", status: "Approved" },
    { id: "FN-3003", date: "2026-02-15", type: "Expense", category: "Maintenance and repairs",        division: "Transport", amount: 61500,  ref: "RCP-8894", status: "Pending" },
    { id: "FN-3004", date: "2026-02-14", type: "Income",  category: "IT support revenue",             division: "Technical", amount: 45000,  ref: "INV-2039", status: "Approved" },
    { id: "FN-3005", date: "2026-02-12", type: "Income",  category: "Software development revenue",   division: "Technical", amount: 210000, ref: "INV-2038", status: "Approved" },
    { id: "FN-3006", date: "2026-02-10", type: "Expense", category: "Software and subscriptions",     division: "Technical", amount: 8900,   ref: "RCP-8887", status: "Approved" },
    { id: "FN-3007", date: "2026-02-08", type: "Expense", category: "Staff costs",                    division: "Shared",    amount: 96000,  ref: "PAY-0212", status: "Approved" },
    { id: "FN-3008", date: "2026-02-05", type: "Income",  category: "Electrical and engineering services", division: "Technical", amount: 128000, ref: "INV-2036", status: "Approved" },
    { id: "FN-3009", date: "2026-02-03", type: "Expense", category: "Rent and utilities",             division: "Shared",    amount: 34000,  ref: "RCP-8880", status: "Approved" },
    { id: "FN-3010", date: "2026-02-01", type: "Income",  category: "Transport revenue",              division: "Transport", amount: 96000,  ref: "INV-2033", status: "Approved" }
  ];
  var invoices = [
    { id: "INV-2041", customer: "Raxa Distribution PLC", issue: "2026-02-11", due: "2026-02-25", total: 78000,  paid: 78000,  status: "Paid" },
    { id: "INV-2039", customer: "Nile Insurance",        issue: "2026-02-14", due: "2026-02-28", total: 45000,  paid: 0,      status: "Sent" },
    { id: "INV-2038", customer: "Habesha Beverages",     issue: "2026-02-12", due: "2026-02-26", total: 210000, paid: 105000, status: "Partially paid" },
    { id: "INV-2036", customer: "Blue Nile Import",      issue: "2026-02-05", due: "2026-02-19", total: 128000, paid: 128000, status: "Paid" },
    { id: "INV-2033", customer: "Sunrise Construction",  issue: "2026-02-01", due: "2026-02-15", total: 96000,  paid: 0,      status: "Overdue" },
    { id: "INV-2029", customer: "Ethio Tech Solutions",  issue: "2026-01-20", due: "2026-02-03", total: 54000,  paid: 54000,  status: "Paid" }
  ];

  var documents = [
    { id: "DOC-01", name: "Founders' Agreement (signed)",     category: "Governance",  linked: "Company",     uploaded: "2025-10-28", by: "Admin",             access: "Shareholders & Management" },
    { id: "DOC-02", name: "Articles of Association",          category: "Governance",  linked: "Company",     uploaded: "2025-11-01", by: "Admin",             access: "Shareholders & Management" },
    { id: "DOC-03", name: "Trade licence 2026",               category: "Registration",linked: "Company",     uploaded: "2026-01-15", by: "Admin",             access: "All staff" },
    { id: "DOC-04", name: "Vehicle purchase — VH-02 receipt", category: "Fleet",       linked: "AA 2 A78103", uploaded: "2025-12-03", by: "Transport Manager", access: "Management" },
    { id: "DOC-05", name: "Insurance policy — VH-04",         category: "Fleet",       linked: "AA 1 L90458", uploaded: "2025-05-21", by: "Transport Manager", access: "Management" },
    { id: "DOC-06", name: "Nile Insurance contract",          category: "Customer",    linked: "PR-101",      uploaded: "2026-01-08", by: "Project Manager",   access: "Management" },
    { id: "DOC-07", name: "Invoice INV-2041 PDF",             category: "Finance",     linked: "INV-2041",    uploaded: "2026-02-11", by: "Finance Officer",   access: "Finance & Management" },
    { id: "DOC-08", name: "Board meeting minutes — #003",     category: "Governance",  linked: "Meeting #003",uploaded: "2026-02-06", by: "Admin",             access: "Shareholders & Management" }
  ];

  var meetings = [
    { id: "MTG-001", type: "Founding Assembly",   date: "2025-10-24", attendees: "14/14", status: "Approved",  summary: "Business model, share structure and initial capital plan approved." },
    { id: "MTG-002", type: "Board Meeting",       date: "2025-12-12", attendees: "5/5",   status: "Approved",  summary: "Fleet acquisition plan and first capital call confirmed." },
    { id: "MTG-003", type: "Board Meeting",       date: "2026-02-06", attendees: "5/5",   status: "Approved",  summary: "Q1 operations review; technical division SLA policy adopted." },
    { id: "MTG-004", type: "Shareholder Assembly",date: "2026-03-06", attendees: "—",     status: "Scheduled", summary: "Agenda: capital contribution status, dividend policy discussion." }
  ];
  var notifications = [
    { id: "N1", text: "New customer inquiry from Blue Nile Import (website form).", time: "12 min ago",  unread: true,  target: "leads" },
    { id: "N2", text: "Contribution CT-1013 (ETB 125,000) is pending approval.",     time: "1 hour ago",  unread: true,  target: "contributions" },
    { id: "N3", text: "Vehicle AA 1 L90458 insurance expires in 90 days.",           time: "3 hours ago", unread: true,  target: "vehicles" },
    { id: "N4", text: "Task TK-514 «Fix invoice export rounding» marked Done.",       time: "Yesterday",   unread: false, target: "tasks" },
    { id: "N5", text: "Invoice INV-2033 is now overdue.",                            time: "Yesterday",   unread: false, target: "invoices" },
    { id: "N6", text: "Meeting notice published: Shareholder Assembly 2026-03-06.",  time: "2 days ago",  unread: false, target: "meetings" }
  ];

  var auditLog = [
    { id: "AU-9001", actor: "Finance Officer",   action: "Approved contribution CT-1011",          target: "CT-1011", time: "2026-02-03 10:14", outcome: "Success" },
    { id: "AU-9002", actor: "Project Manager",   action: "Updated project PR-103 progress 65→78%", target: "PR-103",  time: "2026-02-04 09:02", outcome: "Success" },
    { id: "AU-9003", actor: "Transport Manager", action: "Created trip TR-2045",                   target: "TR-2045", time: "2026-02-05 16:47", outcome: "Success" },
    { id: "AU-9004", actor: "System",            action: "User login succeeded",                   target: "gm",      time: "2026-02-06 08:31", outcome: "Success" },
    { id: "AU-9005", actor: "Finance Officer",   action: "Recorded expense FN-3003 (pending)",     target: "FN-3003", time: "2026-02-15 11:20", outcome: "Success" },
    { id: "AU-9006", actor: "Unknown",           action: "Failed login attempt",                   target: "—",       time: "2026-02-16 02:12", outcome: "Blocked" },
    { id: "AU-9007", actor: "Admin",             action: "Invited new user (Finance role)",        target: "u-021",   time: "2026-02-17 14:05", outcome: "Success" }
  ];

  var users = [
    { id: "U-01", name: "Ato Samuel Girma",   email: "gm@primehorizon.et",        role: "General Manager",      status: "Active",   last: "2026-02-18 08:10" },
    { id: "U-02", name: "W/ro Hanna Tesfaye", email: "finance@primehorizon.et",   role: "Finance Officer",      status: "Active",   last: "2026-02-18 09:02" },
    { id: "U-03", name: "Ato Dawit Bekele",   email: "transport@primehorizon.et", role: "Transport Manager",    status: "Active",   last: "2026-02-18 07:45" },
    { id: "U-04", name: "Ato Nahom Fikru",    email: "projects@primehorizon.et",  role: "Project Manager",      status: "Active",   last: "2026-02-17 18:22" },
    { id: "U-05", name: "IT Administrator",   email: "admin@primehorizon.et",     role: "System Administrator", status: "Active",   last: "2026-02-18 08:00" },
    { id: "U-06", name: "Ato Yonas Alemu",    email: "yonas@primehorizon.et",     role: "Shareholder",          status: "Active",   last: "2026-02-16 20:14" },
    { id: "U-07", name: "Ato Kaleb Mengistu", email: "kaleb@primehorizon.et",     role: "Shareholder",          status: "Active",   last: "2026-02-12 19:33" },
    { id: "U-08", name: "Ato Robel Assefa",   email: "robel@primehorizon.et",     role: "Auditor (read-only)",  status: "Suspended",last: "2026-01-28 11:11" }
  ];

  var revenuePlan = [
    { label: "Year 1", value: 1800000 },
    { label: "Year 2", value: 3000000 },
    { label: "Year 3", value: 4500000 }
  ];

  var customers = [
    { id: "CU-01", name: "Raxa Distribution PLC", contact: "Ato Fikru Gebre", phone: "+251 911 452 330", category: "Logistics client",   status: "Active", stage: "Customer" },
    { id: "CU-02", name: "Habesha Beverages",     contact: "W/ro Almaz F.",    phone: "+251 913 201 887", category: "Technical client",   status: "Active", stage: "Customer" },
    { id: "CU-03", name: "Sunrise Construction",  contact: "Ato Yared T.",     phone: "+251 911 664 021", category: "Transport client",   status: "Active", stage: "Customer" },
    { id: "CU-04", name: "Nile Insurance",        contact: "Ato Ephrem S.",    phone: "+251 911 078 554", category: "Technical client",   status: "Active", stage: "Customer" },
    { id: "CU-05", name: "Blue Nile Import",      contact: "W/ro Rahel D.",    phone: "+251 912 990 117", category: "Transport client",   status: "Active", stage: "Customer" },
    { id: "CU-06", name: "Ethio Tech Solutions",  contact: "Ato Biniam H.",    phone: "+251 911 337 209", category: "Maintenance client", status: "Active", stage: "Customer" }
  ];

  var leads = [
    { id: "LD-01", source: "Website form", service: "Transport / freight",    value: 60000,  assignee: "Ato Dawit Bekele", stage: "Quotation sent", follow: "2026-02-20" },
    { id: "LD-02", source: "Referral",     service: "Network installation",   value: 240000, assignee: "Ato Nahom Fikru",  stage: "Qualified",      follow: "2026-02-19" },
    { id: "LD-03", source: "Website form", service: "IT support contract",    value: 120000, assignee: "Ato Yonas Alemu",  stage: "Contacted",      follow: "2026-02-21" },
    { id: "LD-04", source: "Trade fair",   service: "Electrical maintenance", value: 180000, assignee: "Ato Abel Haile",   stage: "New",            follow: "2026-02-24" },
    { id: "LD-05", source: "Referral",     service: "Staff transport",        value: 310000, assignee: "Ato Dawit Bekele", stage: "Negotiation",    follow: "2026-02-19" },
    { id: "LD-06", source: "Website form", service: "Software development",   value: 640000, assignee: "Ato Yonas Alemu",  stage: "Won",            follow: "—" }
  ];
  return {
    sharePrice: SHARE_PRICE,
    totalShares: TOTAL_SHARES,
    shareholders: shareholders,
    contributions: contributions,
    vehicles: vehicles,
    drivers: drivers,
    trips: trips,
    maintenance: maintenance,
    projects: projects,
    tasks: tasks,
    transactions: transactions,
    invoices: invoices,
    documents: documents,
    meetings: meetings,
    notifications: notifications,
    auditLog: auditLog,
    users: users,
    revenuePlan: revenuePlan,
    customers: customers,
    leads: leads
  };
})();