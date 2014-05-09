module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescript: {
      base: {
        src: ['src/egrid-core.ts'],
        dest: 'egrid-core.js',
        options: {
          module: 'commonjs',
          declaration: true,
          target: 'es5'
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
        files: ['src/**/*.ts'],
        tasks: ['typescript'],
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('compile', ['typescript']);
  grunt.registerTask('test', ['mocha_phantomjs']);
};
