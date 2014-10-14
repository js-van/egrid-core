mocha.ui 'bdd'
mocha.reporter 'html'

tests = [
  require './egm'
  require './graph'
  require './grid'
  require './network/centrality'
  require './network/community'
  require './layout'
]

for test in tests
  test()

if window.mochaPhantomJS
  mochaPhantomJS.run()
else
  mocha.run()
