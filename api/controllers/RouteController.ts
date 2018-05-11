declare let sails: any;
declare let VehicleRouter: any;
const  { Graph } = VehicleRouter;

module.exports = {
  test: (req,res) => {
    const options = JSON.parse(req.query.options);
    const tries = req.query.tries ? req.query.tries : 1;

    const test = new Graph();
    test.addNode("punkt 0", 6);
    test.addNode("punkt 1", 5);
    test.addNode("punkt 2", 8);
    test.addNode("punkt 3", 3);
    test.addNode("punkt 4", 5);
    test.addNode("punkt 5", 8);
    test.addNode("punkt 6", 9);
    test.addNode("punkt 7", 5);
    test.addNode("punkt 8", 3);
    test.addNode("punkt 9", 9);
    test.addNode("punkt 10", 3);
    test.addNode("punkt 11", 5);
    test.addNode("punkt 12", 2);
    test.addNode("punkt 13", 5);
    test.addNode("punkt 14", 8);
    test.addNode("deport", 0);
    const weights = [
      4, 5, 6, 4, 1, 6, 9, 6, 8, 6, 4,
      2, 7, 4, 4, 7, 9, 9, 8, 7, 7, 2,
      5, 7, 3, 3, 1, 6, 8, 7, 2, 3, 2,
      5, 5, 8, 7, 3, 7, 8, 5, 5, 2, 8,
      3, 4, 7, 5, 3, 6, 6, 7, 4, 1, 7,
      6, 4, 4, 4, 7, 8, 9, 8, 4, 1, 9,
      7, 9, 1, 6, 4, 6, 9, 6, 1, 3, 5,
      2, 6, 1, 3, 9, 3, 3, 1, 3, 2, 6,
      8, 3, 4, 5, 8, 9, 7, 2, 1, 6, 3,
      9, 7, 4, 9, 2, 2, 9, 5, 1, 9, 7,
      8, 3, 1, 3, 8, 9, 5, 7, 7, 4, 3,
      4, 5, 6, 4, 1, 6, 9, 6, 8, 6, 4,
      4, 4, 2, 7, 3, 8, 2, 5, 5, 1, 2,
      4, 4, 2, 3, 3, 8, 2, 7, 5, 1, 2,
      1, 7, 2, 4, 7, 2, 8, 1, 7, 2, 4,
      6, 8, 3, 8, 8, 9, 8, 4, 7, 7, 2,
      9, 7, 1, 6, 5, 1, 1, 8, 3, 3, 2,
      8, 6, 8, 3, 4, 8, 3, 6, 6, 6, 5,
      8, 6, 8, 3, 4, 8, 3, 6, 6, 6, 5,
      9, 7, 1, 6, 5, 1, 1, 8, 3, 3, 2,
      6, 8, 3, 8, 8, 9, 8, 4, 7, 7, 2,
      4, 5, 6, 4, 1, 6, 9, 6, 8, 6, 4,
      7, 1, 6, 4, 2, 8, 7, 8, 3, 4, 9,
      1, 7, 2, 4, 7, 1, 8, 1, 7, 2, 4,
      1, 7, 2, 4, 7, 1, 8, 1, 7, 2, 4,
      8, 6, 8, 3, 4, 8, 3, 6, 6, 6, 5,
    ];
    test.forEach((x, i) => {
      test.forEach((y, j) => i !== j ? test.addEdge(i, j, weights.pop()) : null);
    });
    const vehicles = [
      {capacity: 12, name: "P1"},
      {capacity: 18, name: "P2"},
      {capacity: 15, name: "P3"},
    ];
    const router = new VehicleRouter.VehicleRouter(test, vehicles, 15);
    let route = router.nearestNeighbourAlgorithm();
    let response = "";
    route.paths.forEach((x) => {
      response += `Pojazd: ${x.vehicle.name} pojemność: ${x.vehicle.capacity} <br>`;
      response += `Trasa: ${x.path.toString()}<br>`;
    });
    response += `Calkowita dlugośc = ${route.totalDistance}`;
    response += "<br><br>";
    const results = options.map(x => 0);
    for (let i = 0; i < tries; i++) {
      options.forEach((set, index: number) => results[index] += router.antColonySystem(...set).totalDistance);
    }
    options.forEach((set, index) => {
      response += `iterations: ${set[0]},
        groups: ${set[1]},
        pheromoneDecay: ${set[2]},
        tauZero: ${set[3]},
        randomSelectionChance: ${set[4]},
        distanceImportanceFactor: ${set[5]}<br>`;
      response += `średnia dlugośc = ${results[index] / tries}`;
      response += "<br><br>";
    });
    // options.forEach((set) => {
    //   response += `iterations: ${set[0]},
    //   groups: ${set[1]},
    //   pheromoneDecay: ${set[2]},
    //   tauZero: ${set[3]},
    //   randomSelectionChance: ${set[4]},
    //   distanceImportanceFactor: ${set[5]}<br>`;
    //   route = router.antColonySystem(...set);
    //   route.paths.forEach((x) => {
    //     response += `Pojazd: ${x.vehicle.name} pojemność: ${x.vehicle.capacity} <br>`;
    //     response += `Trasa: ${x.path.toString()}<br>`;
    //   });
    //   response += `Calkowita dlugośc = ${route.totalDistance}`;
    //   response += "<br><br>";
    // });

    res.send(response);
  },

  testRandom: (req, res) => {
    const options = JSON.parse(req.query.options);
    const tries = req.query.tries ? req.query.tries : 1;
    const nodes = req.query.nodes ? req.query.nodes : 10;
    const vehiclesNumber = req.query.vehicles ? req.query.vehicles : 3;
    const test = new Graph();
    const vehicles = [];
    for (let i = 0; i < nodes; i++) test.addNode(`punkt${i}`, Math.random() * 9);
    for (let i = 0; i < vehiclesNumber; i++) vehicles.push({ name:`P${i}`, capacity: (Math.random() * 10) + 10});
    const deport = test.addNode("deport", 0);
    test.forEach((x, i) => {
      test.forEach((y, j) => i !== j ? test.addEdge(i, j, Math.random() * 9) : null);
    });
    const router = new VehicleRouter.VehicleRouter(test, vehicles, deport);
    const route = router.nearestNeighbourAlgorithm();
    let response = "";
    route.paths.forEach((x) => {
      response += `Pojazd: ${x.vehicle.name} pojemność: ${x.vehicle.capacity} <br>`;
      response += `Trasa: ${x.path.toString()}<br>`;
    });
    response += `Calkowita dlugośc = ${route.totalDistance}`;
    response += "<br><br>";
    const results = options.map(x => 0);
    for (let i = 0; i < tries; i++) {
      options.forEach((set, index: number) => results[index] += router.antColonySystem(...set).totalDistance);
    }
    options.forEach((set, index) => {
      response += `iterations: ${set[0]},
        groups: ${set[1]},
        pheromoneDecay: ${set[2]},
        tauZero: ${set[3]},
        randomSelectionChance: ${set[4]},
        distanceImportanceFactor: ${set[5]}<br>`;
      response += `średnia dlugośc = ${results[index] / tries}`;
      response += "<br><br>";
    });

    res.send(response);
  }
};
