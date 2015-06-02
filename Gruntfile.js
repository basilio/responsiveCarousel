module.exports = function(grunt){
	grunt.initConfig({
		watch : {
			styles : {
				options : {
					nospawn : true
				},
				files : [
					"js/responsiveCarousel.js"
				],
				tasks : [ "uglify" ]
			}
		},
		uglify : {
			target : {
				options : {
					compress : true
				},
				files : {
					'js/responsiveCarousel.min.js' : ['js/responsiveCarousel.js']
				}
			},
		}
	});
	// Modules
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// Register Tasks
	grunt.registerTask("default", ['watch']);
};