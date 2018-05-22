declare let sails: any;
declare let VehicleRouter: any;
declare let Route: any;
declare let Order: any;
declare let Point: any;
declare let MapsService: any;
const  { Graph } = VehicleRouter;

module.exports = {
  generate: async (req: any, res: any) => {
    sails.log.info("Generate Route");
    const data = req.body;
    if (!data || !data.id || !data.options) return res.badRequest();

    const route = (await Route.findOne({ where: { id: data.id }}).populateAll());
    const graph = new Graph();
    let promises = route.orders.map((o) => Point.find({ where: { id: o.position }}));
    const points = await Promise.all(promises).then(results => results.map(p => p[0]));
    points.push(route.deport);
    route.orders.forEach(order => graph.addNode(order, order.size));
    const deport: number = graph.addNode(route.deport, 0);
    const distances = await MapsService.getDistanceMatrix(points);
    distances.forEach((x, i) => x ? x.elements.forEach((d, j) => {
      if (i !== j && d) graph.addEdge(i, j, Number(d.distance));
    }) : null);

    const router = new VehicleRouter.VehicleRouter(graph, route.vehicles, deport);
    const result = router.antColonySystem(...data.options);

    promises = [];
    result.paths.forEach((p) => {
      p.path.forEach((edge, i) => {
        if (i !== deport) {
          promises.push(Order.update({ id: edge.from.value.id }).set({ positionInRoute: i, vehicle: p.vehicle.id }));
        }
      });
    });
    await Promise.all(promises).catch(err => sails.log.error(err));
    const orders = await Order.find({
      where: { route: data.id, positionInRoute: { "!": null } },
      sort: { vehicle:  "ASC", positionInRoute: "ASC" },
    }).populate("position");
    return res.status(200).send({
      route: await Route.findOne({ where: { id: data.id } }).populate("vehicles"),
      orders,
    });
  },

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
      1, 7, 2, 4, 7, 2, 8, 1, 7, 2, 4,
      3, 4, 7, 5, 3, 6, 6, 7, 4, 1, 7,
      4, 4, 2, 7, 3, 8, 2, 5, 5, 1, 2,
      4, 5, 6, 4, 1, 6, 9, 6, 8, 6, 4,
      2, 7, 4, 4, 7, 9, 9, 8, 7, 7, 2,
      9, 7, 1, 6, 5, 1, 1, 8, 3, 3, 2,
      9, 7, 4, 9, 2, 2, 9, 5, 1, 9, 7,
      8, 3, 1, 3, 8, 9, 5, 7, 7, 4, 3,
      8, 6, 8, 3, 4, 8, 3, 6, 6, 6, 5,
      5, 5, 8, 7, 3, 7, 8, 5, 5, 2, 8,
      8, 3, 4, 5, 8, 9, 7, 2, 1, 6, 3,
      1, 7, 2, 4, 7, 1, 8, 1, 7, 2, 4,
      4, 5, 6, 4, 1, 6, 9, 6, 8, 6, 4,
      6, 8, 3, 8, 8, 9, 8, 4, 7, 7, 2,
      2, 6, 1, 3, 9, 3, 3, 1, 3, 2, 6,
      7, 9, 1, 6, 4, 6, 9, 6, 1, 3, 5,
      8, 6, 8, 3, 4, 8, 3, 6, 6, 6, 5,
      1, 7, 2, 4, 7, 1, 8, 1, 7, 2, 4,
      9, 7, 1, 6, 5, 1, 1, 8, 3, 3, 2,
      5, 7, 3, 3, 1, 6, 8, 7, 2, 3, 2,
      4, 5, 6, 4, 1, 6, 9, 6, 8, 6, 4,
      7, 1, 6, 4, 2, 8, 7, 8, 3, 4, 9,
      4, 4, 2, 3, 3, 8, 2, 7, 5, 1, 2,
      6, 8, 3, 8, 8, 9, 8, 4, 7, 7, 2,
      6, 4, 4, 4, 7, 8, 9, 8, 4, 1, 9,
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
