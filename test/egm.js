describe('test EGM', function() {
  function makeGrid() {
    var graph = egrid.core.graph.adjacencyList();
    var a = graph.addVertex({text: 'a'});
    var b = graph.addVertex({text: 'b'});
    var c = graph.addVertex({text: 'c'});
    var d = graph.addVertex({text: 'd'});
    graph.addEdge(a, b);
    graph.addEdge(b, c);
    graph.addEdge(b, d);
    return graph;
  }

  beforeEach(function() {
    d3.select('body').append('svg');
  });

  afterEach(function() {
    d3.select('svg').remove();
  });

  it('test draw', function() {
    var egm = egrid.core.egm();
    var selection = d3.select('svg')
      .datum(makeGrid())
      .call(egm);

    expect(selection.selectAll('g.vertices > g.vertex > rect').size()).to.be(4);
    expect(selection.selectAll('g.vertices > g.vertex > text').size()).to.be(4);
    expect(selection.selectAll('g.edges > g.edge > path').size()).to.be(3);
  });

  it('test clear', function() {
    var egm = egrid.core.egm();
    var selection = d3.select('svg')
      .datum(makeGrid())
      .call(egm)
      .datum(null)
      .call(egm);

    expect(selection.select('g.vertices').empty()).to.be.ok();
    expect(selection.select('g.edges').empty()).to.be.ok();
  });

  it('test change text', function() {
    var egm = egrid.core.egm()
    var grid = makeGrid();
    var selection = d3.select('svg')
      .datum(grid)
      .call(egm);

    expect(selection.select('g.vertices > g.vertex:nth-child(2) > text').text()).to.be('b');

    grid.get(1).text = 'changed';
    selection.call(egm);

    expect(selection.select('g.vertices > g.vertex:nth-child(2) > text').text()).to.be('changed');
  });

  it('vertices ordering', function() {
    var egm = egrid.core.egm()
      .vertexVisibility(function(vertex) {
        return vertex.visible === undefined ? true : vertex.visible;
      });
    var grid = makeGrid();
    var selection = d3.select('svg')
      .datum(grid)
      .call(egm);

    var positions = {};
    selection.selectAll('g.vertices > g.vertex')
      .each(function(u) {
        positions[u.key] = [u.x, u.y];
      });

    grid.get(2).visible = false;
    selection.call(egm);
    grid.get(2).visible = true;
    selection.call(egm);

    selection.selectAll('g.vertices > g.vertex')
      .each(function(u) {
        expect(u.x).to.be(positions[u.key][0]);
        expect(u.y).to.be(positions[u.key][1]);
      });
  });
});
