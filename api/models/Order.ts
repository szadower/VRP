module.exports = {
  attributes: {
    name: { type: "string", required: true },
    description: { type: "string" },
    size: { type: "number", required: true },
    positionInRoute: { type: "number", required: false },
    pickedUp: { type: "boolean", required: true },
    recived: { type: "number", required: true },
    position: { model: "point" },
    route: { model: "route" },
    vehicle: { model: "vehicle" },
  },
};
