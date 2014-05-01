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
    watch: {
      scripts: {
        files: ['src/**/*.ts'],
        tasks: ['typescript'],
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-typescript');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('compile', ['typescript']);
};
