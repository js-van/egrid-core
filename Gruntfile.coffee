module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffee:
      src:
        files: [
          expand: true
          cwd: 'src/'
          src: ['**/*.coffee']
          dest: 'src'
          ext: '.js'
        ]
      test:
        files: [
          expand: true
          cwd: 'test/'
          src: ['**/*.coffee']
          dest: 'test'
          ext: '.js'
        ]
        options:
          bare: true
    browserify:
      src:
        files:
          'egrid-core.js': ['src/index.js']
      test:
        files:
          'test/egrid-core-test.js': ['test/index.js']
    watch:
      scripts:
        files: ['src/**/*.coffee']
        tasks: ['build:src']
      test:
        files: ['src/**/*.coffee', 'test/**/*.coffee', 'test/**/*.html']
        tasks: ['build', 'test']
      'gh-pages':
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
      'gh-pages':
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
      'egrid-core.js'
      'gh-pages'
      'src/**/*.js'
      'test/**/*.js'
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

    grunt.registerTask 'build', ['build:src', 'build:test']
    grunt.registerTask 'build:src', ['coffee:src', 'browserify:src']
    grunt.registerTask 'build:test', ['coffee:test', 'browserify:test']
    grunt.registerTask 'default', ['build:src']
    grunt.registerTask 'dist', ['build:src', 'copy:dist']
    grunt.registerTask 'gh-pages', ['build:src', 'copy:gh-pages']
    grunt.registerTask 'release', ['dist', 'bump']
    grunt.registerTask 'test', ['mocha_phantomjs']
