degree = require './degree'

module.exports = 
  degree: degree.degree
  inDegree: degree.inDegree
  outDegree: degree.outDegree
  closeness: require './closeness'
  betweenness: require './betweenness'
