describe('test EGM', function() {
  function makeGrid() {
    return {
      nodes: [
        {key: 0, text: 'a'},
        {key: 1, text: 'b'},
        {key: 2, text: 'c'}
      ],
      links: [
        {upper: 0, lower: 1},
        {upper: 1, lower: 2}
      ]
    };
  }

  it('test draw', function() {
    var egm = egrid.egm();
    var selection = d3.select('svg')
      .datum(makeGrid())
      .call(egm);

    expect(selection.selectAll('g.nodes > g.node > rect').size()).to.be(3);
    expect(selection.selectAll('g.nodes > g.node > text').size()).to.be(3);
    expect(selection.selectAll('g.links > g.link > path').size()).to.be(2);

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

  it('text change text', function() {
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
});
