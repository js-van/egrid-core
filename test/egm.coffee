module.exports = ->
  describe 'egm', ->
    beforeEach ->
      d3.select 'body'
        .append 'svg'

    afterEach ->
      d3.select 'svg'
        .remove()

    it 'should layout multiline text', ->
      grid = egrid.core.grid()
      grid.addConstruct 'first line\nsecond line'
      egm = egrid.core.egm()
      selection = d3.select 'svg'
        .datum grid.graph()
        .call egm
      tspan1 = selection.select 'g.vertices>g.vertex>text>tspan:nth-child(1)'
      tspan2 = selection.select 'g.vertices>g.vertex>text>tspan:nth-child(2)'
      expect tspan1.text()
        .to.be 'first line'
      expect tspan2.text()
        .to.be 'second line'


    describe 'vertexScale', ->
      it 'should change vertex scale', ->
        grid = egrid.core.grid()
        grid.addConstruct 'a'
        egm = egrid.core.egm()
          .vertexScale -> 3
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        transform = selection
          .select 'g.vertices>g.vertex'
          .attr 'transform'
        expect transform[-10..]
          .to.be 'scale(3,3)'

    describe 'center', ->
      it 'should work with empty grid', ->
        egm = egrid.core.egm()
          .size [100, 100]
        grid = egrid.core.grid()
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        selection.call egm.center()
        transform = selection
          .select 'g.contents'
          .attr 'transform'
        expect transform
          .to.be 'translate(50,50)scale(1,1)'

      it 'should transform contents region', ->
        egm = egrid.core.egm()
          .size [100, 100]
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.addConstruct 'b'
        c = grid.addConstruct 'c'
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        selection.selectAll 'g.vertex'
          .each (vertex) ->
            if vertex.key is a
              vertex.width = 20
              vertex.height = 10
              vertex.x = 10
              vertex.y = 5
            else if vertex.key is b
              vertex.width = 20
              vertex.height = 10
              vertex.x = 190
              vertex.y = 50
            else
              vertex.width = 20
              vertex.height = 10
              vertex.x = 100
              vertex.y = 95
        selection.call egm.center()
        transform = selection
          .select 'g.contents'
          .attr 'transform'
        expect transform
          .to.be 'translate(0,25)scale(0.5,0.5)'

      it 'should transform contents region with scale', ->
        egm = egrid.core.egm()
          .size [100, 100]
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.addConstruct 'b'
        c = grid.addConstruct 'c'
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        selection.selectAll 'g.vertex'
          .each (vertex) ->
            if vertex.key is a
              vertex.width = 20
              vertex.height = 10
              vertex.x = 10
              vertex.y = 5
            else if vertex.key is b
              vertex.width = 20
              vertex.height = 10
              vertex.x = 190
              vertex.y = 50
            else
              vertex.width = 20
              vertex.height = 10
              vertex.x = 100
              vertex.y = 95
        selection.call egm.center
          scale: 0.5
        transform = selection
          .select 'g.contents'
          .attr 'transform'
        expect transform
          .to.be 'translate(25,37.5)scale(0.25,0.25)'

      it 'should transform contents region with scale', ->
        egm = egrid.core.egm()
          .size [500, 500]
          .contentsScaleMax 2
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.addConstruct 'b'
        c = grid.addConstruct 'c'
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        selection.selectAll 'g.vertex'
          .each (vertex) ->
            if vertex.key is a
              vertex.width = 20
              vertex.height = 10
              vertex.x = 10
              vertex.y = 5
            else if vertex.key is b
              vertex.width = 20
              vertex.height = 10
              vertex.x = 190
              vertex.y = 50
            else
              vertex.width = 20
              vertex.height = 10
              vertex.x = 100
              vertex.y = 95
        selection.call egm.center()
        transform = selection
          .select 'g.contents'
          .attr 'transform'
        expect transform
          .to.be 'translate(50,150)scale(2,2)'

      it 'should transform contents region with margin', ->
        egm = egrid.core.egm()
          .size [500, 500]
          .contentsMargin 10
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.addConstruct 'b'
        c = grid.addConstruct 'c'
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        selection.selectAll 'g.vertex'
          .each (vertex) ->
            if vertex.key is a
              vertex.width = 20
              vertex.height = 10
              vertex.x = 10
              vertex.y = 5
            else if vertex.key is b
              vertex.width = 20
              vertex.height = 10
              vertex.x = 190
              vertex.y = 50
            else
              vertex.width = 20
              vertex.height = 10
              vertex.x = 100
              vertex.y = 95
        selection.call egm.center
          margin: 10
        transform = selection
          .select 'g.contents'
          .attr 'transform'
        expect transform
          .to.be 'translate(150,200)scale(1,1)'

    describe 'updateColor', ->
      it 'should change color', ->
        egm = egrid.core.egm()
        grid = egrid.core.grid()
        u = grid.addConstruct 'a'
        grid.ladderDown u, 'b'
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm

        egm
          .edgeColor -> '#ff0000'
          .edgeOpacity -> 0.5
          .vertexColor -> '#0000ff'
          .vertexOpacity -> 0.25

        selection.call egm.updateColor()

        expect selection.selectAll('g.edges>g.edge>path').style('stroke')
          .to.be '#ff0000'
        expect selection.selectAll('g.edges>g.edge>path').style('opacity')
          .to.be '0.5'
        expect selection.selectAll('g.vertices>g.vertex>rect').style('fill')
          .to.be '#0000ff'
        expect selection.selectAll('g.vertices>g.vertex').style('opacity')
          .to.be '0.25'
