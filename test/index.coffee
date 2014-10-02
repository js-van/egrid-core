mocha.ui 'bdd'
mocha.reporter 'html'

tests = [
  require './centrality'
  require './egm'
  require './graph'
]

for test in tests
  test()

if window.mochaPhantomJS
  mochaPhantomJS.run()
else
  mocha.run()
