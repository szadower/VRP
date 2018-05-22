module.exports = {
  attributes: {
    startDate: { type: "datetime", required: true },
    endDate: { type: "datetime" },
    description: { type: "string" },
    finished: { type: "boolean", required: true, defaultsTo: false },
    deport: { model: "point" },
    orders: { collection: "order", via: "route" },
    vehicles: { collection: "vehicle", via: "routes"},
  },
};
