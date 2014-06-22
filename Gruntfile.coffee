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

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-mocha-phantomjs'

    grunt.registerTask 'default', ['watch']
    grunt.registerTask 'compile', ['coffee', 'browserify']
    grunt.registerTask 'test', ['mocha_phantomjs']
