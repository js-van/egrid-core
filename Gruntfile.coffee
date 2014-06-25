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
        files: ['src/**/*.coffee']
        tasks: ['compile']
      test:
        files: ['src/**/*.coffee']
        tasks: ['compile', 'test']
      ghPages:
        files: ['src/**/*.coffee', 'examples/**/*']
        tasks: ['gh-pages']
    mocha_phantomjs:
      options:
        reporter: 'list'
      all: ['test/**/*.html']
    copy:
      dist:
        files: [
          {
            src: 'egrid-core.js'
            dest: 'dist/'
          }
          {
            expand: true
            cwd: 'lib'
            src: 'dagre.js'
            dest: 'dist/'
          }
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
          {
            src: 'lib/dagre.js'
            dest: 'gh-pages/'
          }
        ]
    clean: [
      'dist'
      'egrid-core.js'
      'gh-pages'
      'js'
    ]
    bump:
      options:
        files: ['package.json', 'bower.json']
        commit: false
        createTag: false
        push: false

    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-bump'
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-mocha-phantomjs'

    grunt.registerTask 'compile', ['coffee', 'browserify']
    grunt.registerTask 'default', ['watch:scripts']
    grunt.registerTask 'dist', ['compile', 'copy:dist']
    grunt.registerTask 'gh-pages', ['compile', 'copy:ghPages']
    grunt.registerTask 'release', ['dist', 'bump']
    grunt.registerTask 'test', ['mocha_phantomjs']
