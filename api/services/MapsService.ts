module.exports = {
  getDistanceMatrix: (points) => {
    return points.map((from) => {
      if (from) {
        return { elements: points.map((to) => {
          if (to) {
            const coordsFrom = JSON.parse(`[${from.coordinates}]`);
            const coordsTo = JSON.parse(`[${to.coordinates}]`);
            return {
              distance: Math.sqrt(Math.pow(coordsTo[0] - coordsFrom[0], 2) + Math.pow(coordsTo[1] - coordsFrom[1], 2)),
            };
          }
      })};
    }
    });
  },
};
