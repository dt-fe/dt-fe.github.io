module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    sass: {
  		dist: {
  			files: [{
  				expand: true,
  				cwd: 'sass',
  				src: ['*.scss'],
  				dest: './css',
  				ext: '.css'
  			}]
  		}
	  },

  autoprefixer: {
      dist: {
          files: {
              'css/about.css': 'css/about.css',
              'css/common.css': 'css/common.css',
              'css/dv.css': 'css/dv.css',
              'css/home.css': 'css/home.css',
              'css/join.css': 'css/join.css',
              'css/kmd.css': 'css/kmd.css',
              'css/onedata.css': 'css/onedata.css',
              'css/sycm.css': 'css/sycm.css'
          }
      }
  },

  uglify: {
    my_target: {
      files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'build/js'
      }]
    }
  },

  cssmin: {
    target: {
      files: [{
        expand: true,
        cwd: 'css',
        src: ['*.css', '!*.min.css'],
        dest: 'build/css',
        ext: '.min.css'
      }]
    }
  },

  babel: {
       
      dist: {
          files: [{
            expand: true,
            cwd: 'src',
            src: ['**/*.js'],
            dest: 'build/js'
        }]
      }
  },

	watch: {
		scripts: {
			files: ['**/*.scss'],
			tasks: ['sass']
		}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default', ['sass']);
  grunt.registerTask('build', ['uglify', 'cssmin']);

};