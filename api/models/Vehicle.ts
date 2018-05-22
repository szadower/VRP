module.exports = {
  attributes: {
    name: { type: "string", required: true },
    brand: { type: "string" },
    model: { type: "string" },
    description: { type: "string" },
    fuelConsumption: { type: "number", columnType: "float" },
    capacity: { type: "number", required: true },
    routes: { collection: "route", via: "vehicles" },
  },
};
