var app = angular.module('egrid-core-example', [])
  .controller('EgridCoreExampleController', function($scope) {
    var grid = $scope.grid = {
      nodes: [
        {text: 'aaa', size: 1, visible: true, color: 'red', opacity: 0.5},
        {text: 'いいい', size: 2, visible: false, color: 'green', opacity: 0.8},
        {text: 'ccc', size: 3, visible: true, color: 'blue', opacity: 0.2}
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
      nodeScaleMax: 2,
      nodeVisibility: function(node) {
        return node.visible;
      },
      nodeWeight: function(node) {
        return node.size;
      }
    });
    d3.select('#svg')
      .datum(grid)
      .call(egm);

    $scope.update = function() {
      d3.select('#svg').call(egm);
    };
  });
