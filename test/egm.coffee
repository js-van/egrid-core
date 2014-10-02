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

    describe 'textSeparator', ->
      it 'should change text separator', ->
        grid = egrid.core.grid()
        grid.addConstruct 'first line, second line, third line'
        egm = egrid.core.egm()
          .textSeparator (s) -> s.split ', '
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        tspan1 = selection.select 'g.vertices>g.vertex>text>tspan:nth-child(1)'
        tspan2 = selection.select 'g.vertices>g.vertex>text>tspan:nth-child(2)'
        tspan3 = selection.select 'g.vertices>g.vertex>text>tspan:nth-child(3)'
        expect tspan1.text()
          .to.be 'first line'
        expect tspan2.text()
          .to.be 'second line'
        expect tspan3.text()
          .to.be 'third line'

    describe 'vertexFontWeight', ->
      it 'should change font-weight of vertex', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'first text'
        b = grid.addConstruct 'second text'
        fontWeight = {}
        fontWeight[a] = 'bold'
        fontWeight[b] = '300'
        egm = egrid.core.egm()
          .vertexFontWeight (d, u) -> fontWeight[u]
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        text1 = selection.select 'g.vertices>g.vertex:nth-child(1)>text>tspan'
        text2 = selection.select 'g.vertices>g.vertex:nth-child(2)>text>tspan'
        expect text1.attr 'font-weight'
          .to.be 'bold'
        expect text2.attr 'font-weight'
          .to.be '300'

    describe 'vertexStrokeWidth', ->
      it 'should change stroke-width of vertex', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.addConstruct 'bb'
        strokeWidth = {}
        strokeWidth[a] = 2
        strokeWidth[b] = 3
        egm = egrid.core.egm()
          .vertexStrokeWidth (d, u) -> d.text.length * strokeWidth[u]
        selection = d3.select 'svg'
          .datum grid.graph()
          .call egm
        rect1 = selection.select 'g.vertices>g.vertex:nth-child(1)>rect'
        rect2 = selection.select 'g.vertices>g.vertex:nth-child(2)>rect'
        expect rect1.attr 'stroke-width'
          .to.be '2'
        expect rect2.attr 'stroke-width'
          .to.be '6'
