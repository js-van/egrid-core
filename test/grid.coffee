egrid = core: require '../'

module.exports = ->
  describe 'Grid', ->
    it 'should create empty grid', ->
      grid = egrid.core.grid()
      expect(grid.graph().numVertices()).to.be(0)
      expect(grid.graph().numEdges()).to.be(0)

    describe 'addConstruct', ->
      it 'should add vertex', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)
        expect(grid.graph().vertex(u).text).to.be('original construct')

      it 'should not add duplicate construct', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        v = grid.addConstruct('original construct')
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)
        expect(u).to.be(v)

      it 'should add vertex after remove', ->
        grid = egrid.core.grid()
        grid.addConstruct('1st construct')
        u = grid.addConstruct('2nd construct')
        grid.addConstruct('3rd construct')
        grid.removeConstruct(u)
        grid.addConstruct('4th construct')
        expect(grid.graph().numVertices()).to.be(3)

    describe 'removeConstruct', ->
      it 'should remove vertex', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.removeConstruct(u)
        expect(grid.graph().numVertices()).to.be(0)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should remove connected edge', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.ladderUp(u, 'upper construct')
        grid.ladderDown(u, 'lower construct')
        grid.removeConstruct(u)
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(0)

    describe 'updateConstruct', ->
      it 'should change property of construct', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.updateConstruct(u, 'text', 'updated')
        expect(grid.graph().vertex(u).text).to.be('updated')

    describe 'ladderUp', ->
      it 'should add vertex and edge', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        v = grid.ladderUp(u, 'upper construct')
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)
        expect(grid.graph().vertex(v).text).to.be('upper construct')

      it 'should add edge if value is duplicated', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        v = grid.addConstruct('upper construct')
        w = grid.ladderUp(u, 'upper construct')
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)
        expect(v).to.be(w)

      it 'should run after remove', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('1st construct')
        v = grid.addConstruct('2nd construct')
        grid.addConstruct('3rd construct')
        grid.removeConstruct(v)
        grid.ladderUp(u, 'upper construct')
        expect(grid.graph().numVertices()).to.be(3)
        expect(grid.graph().numEdges()).to.be(1)

    describe 'ladderDown', ->
      it 'should add vertex and edge', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        v = grid.ladderDown(u, 'lower construct')
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)
        expect(grid.graph().vertex(v).text).to.be('lower construct')

      it 'should add edge if value is duplicated', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        v = grid.addConstruct('lower construct')
        w = grid.ladderDown(u, 'lower construct')
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)
        expect(v).to.be(w)

      it 'should run after remove', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('1st construct')
        v = grid.addConstruct('2nd construct')
        grid.addConstruct('3rd construct')
        grid.removeConstruct(v)
        grid.ladderDown(u, 'lower construct')
        expect(grid.graph().numVertices()).to.be(3)
        expect(grid.graph().numEdges()).to.be(1)

    describe 'merge', ->
      it 'should merge two vertices into one vertex', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('1st construct')
        v = grid.addConstruct('2nd construct')
        w = grid.merge(u, v)
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)
        expect(grid.graph().vertex(u).text).to.be('1st construct, 2nd construct')
        expect(w).to.be(u)

      it 'should merge edges', ->
        grid = egrid.core.grid()
        a = grid.addConstruct('a')
        b = grid.ladderUp(a, 'b')
        c = grid.ladderDown(a, 'c')
        d = grid.addConstruct('d')
        e = grid.ladderUp(d, 'e')
        f = grid.ladderDown(d, 'f')
        grid.merge(a, d)
        expect(grid.graph().numVertices()).to.be(5)
        expect(grid.graph().numEdges()).to.be(4)
        expect(grid.graph().outVertices(a)).to.be.eql([c, f])
        expect(grid.graph().inVertices(a)).to.be.eql([b, e])

      it 'should merge adjacent vertices', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        grid.merge a, b
        expect grid.graph().numVertices()
          .to.be 1
        expect grid.graph().numEdges()
          .to.be 0

      it 'should preserve loop edge', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        grid.addEdge b, b
        grid.merge a, b
        expect grid.graph().numVertices()
          .to.be 1
        expect grid.graph().numEdges()
          .to.be 1

      it 'should run with custom merge function', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('1st construct')
        v = grid.addConstruct('2nd construct')
        w = grid.merge u, v, (u, v) ->
          text: 'custom merge function'

        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)
        expect(grid.graph().vertex(u).text).to.be('custom merge function')
        expect(w).to.be(u)

    describe 'group', ->
      it 'should group vertices', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        c = grid.ladderDown b, 'c'
        d = grid.addConstruct 'd'
        e = grid.ladderDown d, 'e'
        f = grid.ladderDown e, 'f'
        g = grid.group [b, e],
          text: 'be'
        h = grid.group [c, f],
          text: 'cf'
        expect(grid.graph().numVertices()).to.be 4
        expect(grid.graph().numEdges()).to.be 3
        expect(grid.graph().vertex b).to.not.be.ok()
        expect(grid.graph().vertex c).to.not.be.ok()
        expect(grid.graph().vertex e).to.not.be.ok()
        expect(grid.graph().vertex f).to.not.be.ok()
        expect(grid.graph().vertex g).to.be.ok()
        expect(grid.graph().vertex h).to.be.ok()
        expect(grid.graph().edge a, g).to.be.ok()
        expect(grid.graph().edge d, g).to.be.ok()
        expect(grid.graph().edge g, h).to.be.ok()
        expect(grid.graph().vertex(g).text).to.be('be')
        expect(grid.graph().vertex(h).text).to.be('cf')
        i = grid.group [g, h],
          text: 'bcef'
        expect(grid.graph().numVertices()).to.be 3
        expect(grid.graph().numEdges()).to.be 2
        expect(grid.graph().edge a, i).to.be.ok()
        expect(grid.graph().edge d, i).to.be.ok()
        expect(grid.graph().vertex(i).text).to.be('bcef')

    describe 'ungroup', ->
      it 'should ungroup vertices', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        c = grid.ladderDown b, 'c'
        d = grid.addConstruct 'd'
        e = grid.ladderDown d, 'e'
        f = grid.ladderDown e, 'f'
        g = grid.group [b, e],
          text: 'be'
        h = grid.group [c, f],
          text: 'cf'
        i = grid.group [g, h],
          text: 'bcef'
        grid.ungroup i
        grid.ungroup g
        grid.ungroup h
        expect(grid.graph().numVertices()).to.be 6
        expect(grid.graph().numEdges()).to.be 4
        expect(grid.graph().vertex a).to.be.ok()
        expect(grid.graph().vertex b).to.be.ok()
        expect(grid.graph().vertex c).to.be.ok()
        expect(grid.graph().vertex d).to.be.ok()
        expect(grid.graph().vertex e).to.be.ok()
        expect(grid.graph().vertex f).to.be.ok()
        expect(grid.graph().vertex g).to.be(null)
        expect(grid.graph().vertex h).to.be(null)
        expect(grid.graph().vertex i).to.be(null)
        expect(grid.graph().edge a, b).to.be.ok()
        expect(grid.graph().edge b, c).to.be.ok()
        expect(grid.graph().edge d, e).to.be.ok()
        expect(grid.graph().edge e, f).to.be.ok()

    describe 'canUndo', ->
      it 'should return true after transaction', ->
        grid = egrid.core.grid()
        grid.addConstruct('original construct')
        expect(grid.canUndo()).to.be.ok()

      it 'should return false before transaction', ->
        grid = egrid.core.grid()
        expect(grid.canUndo()).not.to.be.ok()

    describe 'canRedo', ->
      it 'should return true after undo', ->
        grid = egrid.core.grid()
        grid.addConstruct('original construct')
        grid.undo()
        expect(grid.canRedo()).to.be.ok()

      it 'should return false before undo', ->
        grid = egrid.core.grid()
        grid.addConstruct('original construct')
        expect(grid.canRedo()).not.to.be.ok()

    describe 'undo', ->
      it 'should throw error if !canUndo()', ->
        grid = egrid.core.grid()
        expect(grid.undo).to.throwError()

      it 'should revert addConstruct', ->
        grid = egrid.core.grid()
        grid.addConstruct('original construct')
        grid.undo()
        expect(grid.graph().numVertices()).to.be(0)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should revert removeConstruct', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.removeConstruct(u)
        grid.undo()
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should revert updateConstruct', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.updateConstruct(u, 'text', 'updated')
        grid.undo()
        expect(grid.graph().vertex(u).text).to.be('original construct')

      it 'should revert ladderUp', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.ladderUp(u, 'upper construct')
        grid.undo()
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should revert ladderUp with duplicated text', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.addConstruct('upper construct')
        grid.ladderUp(u, 'upper construct')
        grid.undo()
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should revert ladderDown', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.ladderUp(u, 'lower construct')
        grid.undo()
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should revert ladderDown with duplicated text', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.addConstruct('lower construct')
        grid.ladderDown(u, 'lower construct')
        grid.undo()
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should revert merge', ->
        grid = egrid.core.grid()
        a = grid.addConstruct('a')
        b = grid.ladderUp(a, 'b')
        c = grid.ladderDown(a, 'c')
        d = grid.addConstruct('d')
        e = grid.ladderUp(d, 'e')
        f = grid.ladderDown(d, 'f')
        grid.merge(a, d)
        grid.undo()
        expect(grid.graph().numVertices()).to.be(6)
        expect(grid.graph().numEdges()).to.be(4)
        expect(grid.graph().outVertices(a)).to.be.eql([c])
        expect(grid.graph().inVertices(a)).to.be.eql([b])
        expect(grid.graph().outVertices(d)).to.be.eql([f])
        expect(grid.graph().inVertices(d)).to.be.eql([e])

      it 'should revert merge', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        grid.addEdge b, b
        grid.merge a, b
        grid.undo()
        expect grid.graph().numVertices()
          .to.be 2
        expect grid.graph().numEdges()
          .to.be 2

      it 'should revert group', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        c = grid.ladderDown b, 'c'
        d = grid.addConstruct 'd'
        e = grid.ladderDown d, 'e'
        f = grid.ladderDown e, 'f'
        g = grid.group [b, e]
        h = grid.group [c, f]
        i = grid.group [g, h]
        grid.undo()
        grid.undo()
        grid.undo()
        expect(grid.graph().numVertices()).to.be 6
        expect(grid.graph().numEdges()).to.be 4
        expect(grid.graph().vertex b).to.be.ok()
        expect(grid.graph().vertex c).to.be.ok()
        expect(grid.graph().vertex e).to.be.ok()
        expect(grid.graph().vertex f).to.be.ok()
        expect(grid.graph().vertex g).to.not.be.ok()
        expect(grid.graph().vertex h).to.not.be.ok()
        expect(grid.graph().edge a, b).to.be.ok()
        expect(grid.graph().edge b, c).to.be.ok()
        expect(grid.graph().edge d, e).to.be.ok()
        expect(grid.graph().edge e, f).to.be.ok()

      it 'should revert ungroup', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        c = grid.ladderDown b, 'c'
        d = grid.addConstruct 'd'
        e = grid.ladderDown d, 'e'
        f = grid.ladderDown e, 'f'
        g = grid.group [b, e]
        h = grid.group [c, f]
        i = grid.group [g, h]
        grid.ungroup i
        grid.ungroup g
        grid.ungroup h
        grid.undo()
        grid.undo()
        grid.undo()
        expect(grid.graph().numVertices()).to.be 3
        expect(grid.graph().numEdges()).to.be 2
        expect(grid.graph().edge a, i).to.be.ok()
        expect(grid.graph().edge d, i).to.be.ok()

    describe 'redo', ->
      it 'should throw error if !canRedo()', ->
        grid = egrid.core.grid()
        expect(grid.redo).to.throwError()

      it 'should re-execute addConstruct', ->
        grid = egrid.core.grid()
        grid.addConstruct('original construct')
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(1)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should re-execute removeConstruct', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.removeConstruct(u)
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(0)
        expect(grid.graph().numEdges()).to.be(0)

      it 'should re-execute updateConstruct', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.updateConstruct(u, 'text', 'updated')
        grid.undo()
        grid.redo()
        expect(grid.graph().vertex(u).text).to.be('updated')

      it 'should re-execute ladderUp', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.ladderUp(u, 'upper construct')
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)

      it 'should re-execute ladderUp with duplicated text', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.addConstruct('upper construct')
        grid.ladderUp(u, 'upper construct')
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)

      it 'should re-execute ladderDown', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.ladderUp(u, 'lower construct')
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)

      it 'should re-execute ladderDown with duplicated text', ->
        grid = egrid.core.grid()
        u = grid.addConstruct('original construct')
        grid.addConstruct('lower construct')
        grid.ladderDown(u, 'lower construct')
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(2)
        expect(grid.graph().numEdges()).to.be(1)

      it 'should re-execute merge', ->
        grid = egrid.core.grid()
        a = grid.addConstruct('a')
        b = grid.ladderUp(a, 'b')
        c = grid.ladderDown(a, 'c')
        d = grid.addConstruct('d')
        e = grid.ladderUp(d, 'e')
        f = grid.ladderDown(d, 'f')
        grid.merge(a, d)
        grid.undo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be(5)
        expect(grid.graph().numEdges()).to.be(4)
        expect(grid.graph().outVertices(a)).to.be.eql([c, f])
        expect(grid.graph().inVertices(a)).to.be.eql([b, e])

      it 'should re-execute merge', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        grid.addEdge b, b
        grid.merge a, b
        grid.undo()
        grid.redo()
        expect grid.graph().numVertices()
          .to.be 1
        expect grid.graph().numEdges()
          .to.be 1

      it 'should re-execute group', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        c = grid.ladderDown b, 'c'
        d = grid.addConstruct 'd'
        e = grid.ladderDown d, 'e'
        f = grid.ladderDown e, 'f'
        g = grid.group [b, e]
        h = grid.group [c, f]
        i = grid.group [g, h]
        grid.undo()
        grid.undo()
        grid.undo()
        grid.redo()
        grid.redo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be 3
        expect(grid.graph().numEdges()).to.be 2
        expect(grid.graph().vertex b).to.not.be.ok()
        expect(grid.graph().vertex c).to.not.be.ok()
        expect(grid.graph().vertex e).to.not.be.ok()
        expect(grid.graph().vertex f).to.not.be.ok()
        expect(grid.graph().vertex g).to.not.be.ok()
        expect(grid.graph().vertex h).to.not.be.ok()
        expect(grid.graph().vertex i).to.be.ok()
        expect(grid.graph().edge a, i).to.be.ok()
        expect(grid.graph().edge d, i).to.be.ok()

      it 'should re-execute ungroup', ->
        grid = egrid.core.grid()
        a = grid.addConstruct 'a'
        b = grid.ladderDown a, 'b'
        c = grid.ladderDown b, 'c'
        d = grid.addConstruct 'd'
        e = grid.ladderDown d, 'e'
        f = grid.ladderDown e, 'f'
        g = grid.group [b, e]
        h = grid.group [c, f]
        i = grid.group [g, h]
        grid.ungroup i
        grid.ungroup g
        grid.ungroup h
        grid.undo()
        grid.undo()
        grid.undo()
        grid.redo()
        grid.redo()
        grid.redo()
        expect(grid.graph().numVertices()).to.be 6
        expect(grid.graph().numEdges()).to.be 4
        expect(grid.graph().edge a, b).to.be.ok()
        expect(grid.graph().edge b, c).to.be.ok()
        expect(grid.graph().edge d, e).to.be.ok()
        expect(grid.graph().edge e, f).to.be.ok()
