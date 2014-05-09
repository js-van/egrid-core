describe('test EGM', function() {
  it('test draw', function() {
    var grid = {
      nodes: [
        {text: 'a'},
        {text: 'b'},
        {text: 'c'}
      ],
      links: [
        {upper: 0, lower: 1},
        {upper: 1, lower: 2}
      ]
    };

    var egm = egrid.egm();

    var selection = d3.select('svg')

    selection
      .call(egm);

    selection
      .datum(grid)
      .call(egm);

    expect(selection.selectAll('g.nodes').size()).to.be(1);
    expect(selection.selectAll('g.nodes > g.node').size()).to.be(3);
    expect(selection.selectAll('g.nodes > g.node > rect').size()).to.be(3);
    expect(selection.selectAll('g.nodes > g.node > text').size()).to.be(3);
    expect(selection.selectAll('g.links > g.link').size()).to.be(2);

    selection
      .datum(null)
      .call(egm);

    expect(selection.select('g.nodes').empty()).to.be.ok();
    expect(selection.select('g.links').empty()).to.be.ok();
  });
});
