var app = angular.module('egrid-core-example', [])
  .controller('EgridCoreExampleController', function($scope) {
    var grid = $scope.grid = {
      nodes: [
        {text: 'aaa', size: 1, visible: true, color: '#ff0000', opacity: 0.5},
        {text: 'いいい', size: 2, visible: false, color: '#00ff00', opacity: 0.8},
        {text: 'ccc', size: 3, visible: true, color: '#0000ff', opacity: 0.2}
      ],
      links: [
        {upper: 0, lower: 1},
        {upper: 1, lower: 2}
      ]
    };
    var egm = egrid.egm({
      enableClickNode: true,
      nodeColor: function(node) {
        return node.color;
      },
      nodeOpacity: function(node) {
        return node.opacity;
      },
      nodeScale: function(node) {
        return node.size;
      },
      nodeVisibility: function(node) {
        return node.visible;
      }
    });
    d3.select('#svg')
      .datum(grid)
      .call(egm);

    $scope.update = function() {
      d3.select('#svg').call(egm);
    };
  });
