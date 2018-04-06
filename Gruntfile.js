module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';\n'
			},
			dev: {
				files: {
					'www/js/scripts.min.js': ['source/js/*.js'],
					'www/js/ltie9-head.min.js': ['source/js/ltie9-head/*.js']
				}
			},
			prod: {
				files: {
					'www/js/scripts.js': ['source/js/*.js'],
					'www/js/ltie9-head.js': ['source/js/ltie9-head/*.js']
				}
			}
		},
		uglify: {
			options: {
				preserveComments: 'some',
				beautify : {
					ascii_only : true
				}
			},
			dist: {
				files: {
					'www/js/scripts.min.js': 'www/js/scripts.js',
					'www/js/ltie9-head.min.js': 'www/js/ltie9-head.js'
				}
			}
		},
		watch: {
			html: {
				files: ['www/markup/*.html'],
				options: {
					livereload: true
				}
			},
			css: {
				files: ['www/css/*'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['source/js/*', 'source/js/ltie9-head/*'],
				tasks: ['concat:dev'],
				options: {
					livereload: true
				}
			}
		},
		parallel: {
			dev: {
			  options: {
				grunt: true
			  },
			  tasks: ['concat:dev']
			},
			prod: {
			  options: {
				grunt: true
			  },
			  tasks: ['concat:prod']
			}
		},
		clean: {
			prod: ['www/js/scripts.js','www/js/ltie9-head.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-parallel');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('dev', ['parallel:dev']);
	grunt.registerTask('prod', ['parallel:prod', 'uglify', 'clean:prod']);

	grunt.registerTask('default', 'dev');

};