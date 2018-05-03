class Vertex<T> {
  value: T
  weight: number
  edges: Array<{ to: Vertex<T>, weight: number }>
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
    return this.nodes.push({ value, weight, edges: [] }) - 1;
  }

  public addEdge(from: number, to: number, weight: number) {
    this.nodes[from].edges.push({ to: this.nodes[to], weight });
  }

  public addUndirectedEdge(from: number, to: number, weight: number) {
    this.addEdge(from, to, weight);
    this.addEdge(to, from, weight);
  }

  public get(id?: number) {
    if (!id) id = 0;
    return { ...this.nodes[id] };
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

  private _totalDistance: number;
  public get totalDistance(): number {
    return this._totalDistance;
  }
  public add(value: any, nodeWeight: number, edgeWeight: number) {

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
}

class Route {
  // zestaw n drog na grafie tworzących rozwiązanie vrp
  // tutaj drogi muszą byc powiązane z pojazdami
  constructor(paths: Array<Path>) {
  }

  private _totalDistance: number;
  public get totalDistance(): number {
    return this.totalDistance;
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
  private deport: number;

  constructor(graph: Graph<any>, vehicles: Array<any>, deport: number) {
    this.graph = graph;
    this.vehicles = vehicles;
    this.deport = deport;
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
        iterationRoutes.push(new Route(paths));
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
      capacity: v.capacity,
      position: this.graph.get(this.deport),
      load: 0,
      path: new Path(),
    }));
    while (visited.length < this.graph.length) {
      vehicles.forEach((v) => {
        if (visited.length >= this.graph.length) return;
        let target: { to: Vertex<any>, weight: number } = null;
        v.position.edges.forEach(x => ((!target || target.weight > x.weight) ? target = x : null));
        v.path.add(target.to.value, target.to.weight, target.weight);
        v.position = target.to;
      });
    }
    vehicles.forEach((v) => {
      v.path.addEdge(this.graph.indexOf(v.position), this.deport, v.position.edges.find(n => n.to === this.graph.get(this.deport)).weight);
    });
    return new Route(vehicles.map(v => v.path));
  }

}
