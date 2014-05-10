describe('test EGM', function() {
  function makeGrid() {
    return {
      nodes: [
        {key: 0, text: 'a'},
        {key: 1, text: 'b'},
        {key: 2, text: 'c'},
        {key: 3, text: 'd'}
      ],
      links: [
        {upper: 0, lower: 1},
        {upper: 1, lower: 2},
        {upper: 1, lower: 3}
      ]
    };
  }

  before(function() {
    d3.select('body').append('svg');
  });

  after(function() {
    d3.select('svg').remove();
  });

  it('test draw', function() {
    var egm = egrid.egm();
    var selection = d3.select('svg')
      .datum(makeGrid())
      .call(egm);

    expect(selection.selectAll('g.nodes > g.node > rect').size()).to.be(4);
    expect(selection.selectAll('g.nodes > g.node > text').size()).to.be(4);
    expect(selection.selectAll('g.links > g.link > path').size()).to.be(3);
  });

  it('test clear', function() {
    var egm = egrid.egm();
    var selection = d3.select('svg')
      .datum(makeGrid())
      .call(egm)
      .datum(null)
      .call(egm);

    expect(selection.select('g.nodes').empty()).to.be.ok();
    expect(selection.select('g.links').empty()).to.be.ok();
  });

  it('test change text', function() {
    var egm = egrid.egm()
      .nodeKey(function(node) {
        return node.key;
      });
    var grid = makeGrid();
    var selection = d3.select('svg')
      .datum(grid)
      .call(egm);

    expect(selection.select('g.nodes > g.node:nth-child(2) > text').text()).to.be('b');

    grid.nodes[1].text = 'changed';
    selection.call(egm);

    expect(selection.select('g.nodes > g.node:nth-child(2) > text').text()).to.be('changed');
  });

  it('nodes ordering', function() {
    var egm = egrid.egm()
      .nodeVisibility(function(node) {
        return node.visible === undefined ? true : node.visible;
      });
    var grid = makeGrid();
    var selection = d3.select('svg')
      .datum(grid)
      .call(egm);

    var positions = {};
    selection.selectAll('g.nodes > g.node')
      .each(function(node) {
        positions[node.data.text] = [node.x, node.y];
      });

    grid.nodes[2].visible = false;
    selection.call(egm);
    grid.nodes[2].visible = true;
    selection.call(egm);

    selection.selectAll('g.nodes > g.node')
      .each(function(node) {
        expect(node.x).to.be(positions[node.data.text][0]);
        expect(node.y).to.be(positions[node.data.text][1]);
      });
  });
});
