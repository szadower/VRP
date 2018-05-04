
 declare let sails: any;
 declare let VehicleRouter: any;
 const  { Graph } = VehicleRouter;

module.exports = {

	test: (req,res) => {
        let data = req.body;
        const test = new Graph();
        sails.log.info(test.addNode('punkt 0', 6));
        sails.log.info(test.addNode('punkt 1', 5));
        sails.log.info(test.addNode('punkt 2', 8));
        sails.log.info(test.addNode('punkt 3', 3));
        sails.log.info(test.addNode('punkt 4', 5));
        sails.log.info(test.addNode('punkt 5', 8));
        sails.log.info(test.addNode('punkt 6', 9));
        sails.log.info(test.addNode('punkt 7', 5));
        sails.log.info(test.addNode('punkt 8', 3));
        sails.log.info(test.addNode('punkt 9', 9));
        sails.log.info(test.addNode('deport', 0));
        test.forEach((x, i) => {
          test.forEach((y, j) => i !== j ? test.addEdge(i, j, Math.random()*5+1) : null)
        });
        const vehicles = [
          {capacity: 12, name: 'P1'},
          {capacity: 18, name: 'P2'},
          {capacity: 15, name: 'P3'},
        ]
        const router = new VehicleRouter.VehicleRouter(test, vehicles, 10);
        const route = router.nearestNeighbourAlgorithm();
        let response = ''
        route.paths.forEach((x) => {
          response += `Pojazd: ${x.vehicle.name} pojemność: ${x.vehicle.capacity} <br>`
          response += `Trasa: ${x.path.toString()}<br>`;
        });
        res.send(response);
	}

};
