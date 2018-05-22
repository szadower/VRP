module.exports = {
  attributes: {
    name: { type: "string", required: true },
    brand: { type: "string" },
    model: { type: "string" },
    description: { type: "string" },
    fuelConsumption: { type: "float" },
    capacity: { type: "integer", required: true },
    routes: { collection: "route", via: "vehicles" },
  },
};
