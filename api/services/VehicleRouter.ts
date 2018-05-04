class Vertex<T> {
  value: T
  weight: number
  edges: Array<{ to: Vertex<T>, weight: number }>

  findNeighbour(to: Vertex<T>) {
    return this.edges.find(x => x.to === to);
  }

  constructor (value, weight, edges) {
    this.value = value;
    this.weight = weight;
    this.edges = edges;
  }
}

class Graph<T> {
  // graf ważony na krawędzich i węzach zawierający CVRP
  private nodes: Array<Vertex<T>>;

  constructor() {
    this.nodes = [];
  }

  public get length(): number {
    return this.nodes.length;
  }

  public addNode(value: T, weight: number) {
    return this.nodes.push(new Vertex(value, weight, [] )) - 1;
  }

  public addEdge(from: number, to: number, weight: number) {
    this.nodes[from].edges.push({ to: this.nodes[to], weight });
  }

  public addUndirectedEdge(from: number, to: number, weight: number) {
    this.addEdge(from, to, weight);
    this.addEdge(to, from, weight);
  }

  public get(id?: number): Vertex<T> {
    if (!id) id = 0;
    return this.nodes[id];
  }

  public indexOf(searchElement , fromIndex = 0){
    return this.nodes.indexOf(searchElement, fromIndex);
  }

  public forEach(callback: (value: Vertex<T>, index: number, array: Vertex<T>[]) => void) {
    this.nodes.forEach(callback);
  }

  public map(callback: (value: Vertex<T>, index: number, array: Vertex<T>[]) => void) {
    return this.nodes.map(callback);
  }
}

class Vehicle {
  // klasa zawierająca informacje o pojeździe
  public capacity;
}

class Path extends Graph<any> { // klasa niepubliczna, używana tylko do algorytmu
  // pojedyńcza droga w grafie

  private _totalDistance: number = 0;
  public get totalDistance(): number {
    return this._totalDistance;
  }
  public add(value: any, nodeWeight: number, edgeWeight: number) {
    const pos = this.addNode(value, nodeWeight);
    if (pos > 0) {
      this.addEdge(pos - 1, pos, edgeWeight);
      this._totalDistance += edgeWeight;
    }
  }

  public addEdge(from: number, to: number, weight: number) {
    if(this.get(from).edges.length === 0) {
      super.addEdge(from, to, weight);
      this._totalDistance += weight;
    }
  }

  public addUndirectedEdge(from: number, to: number, weight: number) {
    this.addEdge(from, to, weight);
  }

  public isCycle() {
    const head = this.get();
  }

  public toString():string {
    let s = '';
    let head = this.get();
    while (head !== null) {
      if(head.edges[0]) {
        s += `${head.value}(${head.weight}) ==(${Math.floor(head.edges[0].weight)})=>`;
        head = head.edges[0].to
      } else {
        s += `${head.value}(${head.weight})`;
        head = null;
      }
    }
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
    this.paths.forEach(x => tD+=x.totalDistance);
    return ;
  }
}

class Ant { // klasa niepubliczna, używana tylko do algorytmu
  // mrowka
  private capacity: number;
  private graph: AntColonyGraph;
  private group: AntGroup;
  constructor(v: Vehicle, graph: AntColonyGraph) {
    this.capacity = v.capacity;
    this.graph = graph;
  }

  public setGroup(group: AntGroup) {
    this.group = group;
  }

  public constructPath(): Path {
    return null;
  }
}

class AntColonyGraph extends Graph<any> { // klasa niepubliczna, używana tylko do algorytmu
  // graf + feromony
  constructor(graph: Graph<any>) {
    super();
  }

  public globalUpdate(route: Route) {

  }
}

class AntGroup { // klasa niepubliczna, używana tylko do algorytmu
  // (graf + feromony) + czy mrowki byly
  private visited: Array<any>;

  constructor(graph: AntColonyGraph, ants: Array<Ant>) {
    this.visited = [];
  }

  public constructPaths() {
    return [];
  }

  public useNode(node: any) {
    this.visited.push(node);
  }

  public resupplyNodes() {
    this.visited = [];
  }
}

class VehicleRouter {
  // tu dzieje się

  private graph: Graph<any>;
  private vehicles: Array<Vehicle>;
  private deport: Vertex<any>;

  constructor(graph: Graph<any>, vehicles: Array<any>, deport: number) {
    this.graph = graph;
    this.vehicles = vehicles;
    this.deport = this.graph.get(deport);
  }

  public antColonySystem(iterations: number, groups: number): Route {
    const antGraph: AntColonyGraph = new AntColonyGraph(this.graph);
    let optimalRoute: Route = this.nearestNeighbourAlgorithm();

    for (let i: number = 0; i < iterations; i++) {
      const iterationRoutes: Array<Route> = [];
      for (let j: number = 0; j < groups; j++) {
        const ants: Array<Ant> = this.vehicles.map(v => new Ant(v, antGraph));
        const group = new AntGroup(antGraph, ants);
        const paths: Array<Path> = group.constructPaths();
        //iterationRoutes.push(new Route(paths));
      }
      iterationRoutes.forEach(r => (optimalRoute.totalDistance > r.totalDistance ? optimalRoute = r : null));
      antGraph.globalUpdate(optimalRoute);
    }
    return optimalRoute;
  }

  public nearestNeighbourAlgorithm(): Route {
    const route: Route = null;
    const visited: Array<any> = [];
    const vehicles = this.vehicles.map(v => ({
      vehicle: v,
      position: this.deport,
      load: 0,
      path: new Path(),
    }));
    vehicles.forEach(v => v.path.addNode(this.deport.value, 0));
    let flag = true;
    while (flag) {
      flag = false;
      vehicles.forEach((v) => {
        let target: { to: Vertex<any>, weight: number } = v.position === this.deport ? null : {to: this.deport, weight: v.position.findNeighbour(this.deport).weight };
        if (visited.length >= this.graph.length) {
          target = {to: this.deport, weight: 0}
        } else {
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
        if(target) {
          flag = true;
          v.path.add(target.to.value, target.to.weight, target.weight);
          v.position = target.to;
          if(target.to === this.deport) {
            v.load = 0;
          } else {
            visited.push(target.to);
            v.load += target.to.weight;
          }
        }
      });
    }
    vehicles.forEach(x => console.log(x.path));
    return new Route(vehicles);
  }

}
module.exports = {
  VehicleRouter,
  Graph,
  Route,
}
export default VehicleRouter;
