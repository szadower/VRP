module.exports = {
  attributes: {
    name: { type: "string", required: true },
    description: { type: "string" },
    size: { type: "integer", required: true },
    positionInRoute: { type: "integer", required: false },
    pickedUp: { type: "boolean", required: true },
    recived: { type: "integer", required: true },
    position: { model: "point" },
    route: { model: "route" },
    vehicle: { model: "vehicle" },
  },
};
