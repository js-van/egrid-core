/// <reference path="../model/sem-project.ts"/>
/// <reference path="../model/sem-project-collection.ts"/>

module egrid.app {
  export class SemProjectListController {
    public projectId : string;
    public semProjects = new model.SemProjectCollection();

    constructor($window, private $q, $stateParams, private $state) {
      this.projectId = $stateParams.projectId;

      this.$q.when(this.semProjects.query(this.projectId))
        .then((semProjects : model.SemProject[]) => {
          Object.keys(semProjects).forEach((v, i, ar) => {
              this.semProjects.addItem(semProjects[v]);
            });
        });
    }
  }
}
