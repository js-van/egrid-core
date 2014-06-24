module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffee:
      compile:
        files: [
          expand: true
          cwd: 'src/'
          src: ['**/*.coffee']
          dest: 'js'
          ext: '.js'
        ]
    browserify:
      dist:
        files:
          'egrid-core.js': ['js/index.js']
    watch:
      scripts:
        files: ['src/**/*.coffee'],
        tasks: ['compile'],
    mocha_phantomjs:
      options:
        reporter: 'dot'
      all: ['test/**/*.html']
    copy:
      dist:
        files: [
          src: 'egrid-core.js'
          dest: 'dist/'
        ]
      ghPages:
        files: [
          {
            expand: true
            cwd: 'examples/'
            src: ['**']
            dest: 'gh-pages/'
          }
          {
            src: 'egrid-core.js'
            dest: 'gh-pages/'
          }
        ]
    clean: [
      'dist'
      'egrid-core.js'
      'gh-pages'
      'js'
    ]


    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-mocha-phantomjs'

    grunt.registerTask 'compile', ['coffee', 'browserify']
    grunt.registerTask 'default', ['watch']
    grunt.registerTask 'dist', ['compile', 'copy:dist']
    grunt.registerTask 'gh-pages', ['compile', 'copy:ghPages']
    grunt.registerTask 'test', ['mocha_phantomjs']
