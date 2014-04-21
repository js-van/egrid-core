/// <reference path="../model/project.ts"/>
/// <reference path="controller-base.ts"/>
/// <reference path="url.ts"/>

module egrid.app {
  export class ProjectCreateController extends ControllerBase implements model.ProjectData {
    private static $inject : string[] = ['$q', '$rootScope', '$state', '$timeout', '$filter', 'alertLifeSpan'];
    name : string;
    note : string;

    constructor(private $q, $rootScope, private $state, $timeout, $filter, alertLifeSpan) {
      super($rootScope, $timeout, $filter, alertLifeSpan);
    }

    submit() {
      var project = new model.Project(this);
      this.$q.when(project.save())
        .then(() => {
          this.$timeout(() => {
            this.$state.go('projects.get.detail', { projectId: project.key }, { reload: true });

            this.showAlert('MESSAGES.OPERATION_SUCCESSFULLY_COMPLETED');
          }, 200); // なぜか即時反映されない
        }, (...reasons: any[]) => {
          var k: string = reasons[0].status === 401
            ? 'MESSAGES.NOT_AUTHENTICATED'
            : 'MESSAGES.DESTINATION_IS_NOT_REACHABLE';

          this.showAlert(k, 'danger');
        })
        ;
    }
  }
}
