module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.coffee'],
          dest: 'js/',
          ext: '.js'
        }]
      }
    },
    concat: {
      files: {
        src: 'js/**/*.js',
        dest: 'egrid-core.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'egrid-core.min.js': ['egrid-core.js']
        }
      }
    },
    mocha_phantomjs: {
      options: {
        'reporter': 'dot'
      },
      all: ['test/**/*.html']
    },
    watch: {
      scripts: {
        files: ['src/**/*.coffee'],
        tasks: ['coffee', 'concat'],
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('compile', ['coffee']);
  grunt.registerTask('test', ['mocha_phantomjs']);
};
