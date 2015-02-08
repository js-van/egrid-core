module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffee:
      main:
        files: [
          expand: true
          cwd: 'src/'
          src: ['**/*.coffee']
          dest: 'lib'
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
      'gh-pages':
        files: [
          expand: true
          cwd: 'examples/'
          src: ['**/*.coffee']
          dest: 'examples'
          ext: '.js'
        ]
    browserify:
      main:
        files:
          'egrid-core.js': ['lib/index.js']
        options:
          browserifyOptions:
            standalone: 'egrid.core'
      test:
        files:
          'test/egrid-core-test.js': ['test/index.js']
      'gh-pages':
        files:
          'gh-pages/egrid-core-examples.js': ['examples/index.js']
    watch:
      scripts:
        files: ['src/**/*.coffee']
        tasks: ['build:src']
      test:
        files: ['src/**/*.coffee', 'test/**/*.coffee', 'test/**/*.html']
        tasks: ['build:test', 'test']
      'gh-pages':
        files: ['src/**/*.coffee', 'examples/**/*.coffee']
        tasks: ['build:gh-pages']
    mocha_phantomjs:
      options:
        reporter: 'list'
      all: ['test/**/*.html']
    clean: [
      'egrid-core.js'
      'lib'
      'test/**/*.js'
      'examples/**/*.js'
      'gh-pages/egrid-core-examples.js'
    ]
    bump:
      options:
        files: ['package.json', 'bower.json']
        commit: false
        createTag: false
        push: false
    uglify:
      main:
        files:
          'egrid-core.min.js': ['egrid-core.js']

    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-bump'
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-mocha-phantomjs'

    grunt.registerTask 'build', ['build:main', 'build:test']
    grunt.registerTask 'build:main', ['coffee:main']
    grunt.registerTask 'build:test', ['coffee:test', 'browserify:test']
    grunt.registerTask 'build:gh-pages',
      ['coffee:gh-pages', 'browserify:gh-pages']
    grunt.registerTask 'default', ['build:main']
    grunt.registerTask 'dist', ['build:main', 'browserify:main', 'uglify:main']
    grunt.registerTask 'gh-pages', ['build:main', 'build:gh-pages']
    grunt.registerTask 'release', ['dist', 'bump']
    grunt.registerTask 'test', ['mocha_phantomjs']
