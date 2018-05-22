class Edge<T> {
  public to: Vertex<any>;
  public from: Vertex<any>;
  public weight: number;
  public value: T;

  constructor(to, from, weight, value) {
    this.to = to;
    this.from = from;
    this.weight = weight;
    this.value = value;
  }
}

class Vertex<T> {
  public value: T;
  public weight: number;
  public id: number;
  public edges: Array<Edge<any>>;

  constructor(value, weight, edges, id?) {
    this.value = value;
    this.weight = weight;
    this.edges = edges;
    this.id = id;
  }

  public findNeighbour(to: Vertex<T>) {
    return this.edges.find(x => x.to === to);
  }
}

class Graph<T> {
  // graf ważony na krawędzich i węzach zawierający CVRP
  protected nodes: Array<Vertex<T>>;

  constructor() {
    this.nodes = [];
  }

  public get length(): number {
    return this.nodes.length;
  }

  public addNode(value: T, weight: number) {
    return this.nodes.push(new Vertex(value, weight, [], this.nodes.length)) - 1;
  }

  public addEdge(from: number, to: number, weight: number) {
    this.nodes[from].edges.push(new Edge(this.nodes[to], this.nodes[from], weight, null));
  }

  public addUndirectedEdge(from: number, to: number, weight: number) {
    this.addEdge(from, to, weight);
    this.addEdge(to, from, weight);
  }

  public get(id?: number): Vertex<T> {
    if (!id) id = 0;
    return this.nodes[id];
  }

  public indexOf(searchElement , fromIndex = 0) {
    return this.nodes.indexOf(searchElement, fromIndex);
  }

  public forEach(callback: (value: Vertex<T>, index: number, array: Array<Vertex<T>>) => void) {
    this.nodes.forEach(callback);
  }

  public map(callback: (value: Vertex<T>, index: number, array: Array<Vertex<T>>) => void): any[] {
    return this.nodes.map(callback);
  }
}

class Vehicle {
  // klasa zawierająca informacje o pojeździe
  public capacity;
  public name;
}

class Path { // klasa niepubliczna, używana tylko do algorytmu
  // pojedyńcza droga w grafie

  private edges: Array<Edge<any>> = [];
  private _totalDistance: number = 0;
  public get totalDistance(): number {
    return this._totalDistance;
  }

  public add(edge: Edge<any>) {
    if (this.edges.length <= 0 || this.edges[this.edges.length - 1].to === edge.from) {
      this.edges.push(edge);
      this._totalDistance += edge.weight;
    }
  }
  public get(id?: number) {
    if (!id) id = 0;
    return this.edges[0];
  }

  public forEach(callback) {
    this.edges.forEach(callback);
  }

  public map(callback: (value: Edge<any>, index: number, array: Array<Edge<any>>) => void): any[] {
    return this.edges.map(callback);
  }

  public isCycle() {
    return this.edges.length > 0 || this.edges[0].from === this.edges[this.edges.length - 1].to;
  }

  public toString(): string {
    let s = "";
    this.edges.forEach((e, i) =>  {
      if (i === 0) {
        s += `${e.from.value}(${e.from.weight}) =(${Math.floor(e.weight)})> ${e.to.value}(${e.to.weight})`;
      } else {
        s += ` =(${Math.floor(e.weight)})> ${e.to.value}(${e.to.weight})`;
      }
    });
    return s;
  }
}

class Route {
  // zestaw n drog na grafie tworzących rozwiązanie vrp
  // tutaj drogi muszą byc powiązane z pojazdami
  public paths;
  constructor(paths: Array<{path: Path, vehicle: Vehicle}>) {
    this.paths = paths;
  }

  private _totalDistance: number;
  public get totalDistance(): number {
    let tD = 0;
    this.paths.forEach(x => tD += x.path.totalDistance);
    return tD;
  }
}

class AntColonyGraph extends Graph<any> { // klasa niepubliczna, używana tylko do algorytmu
  // graf + feromony
  public pheromoneDecay: number;
  public deport: Vertex<any>;
  public randomSelectionChance: number;
  public distanceImportanceFactor: number;
  public deltaTau: number;
  public defaultLength: number;
  constructor(
    graph: Graph<any>,
    basePheromone: number,
    pheromoneDecay: number,
    deport: number,
    randomSelectionChance: number,
    distanceImportanceFactor: number,
  ) {
    super();
    this.pheromoneDecay = pheromoneDecay;
    this.nodes = graph.map((v): Vertex<any> => new Vertex(v.value, v.weight, [], v.id));
    graph.forEach((v, i) => {
      this.nodes[i].edges = v.edges.map(e => new Edge(this.nodes[e.to.id], this.nodes[i], e.weight, basePheromone));
    });
    this.deport = this.get(deport);
    this.deltaTau = basePheromone;
    this.randomSelectionChance = randomSelectionChance;
    this.distanceImportanceFactor = distanceImportanceFactor;
  }

  public globalUpdate(route: Route) {
    this.forEach(v => v.edges.forEach(e => e.value = (1 - this.pheromoneDecay) * e.value));
    route.paths.forEach((p) => {
      p.path.forEach((e) => {
        e.value = this.pheromoneDecay * (this.defaultLength / route.totalDistance);
      });
    });
  }

  public localUpdate(edge: Edge<any>, deltaTau?: number) {
    if (!deltaTau) deltaTau = this.deltaTau;
    edge.value = (1 - this.pheromoneDecay) * edge.value + this.pheromoneDecay * deltaTau;
  }
}

class AntGroup { // klasa niepubliczna, używana tylko do algorytmu
  // (graf + feromony) + czy mrowki byly
  private visited: any[];
  private ants: Ant[];

  constructor(ants: Ant[]) {
    this.visited = [];
    this.ants = ants;
  }

  public constructRoute(): Route {
    const route: Route = null;
    let flag = true;
    while (flag) {
      flag = false;
      this.ants.forEach(a => flag = !a.step(this.visited) || flag);
    }
    return new Route(this.ants);
  }
}

class Ant { // klasa niepubliczna, używana tylko do algorytmu
  // mrowka
  private position: Vertex<any>;
  private load: number;
  private _vehicle: Vehicle;
  private graph: AntColonyGraph;
  private _path: Path;

  constructor(v: Vehicle, graph: AntColonyGraph) {
    this._vehicle = v;
    this.graph = graph;
    this.load = 0;
    this.position = graph.deport;
    this._path = new Path();
  }

  public resetAnt() {
    this.load = 0;
    this._path = new Path();
  }

  public get path(): Path {
    return this._path;
  }

  public get vehicle(): Vehicle {
    return this._vehicle;
  }

  public step(visited: Array<Vertex<any>>): boolean { // returns if path is closed (in deport and nowhere to go)
    let target: {edge: Edge<any>, attractiveness: number} = null;
    const targets = [];
    let flag = true;
    let omega = 0;
    if (this.position !== this.graph.deport) {
      const toDeport = this.position.findNeighbour(this.graph.deport);
      target = {
        edge: toDeport,
        attractiveness: this.edgeAttractiveness(toDeport),
      };
    }
    if (visited.length < this.graph.length) {
      this.position.edges.forEach(x => {
        if (visited.indexOf(x.to) === -1 && x.to.weight <= this.vehicle.capacity - this.load) {
          const temp = { edge: x, attractiveness: this.edgeAttractiveness(x) };
          targets.push(temp);
          omega += temp.attractiveness;
          if (!target || target.attractiveness > temp.attractiveness) target = temp;
        }
      });
    }
    if (Math.random() > this.graph.randomSelectionChance) {
      const randomChoice = Math.random() * omega;
      let helper = 0;
      for (let i = 0; i < targets.length && helper < randomChoice; i++) {
        target = targets[i];
        helper += target.attractiveness;
      }
    }
    if (target) {
      flag = false;
      this.path.add(target.edge);
      this.position = target.edge.to;
      this.graph.localUpdate(target.edge);
      if (target.edge.to === this.graph.deport) {
        this.load = 0;
      } else {
        visited.push(target.edge.to);
        this.load += target.edge.to.weight;
      }
    }
    return flag;
  }

  private edgeAttractiveness(edge: Edge<any>) {
    return edge.value * Math.pow(10 / edge.weight, this.graph.distanceImportanceFactor);
  }
}

class VehicleRouter {
  // tu dzieje się

  private graph: Graph<any>;
  private vehicles: Vehicle[];
  private deport: number;

  constructor(graph: Graph<any>, vehicles: any[], deport: number) {
    this.graph = graph;
    this.vehicles = vehicles;
    this.deport = deport;
  }

  public antColonySystem(
    iterations: number,
    groups: number,
    pheromoneDecay: number, // p
    tauZero: number,
    randomSelectionChance: number, // q0
    distanceImportanceFactor: number, // beta
  ): Route {
    const antGraph: AntColonyGraph = new AntColonyGraph(
      this.graph,
      tauZero,
      pheromoneDecay, // p
      this.deport,
      randomSelectionChance, // q0
      distanceImportanceFactor, // beta
    );
    let optimalRoute: Route = this.nearestNeighbourAlgorithm(antGraph, this.deport);
    antGraph.defaultLength = optimalRoute.totalDistance;
    let flag = true;
    for (let i: number = 0; i < iterations && flag; i++) {
      antGraph.globalUpdate(optimalRoute);
      const iterationRoutes: Route[] = [];
      for (let j: number = 0; j < groups; j++) {
        const ants: Ant[] = this.vehicles.map(v => new Ant(v, antGraph));
        const group = new AntGroup(ants);
        iterationRoutes.push(group.constructRoute());
      }
      const last = optimalRoute.totalDistance;
      iterationRoutes.forEach(r => (optimalRoute.totalDistance > r.totalDistance ? optimalRoute = r : null));
    }
    return optimalRoute;
  }

  public async asyncAntColonySystem(
    iterations: number,
    groups: number,
    pheromoneDecay: number, // p
    tauZero: number,
    randomSelectionChance: number, // q0
    distanceImportanceFactor: number, // beta
  ): Promise<Route> {
    const antGraph: AntColonyGraph = new AntColonyGraph(
      this.graph,
      tauZero,
      pheromoneDecay, // p
      this.deport,
      randomSelectionChance, // q0
      distanceImportanceFactor, // beta
    );
    let optimalRoute: Route = this.nearestNeighbourAlgorithm(antGraph, this.deport);
    antGraph.defaultLength = optimalRoute.totalDistance;
    let flag = true;
    const promises = []
    for (let i: number = 0; i < iterations && flag; i++) {
      promises.push((async () => {
        antGraph.globalUpdate(optimalRoute);
        const iterationRoutes: Route[] = [];
        const morePromises = [];
        for (let j: number = 0; j < groups; j++) {
          promises.push((async () => {
            const ants: Ant[] = this.vehicles.map(v => new Ant(v, antGraph));
            const group = new AntGroup(ants);
            iterationRoutes.push(group.constructRoute());
          })());
        }
        await Promise.all(morePromises).then(() => console.log("morePromises then"));
        const last = optimalRoute.totalDistance;
        console.log("after morePromises");
        iterationRoutes.forEach(r => (optimalRoute.totalDistance > r.totalDistance ? optimalRoute = r : null));
      })());
    }
    console.log("promises before");
    await Promise.all(promises).then(() => console.log("promises then"));
    console.log(optimalRoute);
    return optimalRoute;
  }

  public nearestNeighbourAlgorithm(graph?: Graph<any>, deport?: number, vehicles?: Vehicle[]): Route {
    if (!graph) graph = this.graph;
    const deportPoint = graph.get(deport ? deport : this.deport);
    if (!vehicles) vehicles = this.vehicles;
    const route: Route = null;
    const visited: any = [];
    const activeVehicles = vehicles.map(v => ({
      vehicle: v,
      position: deportPoint,
      load: 0,
      path: new Path(),
    }));
    let flag = true;
    while (flag) {
      flag = false;
      activeVehicles.forEach((v) => {
        let target: Edge<any> = null;
        let help: number = 0;
        if (v.position !== deportPoint) {
          target = v.position.findNeighbour(deportPoint);
          help = target.weight;
          target.weight = Number.MAX_SAFE_INTEGER;
        }
        if (visited.length < graph.length) {
          v.position.edges.forEach(x => {
            if (
              visited.indexOf(x.to) === -1 &&
              (!target || (target.weight > x.weight &&
                x.to.weight <= v.vehicle.capacity - v.load))
              ) {
                target = x;
              }
            });
        }
        if (target) {
          if (v.position !== deportPoint) v.position.findNeighbour(deportPoint).weight = help;
          flag = true;
          v.path.add(target);
          v.position = target.to;
          if (target.to === deportPoint) {
            v.load = 0;
          } else {
            visited.push(target.to);
            v.load += target.to.weight;
          }
        }
      });
    }
    return new Route(activeVehicles);
  }

}

module.exports = {
  VehicleRouter,
  Graph,
  Route,
};
export default VehicleRouter;
