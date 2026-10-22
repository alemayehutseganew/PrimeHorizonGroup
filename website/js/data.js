/* Prime Horizon Group — portal data layer.
   Production: all records are loaded from the Django REST API against the
   persistent PostgreSQL database via PHG_API.hydrate(). This file provides
   only an empty initial structure so the portal never renders hard-coded
   demo records as business truth. */
window.PHG_DATA = (function () {
  "use strict";

  return {
    sharePrice: 250000,
    totalShares: 0,
    shareholders: [],
    contributions: [],
    vehicles: [],
    drivers: [],
    trips: [],
    maintenance: [],
    projects: [],
    tasks: [],
    transactions: [],
    invoices: [],
    documents: [],
    meetings: [],
    notifications: [],
    auditLog: [],
    users: [],
    revenuePlan: [],
    customers: [],
    leads: []
  };
})();
