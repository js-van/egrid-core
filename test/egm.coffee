flushTransitions = ->
  now = Date.now
  Date.now = -> Infinity
  d3.timer.flush()
  Date.now = now

module.exports = ->
  describe 'egm', ->
    beforeEach ->
      d3.select 'body'
        .append 'svg'

    afterEach ->
      d3.select 'svg'
        .remove()

    describe 'vertexScale', ->
      it 'should change vertex scale', ->
        grid = egrid.core.grid()
        grid.addConstruct 'a'
        egm = egrid.core.egm()
          .vertexScale -> 3

        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        flushTransitions()
        expect selection.select('g.vertices>g.vertex').attr('transform')[-10..]
          .to.be 'scale(3,3)'

